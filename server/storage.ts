import { 
  users, 
  todoLists, 
  todoItems, 
  interviewRequests,
  type User, 
  type InsertUser,
  type TodoList,
  type InsertTodoList,
  type TodoItem,
  type InsertTodoItem,
  type InterviewRequest,
  type InsertInterviewRequest
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
  
  // Todo methods
  getTodoLists(): Promise<(TodoList & { createdBy: User; assignedTo: User | null; items: TodoItem[] })[]>;
  getTodoListsByUser(userId: number): Promise<(TodoList & { createdBy: User; assignedTo: User | null; items: TodoItem[] })[]>;
  createTodoList(todoList: InsertTodoList): Promise<TodoList>;
  getTodoList(id: number): Promise<(TodoList & { createdBy: User; assignedTo: User | null; items: TodoItem[] }) | undefined>;
  createTodoItem(item: InsertTodoItem): Promise<TodoItem>;
  updateTodoItem(id: number, updates: Partial<TodoItem>): Promise<TodoItem | undefined>;
  
  // Interview request methods
  getInterviewRequests(): Promise<(InterviewRequest & { requestedBy: User; manager: User | null })[]>;
  getInterviewRequestsByManager(managerId: number): Promise<(InterviewRequest & { requestedBy: User; manager: User | null })[]>;
  getInterviewRequestsBySecretary(secretaryId: number): Promise<(InterviewRequest & { requestedBy: User; manager: User | null })[]>;
  createInterviewRequest(request: InsertInterviewRequest): Promise<InterviewRequest>;
  updateInterviewRequest(id: number, updates: Partial<InterviewRequest>): Promise<InterviewRequest | undefined>;
  
  // Analytics methods
  getUserStats(): Promise<{ totalUsers: number; activeUsers: number; pendingUsers: number }>;
  getTodoStats(): Promise<{ totalTodos: number; completedTodos: number; pendingTodos: number }>;
  getInterviewStats(): Promise<{ totalRequests: number; pendingRequests: number; approvedRequests: number }>;
  
  // Notification methods
  getUserNotifications(userId: number): Promise<any[]>;
  markNotificationAsRead(notificationId: number, userId: number): Promise<void>;
  markAllNotificationsAsRead(userId: number): Promise<void>;
  
  // Feedback methods
  createFeedback(feedbackData: any): Promise<any>;
  getAllFeedback(): Promise<any[]>;
  
  // Archive methods
  archiveItem(itemType: string, itemId: number, itemData: any, archivedById: number, reason?: string): Promise<any>;
  getArchivedItems(): Promise<any[]>;
  updateArchivedItem(archiveId: number, updates: any): Promise<any>;
  restoreArchivedItem(archiveId: number, itemType: string): Promise<void>;
  

}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, lastActiveAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role as any));
  }

  async getTodoLists(): Promise<(TodoList & { createdBy: User; assignedTo: User | null; items: TodoItem[] })[]> {
    const result = await db.query.todoLists.findMany({
      with: {
        createdBy: true,
        assignedTo: true,
        items: {
          orderBy: (items, { desc }) => [desc(items.createdAt)],
        },
      },
      orderBy: (todoLists, { desc }) => [desc(todoLists.createdAt)],
    });
    return result;
  }

  async getTodoListsByUser(userId: number): Promise<(TodoList & { createdBy: User; assignedTo: User | null; items: TodoItem[] })[]> {
    const result = await db.query.todoLists.findMany({
      where: (todoLists, { or, eq }) => or(
        eq(todoLists.createdById, userId),
        eq(todoLists.assignedToId, userId)
      ),
      with: {
        createdBy: true,
        assignedTo: true,
        items: {
          orderBy: (items, { desc }) => [desc(items.createdAt)],
        },
      },
      orderBy: (todoLists, { desc }) => [desc(todoLists.createdAt)],
    });
    return result;
  }

  async createTodoList(todoList: InsertTodoList): Promise<TodoList> {
    const [list] = await db
      .insert(todoLists)
      .values(todoList)
      .returning();
    return list;
  }

  async getTodoList(id: number): Promise<(TodoList & { createdBy: User; assignedTo: User | null; items: TodoItem[] }) | undefined> {
    const result = await db.query.todoLists.findFirst({
      where: (todoLists, { eq }) => eq(todoLists.id, id),
      with: {
        createdBy: true,
        assignedTo: true,
        items: {
          orderBy: (items, { desc }) => [desc(items.createdAt)],
        },
      },
    });
    return result || undefined;
  }

  async createTodoItem(item: InsertTodoItem): Promise<TodoItem> {
    console.log("Storage: Creating todo item with:", item);
    try {
      const [todoItem] = await db
        .insert(todoItems)
        .values({
          todoListId: item.todoListId,
          title: item.title,
          description: item.description || "",
          isCompleted: item.isCompleted || false,
          priority: item.priority || "medium",
          createdAt: new Date(),
        })
        .returning();
      console.log("Storage: Created todo item:", todoItem);
      return todoItem;
    } catch (error) {
      console.error("Storage: Error creating todo item:", error);
      throw error;
    }
  }

  async updateTodoItem(id: number, updates: Partial<TodoItem>): Promise<TodoItem | undefined> {
    const updateData = { ...updates };
    if (updates.isCompleted !== undefined) {
      updateData.completedAt = updates.isCompleted ? new Date() : null;
    }
    
    const [item] = await db
      .update(todoItems)
      .set(updateData)
      .where(eq(todoItems.id, id))
      .returning();
    return item || undefined;
  }

  async getInterviewRequests(): Promise<(InterviewRequest & { requestedBy: User; manager: User | null })[]> {
    const result = await db.query.interviewRequests.findMany({
      with: {
        requestedBy: true,
        manager: true,
      },
      orderBy: (interviewRequests, { desc }) => [desc(interviewRequests.createdAt)],
    });
    return result;
  }

  async getInterviewRequestsByManager(managerId: number): Promise<(InterviewRequest & { requestedBy: User; manager: User | null })[]> {
    const result = await db.query.interviewRequests.findMany({
      where: (interviewRequests, { eq }) => eq(interviewRequests.managerId, managerId),
      with: {
        requestedBy: true,
        manager: true,
      },
      orderBy: (interviewRequests, { desc }) => [desc(interviewRequests.createdAt)],
    });
    return result;
  }

  async getInterviewRequestsBySecretary(secretaryId: number): Promise<(InterviewRequest & { requestedBy: User; manager: User | null })[]> {
    const result = await db.query.interviewRequests.findMany({
      where: (interviewRequests, { eq }) => eq(interviewRequests.requestedById, secretaryId),
      with: {
        requestedBy: true,
        manager: true,
      },
      orderBy: (interviewRequests, { desc }) => [desc(interviewRequests.createdAt)],
    });
    return result;
  }

  async createInterviewRequest(request: InsertInterviewRequest): Promise<InterviewRequest> {
    const [interviewRequest] = await db
      .insert(interviewRequests)
      .values(request)
      .returning();
    return interviewRequest;
  }

  async updateInterviewRequest(id: number, updates: Partial<InterviewRequest>): Promise<InterviewRequest | undefined> {
    const [request] = await db
      .update(interviewRequests)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(interviewRequests.id, id))
      .returning();
    return request || undefined;
  }

  async getUserStats(): Promise<{ totalUsers: number; activeUsers: number; pendingUsers: number }> {
    const [stats] = await db
      .select({
        totalUsers: sql<number>`count(*)`,
        activeUsers: sql<number>`count(*) filter (where status = 'active')`,
        pendingUsers: sql<number>`count(*) filter (where status = 'pending')`,
      })
      .from(users);
    
    return {
      totalUsers: Number(stats.totalUsers),
      activeUsers: Number(stats.activeUsers),
      pendingUsers: Number(stats.pendingUsers),
    };
  }

  async getTodoStats(): Promise<{ totalTodos: number; completedTodos: number; pendingTodos: number }> {
    const [stats] = await db
      .select({
        totalTodos: sql<number>`count(*)`,
        completedTodos: sql<number>`count(*) filter (where is_completed = true)`,
        pendingTodos: sql<number>`count(*) filter (where is_completed = false)`,
      })
      .from(todoItems);
    
    return {
      totalTodos: Number(stats.totalTodos),
      completedTodos: Number(stats.completedTodos),
      pendingTodos: Number(stats.pendingTodos),
    };
  }

  async getInterviewStats(): Promise<{ totalRequests: number; pendingRequests: number; approvedRequests: number }> {
    const [stats] = await db
      .select({
        totalRequests: sql<number>`count(*)`,
        pendingRequests: sql<number>`count(*) filter (where status = 'pending')`,
        approvedRequests: sql<number>`count(*) filter (where status = 'approved')`,
      })
      .from(interviewRequests);
    
    return {
      totalRequests: Number(stats.totalRequests),
      pendingRequests: Number(stats.pendingRequests),
      approvedRequests: Number(stats.approvedRequests),
    };
  }

  async getUserNotifications(userId: number): Promise<any[]> {
    const { NotificationService } = await import("./notification-service");
    return await NotificationService.getUserNotifications(userId);
  }

  async markNotificationAsRead(notificationId: number, userId: number): Promise<void> {
    const { NotificationService } = await import("./notification-service");
    await NotificationService.markAsRead(notificationId, userId);
  }

  async markAllNotificationsAsRead(userId: number): Promise<void> {
    const { NotificationService } = await import("./notification-service");
    await NotificationService.markAllAsRead(userId);
  }

  async createFeedback(feedbackData: any): Promise<any> {
    const { FeedbackService } = await import("./feedback-service");
    return await FeedbackService.createFeedback(feedbackData);
  }

  async getAllFeedback(): Promise<any[]> {
    const { FeedbackService } = await import("./feedback-service");
    return await FeedbackService.getAllFeedback();
  }

  async archiveItem(itemType: string, itemId: number, itemData: any, archivedById: number, reason?: string): Promise<any> {
    const { FeedbackService } = await import("./feedback-service");
    return await FeedbackService.archiveItem(itemType, itemId, itemData, archivedById, reason);
  }

  async getArchivedItems(): Promise<any[]> {
    const { FeedbackService } = await import("./feedback-service");
    return await FeedbackService.getArchivedItems();
  }

  async updateArchivedItem(archiveId: number, updates: any): Promise<any> {
    const { FeedbackService } = await import("./feedback-service");
    return await FeedbackService.updateArchivedItem(archiveId, updates);
  }

  async restoreArchivedItem(archiveId: number, itemType: string): Promise<void> {
    const { FeedbackService } = await import("./feedback-service");
    await FeedbackService.restoreItem(archiveId, itemType);
  }


}

export const storage = new DatabaseStorage();
