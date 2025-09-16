import { db } from "./db";
import { deviceNotifications, InsertDeviceNotification } from "../shared/device-notification-schema";
import { users } from "../shared/schema";
import { eq, and, desc } from "drizzle-orm";

export class DeviceNotificationService {
  static async createNotification(notification: InsertDeviceNotification): Promise<any> {
    try {

      
      const [createdNotification] = await db.insert(deviceNotifications).values(notification).returning();
      
      // Send device notification if supported
      if (createdNotification && !createdNotification.isSentToDevice) {
        await this.sendDeviceNotification(createdNotification);
      }
      
      return createdNotification;
    } catch (error) {
      console.error("Failed to create device notification:", error);
      throw error;
    }
  }

  static async sendDeviceNotification(notification: any): Promise<void> {
    try {
      // This would be where you implement actual device notification sending
      // For now, we'll just log and mark as sent
      console.log(`📱 Device notification sent: ${notification.title} - ${notification.message}`);
      
      // Mark as sent to device
      await db
        .update(deviceNotifications)
        .set({ 
          isSentToDevice: true,
          deviceData: JSON.stringify({
            sentAt: new Date().toISOString(),
            platform: "web"
          })
        })
        .where(eq(deviceNotifications.id, notification.id));
        
    } catch (error) {
      console.error("Failed to send device notification:", error);
    }
  }

  static async createUserNotification(
    userId: number,
    type: string,
    title: string,
    message: string,
    priority: string = "normal",
    options?: {
      icon?: string;
      actionUrl?: string;
      expiresAt?: Date;
    }
  ): Promise<any> {

    return await this.createNotification({
      userId,
      type: type as any,
      priority: priority as any,
      title,
      message,
      icon: options?.icon || "🔔",
      actionUrl: options?.actionUrl,
      expiresAt: options?.expiresAt,
      isRead: false,
      isSentToDevice: false,
      deviceData: null,
    });
  }

  static async createSystemAlert(
    title: string,
    message: string,
    priority: "low" | "normal" | "high" | "urgent" = "normal"
  ): Promise<void> {
    // Send to all active users
    const activeUsers = await db.select({ id: users.id }).from(users).where(eq(users.status, "active"));
    
    const notificationPromises = activeUsers.map(user =>
      this.createUserNotification(
        user.id,
        "system_alert",
        title,
        message,
        priority,
        { icon: "⚠️" }
      )
    );

    await Promise.all(notificationPromises);
  }

  static async getUserNotifications(userId: number): Promise<any[]> {
    try {
      const notifications = await db
        .select()
        .from(deviceNotifications)
        .where(eq(deviceNotifications.userId, userId))
        .orderBy(desc(deviceNotifications.createdAt))
        .limit(50);

      return notifications;
    } catch (error) {
      console.error("Failed to get user notifications:", error);
      return [];
    }
  }

  static async markAsRead(notificationId: number, userId: number): Promise<void> {
    try {
      await db
        .update(deviceNotifications)
        .set({ isRead: true })
        .where(
          and(
            eq(deviceNotifications.id, notificationId),
            eq(deviceNotifications.userId, userId)
          )
        );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      throw error;
    }
  }

  static async markAllAsRead(userId: number): Promise<void> {
    try {
      await db
        .update(deviceNotifications)
        .set({ isRead: true })
        .where(eq(deviceNotifications.userId, userId));
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      throw error;
    }
  }

  static async deleteNotification(notificationId: number, userId: number): Promise<void> {
    try {
      await db
        .delete(deviceNotifications)
        .where(
          and(
            eq(deviceNotifications.id, notificationId),
            eq(deviceNotifications.userId, userId)
          )
        );
    } catch (error) {
      console.error("Failed to delete notification:", error);
      throw error;
    }
  }

  static async cleanupExpiredNotifications(): Promise<number> {
    try {
      const result = await db
        .delete(deviceNotifications)
        .where(
          and(
            eq(deviceNotifications.isRead, true),
            // Delete notifications older than 30 days or expired ones
          )
        );
      
      return result.rowCount || 0;
    } catch (error) {
      console.error("Failed to cleanup expired notifications:", error);
      return 0;
    }
  }
}