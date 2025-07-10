import { db } from "./db";
import { notifications, InsertNotification } from "../shared/notification-schema";
import { users } from "../shared/schema";
import { eq, and } from "drizzle-orm";

// Import broadcast function from routes
let broadcastNotification: ((userId: number, notification: any) => void) | null = null;

export function setBroadcastFunction(fn: (userId: number, notification: any) => void) {
  broadcastNotification = fn;
}

export class NotificationService {
  static async createNotification(notification: InsertNotification): Promise<void> {
    try {
      const [createdNotification] = await db.insert(notifications).values(notification).returning();
      
      // Broadcast real-time notification if WebSocket is available
      if (broadcastNotification && createdNotification) {
        broadcastNotification(notification.userId, {
          id: createdNotification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          isRead: notification.isRead,
          createdAt: createdNotification.createdAt,
          data: notification.data
        });
      }
    } catch (error) {
      console.error("Failed to create notification:", error);
    }
  }

  static async createUserNotification(
    userId: number,
    type: string,
    title: string,
    message: string,
    data?: any
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: type as any,
      title,
      message,
      isRead: false,
      data: data ? JSON.stringify(data) : null,
    });
  }

  static async createSystemNotification(
    title: string,
    message: string,
    data?: any
  ): Promise<void> {
    // Send to all active users
    const activeUsers = await db.select({ id: users.id }).from(users).where(eq(users.status, "active"));
    
    const notificationPromises = activeUsers.map(user =>
      this.createNotification({
        userId: user.id,
        type: "system_update",
        title,
        message,
        isRead: false,
        data: data ? JSON.stringify(data) : null,
      })
    );

    await Promise.all(notificationPromises);
  }

  static async notifyUserCreated(newUserId: number, createdByUserId: number): Promise<void> {
    // Get user details
    const [newUser, createdByUser] = await Promise.all([
      db.select().from(users).where(eq(users.id, newUserId)).then(rows => rows[0]),
      db.select().from(users).where(eq(users.id, createdByUserId)).then(rows => rows[0])
    ]);

    if (!newUser || !createdByUser) return;

    // Notify admins about new user
    const admins = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin"));
    
    const notificationPromises = admins.map(admin =>
      this.createUserNotification(
        admin.id,
        "user_created",
        "New User Created",
        `${createdByUser.firstName} ${createdByUser.lastName} created a new ${newUser.role} account for ${newUser.firstName} ${newUser.lastName}`,
        { newUserId, createdByUserId }
      )
    );

    await Promise.all(notificationPromises);
  }

  static async notifyInterviewRequest(requestId: number, requestedByUserId: number, managerId?: number): Promise<void> {
    const requestedByUser = await db.select().from(users).where(eq(users.id, requestedByUserId)).then(rows => rows[0]);
    if (!requestedByUser) return;

    // Notify managers and admins
    const managerAdminUsers = await db.select({ id: users.id }).from(users).where(
      and(
        eq(users.status, "active"),
        // Use SQL OR condition for role
      )
    );

    // Get all managers and admins
    const allManagers = await db.select({ id: users.id }).from(users).where(eq(users.role, "manager"));
    const allAdmins = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin"));
    const targetUsers = [...allManagers, ...allAdmins];

    const notificationPromises = targetUsers.map(user =>
      this.createUserNotification(
        user.id,
        "interview_request",
        "New Interview Request",
        `${requestedByUser.firstName} ${requestedByUser.lastName} has submitted a new interview request`,
        { requestId, requestedByUserId, managerId }
      )
    );

    await Promise.all(notificationPromises);
  }

  static async notifyInterviewStatus(requestId: number, status: string, requestedByUserId: number, updatedByUserId: number): Promise<void> {
    const [requestedByUser, updatedByUser] = await Promise.all([
      db.select().from(users).where(eq(users.id, requestedByUserId)).then(rows => rows[0]),
      db.select().from(users).where(eq(users.id, updatedByUserId)).then(rows => rows[0])
    ]);

    if (!requestedByUser || !updatedByUser) return;

    const notificationType = status === "approved" ? "interview_approved" : "interview_rejected";
    const title = status === "approved" ? "Interview Request Approved" : "Interview Request Rejected";
    const message = `Your interview request has been ${status} by ${updatedByUser.firstName} ${updatedByUser.lastName}`;

    await this.createUserNotification(
      requestedByUserId,
      notificationType,
      title,
      message,
      { requestId, status, updatedByUserId }
    );
  }

  static async notifyTodoAssigned(todoListId: number, assignedToUserId: number, createdByUserId: number): Promise<void> {
    const [assignedToUser, createdByUser] = await Promise.all([
      db.select().from(users).where(eq(users.id, assignedToUserId)).then(rows => rows[0]),
      db.select().from(users).where(eq(users.id, createdByUserId)).then(rows => rows[0])
    ]);

    if (!assignedToUser || !createdByUser) return;

    await this.createUserNotification(
      assignedToUserId,
      "todo_assigned",
      "New Todo List Assigned",
      `${createdByUser.firstName} ${createdByUser.lastName} has assigned you a new todo list`,
      { todoListId, createdByUserId }
    );
  }

  static async notifyTodoCompleted(todoListId: number, completedByUserId: number, createdByUserId: number): Promise<void> {
    if (completedByUserId === createdByUserId) return; // Don't notify yourself

    const [completedByUser, createdByUser] = await Promise.all([
      db.select().from(users).where(eq(users.id, completedByUserId)).then(rows => rows[0]),
      db.select().from(users).where(eq(users.id, createdByUserId)).then(rows => rows[0])
    ]);

    if (!completedByUser || !createdByUser) return;

    await this.createUserNotification(
      createdByUserId,
      "todo_completed",
      "Todo List Completed",
      `${completedByUser.firstName} ${completedByUser.lastName} has completed a todo list you assigned`,
      { todoListId, completedByUserId }
    );
  }

  static async getUserNotifications(userId: number): Promise<any[]> {
    const userNotifications = await db
      .select({
        id: notifications.id,
        type: notifications.type,
        title: notifications.title,
        message: notifications.message,
        isRead: notifications.isRead,
        createdAt: notifications.createdAt,
        data: notifications.data,
      })
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(notifications.createdAt);

    return userNotifications.reverse(); // Most recent first
  }

  static async markAsRead(notificationId: number, userId: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
  }

  static async markAllAsRead(userId: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  }

  static async deleteNotification(notificationId: number, userId: number): Promise<void> {
    await db
      .delete(notifications)
      .where(and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      ));
  }
}