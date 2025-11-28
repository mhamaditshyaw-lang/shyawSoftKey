import { 
  users, 
  todoLists, 
  todoItems, 
  reminders,
  interviewRequests,
  interviewComments,
  operationalData,
  weeklyMeetings,
  weeklyMeetingTasks,
  departmentTaskProgress,
  weeklyMeetingArchive,
  type User, 
  type InsertUser,
  type TodoList,
  type InsertTodoList,
  type TodoItem,
  type InsertTodoItem,
  type Reminder,
  type InsertReminder,
  type InterviewRequest,
  type InsertInterviewRequest,
  type InterviewComment,
  type InsertInterviewComment
} from "@shared/schema";

import {
  feedback,
  archivedItems,
  type Feedback,
  type InsertFeedback,
  type ArchivedItem,
  type InsertArchivedItem,
} from "@shared/feedback-schema";
import { db, executeWithRetry } from "./db";
import { eq, desc, and, or, sql, inArray } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(accessibleUserIds?: number[]): Promise<User[]>;
  getUsersByRole(role: string): Promise<User[]>;
  updateUserPageAccess(userId: number, pagePermissions: Record<string, boolean>): Promise<User>;
  getUserPageAccess(userId: number): Promise<Record<string, boolean>>;
  
  // Manager-staff relationship methods
  getStaffForManager(managerId: number): Promise<User[]>;
  assignStaffToManager(staffId: number, managerId: number): Promise<User | undefined>;
  removeStaffFromManager(staffId: number): Promise<User | undefined>;
  getManagerForStaff(staffId: number): Promise<User | undefined>;
  getAccessibleUserIds(userId: number, role: string): Promise<number[]>;
  
  // Todo methods
  getTodoLists(accessibleUserIds?: number[]): Promise<(TodoList & { createdBy: User; assignedTo: User | null; items: TodoItem[] })[]>;
  getTodoListsByUser(userId: number): Promise<(TodoList & { createdBy: User; assignedTo: User | null; items: TodoItem[] })[]>;
  createTodoList(todoList: InsertTodoList): Promise<TodoList>;
  getTodoList(id: number): Promise<(TodoList & { createdBy: User; assignedTo: User | null; items: TodoItem[] }) | undefined>;
  deleteTodoList(id: number): Promise<boolean>;
  updateTodoList(id: number, updates: Partial<TodoList>): Promise<TodoList | undefined>;
  createTodoItem(item: InsertTodoItem): Promise<TodoItem>;
  getTodoItem(id: number): Promise<TodoItem | undefined>;
  updateTodoItem(id: number, updates: Partial<TodoItem>): Promise<TodoItem | undefined>;
  deleteTodoItem(id: number): Promise<boolean>;
  deleteAllTodoItems(todoListId: number): Promise<boolean>;
  getTodoStatsByUser(userId: number): Promise<{ totalTodos: number; completedTodos: number; pendingTodos: number }>;
  
  // Reminder methods
  getReminders(userId: number): Promise<Reminder[]>;
  getRemindersByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Reminder[]>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  updateReminder(id: number, updates: Partial<Reminder>): Promise<Reminder | undefined>;
  deleteReminder(id: number): Promise<boolean>;
  
  // Interview request methods
  getInterviewRequests(accessibleUserIds?: number[], includeUnassigned?: boolean): Promise<(InterviewRequest & { requestedBy: User; manager: User | null; actionTakenBy: User | null })[]>;
  getInterviewRequestsByManager(managerId: number): Promise<(InterviewRequest & { requestedBy: User; manager: User | null; actionTakenBy: User | null })[]>;
  getInterviewRequestsByUser(userId: number): Promise<(InterviewRequest & { requestedBy: User; manager: User | null; actionTakenBy: User | null })[]>;
  createInterviewRequest(request: InsertInterviewRequest): Promise<InterviewRequest>;
  updateInterviewRequest(id: number, updates: Partial<InterviewRequest>): Promise<InterviewRequest | undefined>;

  // Interview comment methods
  getInterviewComments(interviewRequestId: number): Promise<(InterviewComment & { author: User })[]>;
  createInterviewComment(comment: InsertInterviewComment): Promise<InterviewComment>;
  
  // Analytics methods
  getUserStats(): Promise<{ totalUsers: number; activeUsers: number; pendingUsers: number }>;
  getTodoStats(): Promise<{ totalTodos: number; completedTodos: number; pendingTodos: number }>;
  getInterviewStats(): Promise<{ totalRequests: number; pendingRequests: number; approvedRequests: number }>;
  

  
  // Feedback methods
  createFeedback(feedbackData: any): Promise<any>;
  getAllFeedback(): Promise<any[]>;
  getFeedbackByUser(userId: number): Promise<any[]>;
  deleteFeedback(feedbackId: number): Promise<boolean>;
  
  // Feedback type methods
  createFeedbackType(feedbackTypeData: any): Promise<any>;
  getAllFeedbackTypes(): Promise<any[]>;
  updateFeedbackType(typeId: number, updates: any): Promise<any>;
  deleteFeedbackType(typeId: number): Promise<void>;
  
  // Archive methods
  archiveItem(itemType: string, itemId: number, itemData: any, archivedById: number, reason?: string): Promise<any>;
  getArchivedItems(): Promise<any[]>;
  updateArchivedItem(archiveId: number, updates: any): Promise<any>;
  restoreArchivedItem(archiveId: number, itemType: string): Promise<void>;
  deleteArchivedItem(archiveId: number): Promise<boolean>;
  
  // Operational data methods
  createOperationalData(data: any): Promise<any>;
  getOperationalData(): Promise<any[]>;
  deleteOperationalData(id: number): Promise<boolean>;
  clearAllOperationalData(): Promise<boolean>;

  // Weekly Meeting methods
  createWeeklyMeeting(data: any): Promise<any>;
  getWeeklyMeetings(): Promise<any[]>;
  getWeeklyMeeting(id: number): Promise<any>;
  createWeeklyMeetingTask(data: any): Promise<any>;
  getWeeklyMeetingTasks(meetingId: number): Promise<any[]>;
  updateDepartmentTaskProgress(taskId: number, departmentHeadId: number, updates: any): Promise<any>;
  getWeeklyMeetingArchive(meetingId: number): Promise<any[]>;
  archiveWeeklyMeeting(meetingId: number, archivedById: number, resultsData: any): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    return await executeWithRetry(async () => {
      const result = await db.select().from(users).where(eq(users.id, id));
      return (result as User[])[0] || undefined;
    });
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return await executeWithRetry(async () => {
      const result = await db.select().from(users).where(eq(users.username, username));
      return (result as User[])[0] || undefined;
    });
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return await executeWithRetry(async () => {
      const result = await db.select().from(users).where(eq(users.email, email));
      return (result as User[])[0] || undefined;
    });
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    return await executeWithRetry(async () => {
      const result = await db
        .insert(users)
        .values(insertUser)
        .returning();
      return (result as User[])[0];
    });
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    return await executeWithRetry(async () => {
      const result = await db
        .update(users)
        .set({ ...updates, lastActiveAt: new Date() })
        .where(eq(users.id, id))
        .returning();
      return (result as User[])[0] || undefined;
    });
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      // Start a transaction to ensure all operations succeed or fail together
      return await db.transaction(async (tx) => {
        // Update any todo lists assigned to this user to remove the assignment
        await tx
          .update(todoLists)
          .set({ assignedToId: null })
          .where(eq(todoLists.assignedToId, id));

        // Update any todo lists created by this user to assign to admin (id: 1)
        await tx
          .update(todoLists)
          .set({ createdById: 1 })
          .where(eq(todoLists.createdById, id));

        // Update any interview requests where this user is the manager
        await tx
          .update(interviewRequests)
          .set({ managerId: null })
          .where(eq(interviewRequests.managerId, id));

        // Update interview requests requested by this user to assign to admin
        await tx
          .update(interviewRequests)
          .set({ requestedById: 1 })
          .where(eq(interviewRequests.requestedById, id));

        // Delete related data first
        await tx.delete(feedback).where(eq(feedback.submittedById, id));
        await tx.delete(archivedItems).where(eq(archivedItems.archivedById, id));

        // Finally, delete the user
        const result = await tx
          .delete(users)
          .where(eq(users.id, id))
          .returning();
        
        return (result as User[]).length > 0;
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }

  async getAllUsers(accessibleUserIds?: number[]): Promise<User[]> {
    return await executeWithRetry(async () => {
      if (accessibleUserIds && accessibleUserIds.length > 0) {
        return await db.select().from(users).where(inArray(users.id, accessibleUserIds)).orderBy(desc(users.createdAt)) as User[];
      }
      return await db.select().from(users).orderBy(desc(users.createdAt)) as User[];
    });
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await executeWithRetry(async () => {
      return await db.select().from(users).where(eq(users.role, role as any)) as User[];
    });
  }

  async updateUserPageAccess(userId: number, pagePermissions: Record<string, boolean>): Promise<User> {
    return await executeWithRetry(async () => {
      const user = await this.getUser(userId);
      if (!user) {
        throw new Error(`User with id ${userId} not found`);
      }

      const currentPermissions = (user.permissions as Record<string, any>) || {};
      const updatedPermissions = {
        ...currentPermissions,
        ...pagePermissions,
      };

      const result = await db
        .update(users)
        .set({ 
          permissions: updatedPermissions,
          lastActiveAt: new Date()
        })
        .where(eq(users.id, userId))
        .returning();

      const updatedUser = (result as User[])[0];
      if (!updatedUser) {
        throw new Error(`Failed to update user ${userId}`);
      }

      return updatedUser;
    });
  }

  async getUserPageAccess(userId: number): Promise<Record<string, boolean>> {
    return await executeWithRetry(async () => {
      const user = await this.getUser(userId);
      if (!user) {
        return {};
      }

      const permissions = (user.permissions as Record<string, any>) || {};
      
      const pagePermissions: Record<string, boolean> = {};
      Object.keys(permissions).forEach(key => {
        if (key.startsWith('canView')) {
          pagePermissions[key] = Boolean(permissions[key]);
        }
      });

      return pagePermissions;
    });
  }

  async getStaffForManager(managerId: number): Promise<User[]> {
    return await executeWithRetry(async () => {
      const result = await db.select().from(users).where(eq(users.managerId, managerId));
      return (result as User[]);
    });
  }

  async assignStaffToManager(staffId: number, managerId: number): Promise<User | undefined> {
    return await executeWithRetry(async () => {
      const result = await db
        .update(users)
        .set({ managerId, lastActiveAt: new Date() })
        .where(eq(users.id, staffId))
        .returning();
      return (result as User[])[0] || undefined;
    });
  }

  async removeStaffFromManager(staffId: number): Promise<User | undefined> {
    return await executeWithRetry(async () => {
      const result = await db
        .update(users)
        .set({ managerId: null, lastActiveAt: new Date() })
        .where(eq(users.id, staffId))
        .returning();
      return (result as User[])[0] || undefined;
    });
  }

  async getManagerForStaff(staffId: number): Promise<User | undefined> {
    return await executeWithRetry(async () => {
      const staff = await this.getUser(staffId);
      if (!staff || !staff.managerId) {
        return undefined;
      }
      return await this.getUser(staff.managerId);
    });
  }

  async getAccessibleUserIds(userId: number, role: string): Promise<number[]> {
    return await executeWithRetry(async () => {
      // Admins can see all users across all departments
      if (role === 'admin') {
        const allUsers = await db.select({ id: users.id }).from(users);
        return allUsers.map(u => u.id);
      }

      // Managers, office staff, security, secretary can see all departments
      if (['manager', 'office', 'office_team', 'security', 'secretary'].includes(role)) {
        const allUsers = await db.select({ id: users.id }).from(users);
        return allUsers.map(u => u.id);
      }

      // Employees can only see their own department
      const currentUser = await this.getUser(userId);
      if (!currentUser) {
        return [userId];
      }

      // If user has no department, they can only see themselves
      if (!currentUser.department) {
        return [userId];
      }

      // Employees can see only users in their own department
      const departmentUsers = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.department, currentUser.department));

      return departmentUsers.map(u => u.id);
    });
  }

  async getTodoLists(accessibleUserIds?: number[]): Promise<(TodoList & { createdBy: User; assignedTo: User | null; items: TodoItem[] })[]> {
    return await executeWithRetry(async () => {
      let todoListsResult;
      
      if (accessibleUserIds && accessibleUserIds.length > 0) {
        todoListsResult = await db.query.todoLists.findMany({
          where: (todoLists, { or, inArray }) => or(
            inArray(todoLists.createdById, accessibleUserIds),
            inArray(todoLists.assignedToId, accessibleUserIds)
          ),
          with: {
            createdBy: true,
            assignedTo: true,
          },
          orderBy: (todoLists, { desc }) => [desc(todoLists.createdAt)],
        });
      } else {
        todoListsResult = await db.query.todoLists.findMany({
          with: {
            createdBy: true,
            assignedTo: true,
          },
          orderBy: (todoLists, { desc }) => [desc(todoLists.createdAt)],
        });
      }
      
      // Manually fetch items with all columns using raw SQL
      const result = await Promise.all(
        todoListsResult.map(async (list: any) => {
          const items = await db.select().from(todoItems).where(eq(todoItems.todoListId, list.id)).orderBy(desc(todoItems.createdAt));
          return {
            id: list.id,
            title: list.title,
            description: list.description,
            createdById: list.createdById,
            assignedToId: list.assignedToId,
            priority: list.priority,
            createdAt: list.createdAt,
            createdBy: list.createdBy as User,
            assignedTo: (list.assignedTo || null) as User | null,
            items: (items as TodoItem[]),
          } as TodoList & { createdBy: User; assignedTo: User | null; items: TodoItem[] };
        })
      );
      
      return result as (TodoList & { createdBy: User; assignedTo: User | null; items: TodoItem[] })[];
    });
  }

  async getTodoListsByUser(userId: number): Promise<(TodoList & { createdBy: User; assignedTo: User | null; items: TodoItem[] })[]> {
    return await executeWithRetry(async () => {
      const todoListsResult = await db.query.todoLists.findMany({
        where: (todoLists, { or, eq }) => or(
          eq(todoLists.createdById, userId),
          eq(todoLists.assignedToId, userId)
        ),
        with: {
          createdBy: true,
          assignedTo: true,
        },
        orderBy: (todoLists, { desc }) => [desc(todoLists.createdAt)],
      });
      
      const result = await Promise.all(
        todoListsResult.map(async (list: any) => {
          const items = await db.select().from(todoItems).where(eq(todoItems.todoListId, list.id)).orderBy(desc(todoItems.createdAt));
          return {
            id: list.id,
            title: list.title,
            description: list.description,
            createdById: list.createdById,
            assignedToId: list.assignedToId,
            priority: list.priority,
            createdAt: list.createdAt,
            createdBy: list.createdBy as User,
            assignedTo: (list.assignedTo || null) as User | null,
            items: (items as TodoItem[]),
          } as TodoList & { createdBy: User; assignedTo: User | null; items: TodoItem[] };
        })
      );
      return result as (TodoList & { createdBy: User; assignedTo: User | null; items: TodoItem[] })[];
    });
  }

  async createTodoList(todoList: InsertTodoList): Promise<TodoList> {
    return await executeWithRetry(async () => {
      const result = await db
        .insert(todoLists)
        .values(todoList)
        .returning();
      return (result as TodoList[])[0];
    });
  }

  async getTodoList(id: number): Promise<(TodoList & { createdBy: User; assignedTo: User | null; items: TodoItem[] }) | undefined> {
    return await executeWithRetry(async () => {
      const list = await db.query.todoLists.findFirst({
        where: (todoLists, { eq }) => eq(todoLists.id, id),
        with: {
          createdBy: true,
          assignedTo: true,
        },
      });
      
      if (!list) return undefined;
      
      const items = await db.select().from(todoItems).where(eq(todoItems.todoListId, id)).orderBy(desc(todoItems.createdAt));
      const typedList = list as any;
      return {
        id: typedList.id,
        title: typedList.title,
        description: typedList.description,
        createdById: typedList.createdById,
        assignedToId: typedList.assignedToId,
        priority: typedList.priority,
        createdAt: typedList.createdAt,
        createdBy: typedList.createdBy as User,
        assignedTo: (typedList.assignedTo || null) as User | null,
        items: (items as TodoItem[]),
      } as TodoList & { createdBy: User; assignedTo: User | null; items: TodoItem[] };
    });
  }

  async createTodoItem(item: InsertTodoItem): Promise<TodoItem> {
    console.log("Storage: Creating todo item with:", item);
    try {
      const result = await db
        .insert(todoItems)
        .values({
          todoListId: item.todoListId,
          title: item.title,
          description: item.description || "",
          isCompleted: item.isCompleted || false,
          priority: item.priority || "medium",
        })
        .returning();
      const todoItem = (result as TodoItem[])[0];
      console.log("Storage: Created todo item:", todoItem);
      return todoItem;
    } catch (error) {
      console.error("Storage: Error creating todo item:", error);
      throw error;
    }
  }

  async getTodoItem(id: number): Promise<TodoItem | undefined> {
    try {
      const result = await db
        .select()
        .from(todoItems)
        .where(eq(todoItems.id, id));
      return (result as TodoItem[])[0] || undefined;
    } catch (error) {
      console.error("Storage: Error getting todo item:", error);
      return undefined;
    }
  }

  async updateTodoItem(id: number, updates: Partial<TodoItem>): Promise<TodoItem | undefined> {
    return await executeWithRetry(async () => {
      const updateData = { ...updates };
      if (updates.isCompleted !== undefined) {
        updateData.completedAt = updates.isCompleted ? new Date() : null;
      }
      
      const result = await db
        .update(todoItems)
        .set(updateData)
        .where(eq(todoItems.id, id))
        .returning();
      return (result as TodoItem[])[0] || undefined;
    });
  }

  async deleteTodoItem(id: number): Promise<boolean> {
    try {
      await db
        .delete(todoItems)
        .where(eq(todoItems.id, id));
      return true;
    } catch (error) {
      console.error("Storage: Error deleting todo item:", error);
      return false;
    }
  }

  async deleteAllTodoItems(todoListId: number): Promise<boolean> {
    try {
      await db
        .delete(todoItems)
        .where(eq(todoItems.todoListId, todoListId));
      return true;
    } catch (error) {
      console.error("Storage: Error deleting all todo items:", error);
      return false;
    }
  }

  async deleteTodoList(id: number): Promise<boolean> {
    try {
      // Use a transaction to ensure consistency and defensive deletion
      return await db.transaction(async (tx) => {
        // First check if the list exists
        const existingList = await tx.select({ id: todoLists.id })
          .from(todoLists)
          .where(eq(todoLists.id, id));
        
        if (existingList.length === 0) {
          return false; // List not found
        }

        // Delete all associated items first (defensive approach)
        await tx.delete(todoItems).where(eq(todoItems.todoListId, id));
        
        // Then delete the list
        const result = await tx.delete(todoLists).where(eq(todoLists.id, id)).returning();
        
        return result.length > 0;
      });
    } catch (error) {
      console.error("Storage: Error deleting todo list:", error);
      // Re-throw the error so the route can handle it properly (500 vs 404)
      throw error;
    }
  }

  async updateTodoList(id: number, updates: Partial<TodoList>): Promise<TodoList | undefined> {
    return await executeWithRetry(async () => {
      try {
        const result = await db
          .update(todoLists)
          .set(updates)
          .where(eq(todoLists.id, id))
          .returning();
        return (result as TodoList[])[0] || undefined;
      } catch (error) {
        console.error("Storage: Error updating todo list:", error);
        return undefined;
      }
    });
  }

  async getInterviewRequests(accessibleUserIds?: number[], includeUnassigned?: boolean): Promise<(InterviewRequest & { requestedBy: User; manager: User | null; actionTakenBy: User | null })[]> {
    if (accessibleUserIds && accessibleUserIds.length > 0) {
      const result = await db.query.interviewRequests.findMany({
        where: (interviewRequests, { inArray, or, and, isNotNull }) => {
          return or(
            inArray(interviewRequests.requestedById, accessibleUserIds),
            and(
              isNotNull(interviewRequests.managerId),
              inArray(interviewRequests.managerId, accessibleUserIds)
            )
          );
        },
        with: {
          requestedBy: true,
          manager: true,
          actionTakenBy: true,
        },
        orderBy: (interviewRequests, { desc }) => [desc(interviewRequests.createdAt)],
      });
      return (result as any[]) as (InterviewRequest & { requestedBy: User; manager: User | null; actionTakenBy: User | null })[];
    }
    
    const result = await db.query.interviewRequests.findMany({
      with: {
        requestedBy: true,
        manager: true,
        actionTakenBy: true,
      },
      orderBy: (interviewRequests, { desc }) => [desc(interviewRequests.createdAt)],
    });
    return (result as any[]) as (InterviewRequest & { requestedBy: User; manager: User | null; actionTakenBy: User | null })[];
  }

  async getInterviewRequestsByManager(managerId: number): Promise<(InterviewRequest & { requestedBy: User; manager: User | null; actionTakenBy: User | null })[]> {
    const result = await db.query.interviewRequests.findMany({
      where: (interviewRequests, { eq }) => eq(interviewRequests.managerId, managerId),
      with: {
        requestedBy: true,
        manager: true,
        actionTakenBy: true,
      },
      orderBy: (interviewRequests, { desc }) => [desc(interviewRequests.createdAt)],
    });
    return (result as any[]) as (InterviewRequest & { requestedBy: User; manager: User | null; actionTakenBy: User | null })[];
  }

  async getInterviewRequestsByUser(userId: number): Promise<(InterviewRequest & { requestedBy: User; manager: User | null; actionTakenBy: User | null })[]> {
    const result = await db.query.interviewRequests.findMany({
      where: (interviewRequests, { eq }) => eq(interviewRequests.requestedById, userId),
      with: {
        requestedBy: true,
        manager: true,
        actionTakenBy: true,
      },
      orderBy: (interviewRequests, { desc }) => [desc(interviewRequests.createdAt)],
    });
    return (result as any[]) as (InterviewRequest & { requestedBy: User; manager: User | null; actionTakenBy: User | null })[];
  }

  async getInterviewRequest(id: number): Promise<(InterviewRequest & { requestedBy: User; manager: User | null; actionTakenBy: User | null }) | undefined> {
    const result = await db.query.interviewRequests.findFirst({
      where: (interviewRequests, { eq }) => eq(interviewRequests.id, id),
      with: {
        requestedBy: true,
        manager: true,
        actionTakenBy: true,
      },
    });
    return (result as any) as (InterviewRequest & { requestedBy: User; manager: User | null; actionTakenBy: User | null }) | undefined;
  }

  async createInterviewRequest(request: InsertInterviewRequest): Promise<InterviewRequest> {
    const result = await db
      .insert(interviewRequests)
      .values(request)
      .returning();
    return (result as InterviewRequest[])[0];
  }

  async updateInterviewRequest(id: number, updates: Partial<InterviewRequest>): Promise<InterviewRequest | undefined> {
    return await executeWithRetry(async () => {
      const result = await db
        .update(interviewRequests)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(interviewRequests.id, id))
        .returning();
      return (result as InterviewRequest[])[0] || undefined;
    });
  }

  // Interview comment methods
  async getInterviewComments(interviewRequestId: number): Promise<(InterviewComment & { author: User })[]> {
    return await executeWithRetry(async () => {
      const result = await db
        .select({
          id: interviewComments.id,
          comment: interviewComments.comment,
          interviewRequestId: interviewComments.interviewRequestId,
          authorId: interviewComments.authorId,
          createdAt: interviewComments.createdAt,
          author: {
            id: users.id,
            username: users.username,
            role: users.role,
            firstName: users.firstName,
            lastName: users.lastName,
          }
        })
        .from(interviewComments)
        .innerJoin(users, eq(interviewComments.authorId, users.id))
        .where(eq(interviewComments.interviewRequestId, interviewRequestId))
        .orderBy(desc(interviewComments.createdAt));
      
      return result as any;
    });
  }

  async createInterviewComment(comment: InsertInterviewComment): Promise<InterviewComment> {
    return await executeWithRetry(async () => {
      const result = await db
        .insert(interviewComments)
        .values(comment)
        .returning();
      return (result as InterviewComment[])[0];
    });
  }

  async getUserStats(): Promise<{ totalUsers: number; activeUsers: number; pendingUsers: number }> {
    return await executeWithRetry(async () => {
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
    });
  }

  async getTodoStats(): Promise<{ totalTodos: number; completedTodos: number; pendingTodos: number }> {
    return await executeWithRetry(async () => {
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
    });
  }

  async getTodoStatsByUser(userId: number): Promise<{ totalTodos: number; completedTodos: number; pendingTodos: number }> {
    return await executeWithRetry(async () => {
      const [stats] = await db
        .select({
          totalTodos: sql<number>`count(*)`,
          completedTodos: sql<number>`count(*) filter (where is_completed = true)`,
          pendingTodos: sql<number>`count(*) filter (where is_completed = false)`,
        })
        .from(todoItems)
        .innerJoin(todoLists, eq(todoItems.todoListId, todoLists.id))
        .where(
          or(
            eq(todoLists.createdById, userId),
            eq(todoLists.assignedToId, userId)
          )
        );
      
      return {
        totalTodos: Number(stats.totalTodos),
        completedTodos: Number(stats.completedTodos),
        pendingTodos: Number(stats.pendingTodos),
      };
    });
  }

  // Reminder methods implementation
  async getReminders(userId: number): Promise<Reminder[]> {
    return await executeWithRetry(async () => {
      const results = await db.select().from(reminders).where(eq(reminders.createdById, userId)).orderBy(desc(reminders.reminderDate));
      return results;
    });
  }

  async getRemindersByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Reminder[]> {
    return await executeWithRetry(async () => {
      const results = await db
        .select()
        .from(reminders)
        .where(
          and(
            eq(reminders.createdById, userId),
            sql`${reminders.reminderDate} >= ${startDate}`,
            sql`${reminders.reminderDate} < ${endDate}`
          )
        )
        .orderBy(reminders.reminderDate);
      return results;
    });
  }

  async createReminder(reminder: InsertReminder): Promise<Reminder> {
    return await executeWithRetry(async () => {
      const [newReminder] = await db
        .insert(reminders)
        .values(reminder)
        .returning();
      return newReminder;
    });
  }

  async updateReminder(id: number, updates: Partial<Reminder>): Promise<Reminder | undefined> {
    return await executeWithRetry(async () => {
      const [updatedReminder] = await db
        .update(reminders)
        .set(updates)
        .where(eq(reminders.id, id))
        .returning();
      return updatedReminder || undefined;
    });
  }

  async deleteReminder(id: number): Promise<boolean> {
    return await executeWithRetry(async () => {
      try {
        const result = await db
          .delete(reminders)
          .where(eq(reminders.id, id));
        return (result.rowCount || 0) > 0;
      } catch (error) {
        console.error("Storage: Error deleting reminder:", error);
        return false;
      }
    });
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

  async createFeedbackType(feedbackTypeData: any): Promise<any> {
    const { FeedbackService } = await import("./feedback-service");
    return await FeedbackService.createFeedbackType(feedbackTypeData);
  }

  async getAllFeedbackTypes(): Promise<any[]> {
    const { FeedbackService } = await import("./feedback-service");
    return await FeedbackService.getAllFeedbackTypes();
  }

  async updateFeedbackType(typeId: number, updates: any): Promise<any> {
    const { FeedbackService } = await import("./feedback-service");
    return await FeedbackService.updateFeedbackType(typeId, updates);
  }

  async deleteFeedbackType(typeId: number): Promise<void> {
    const { FeedbackService } = await import("./feedback-service");
    await FeedbackService.deleteFeedbackType(typeId);
  }

  async getAllFeedback(): Promise<any[]> {
    try {
      const { FeedbackService } = await import("./feedback-service");
      const feedback = await FeedbackService.getAllFeedback();
      console.log("Storage getAllFeedback result:", feedback?.length || 0, "items");
      return feedback;
    } catch (error) {
      console.error("Storage getAllFeedback error:", error);
      throw error;
    }
  }

  async getFeedbackByUser(userId: number): Promise<any[]> {
    try {
      const { FeedbackService } = await import("./feedback-service");
      const feedback = await FeedbackService.getFeedbackByUser(userId);
      console.log("Storage getFeedbackByUser result for user", userId, ":", feedback?.length || 0, "items");
      return feedback;
    } catch (error) {
      console.error("Storage getFeedbackByUser error:", error);
      throw error;
    }
  }

  async getFeedbackByAccessibleUsers(accessibleUserIds: number[]): Promise<any[]> {
    try {
      const { FeedbackService } = await import("./feedback-service");
      const feedback = await FeedbackService.getFeedbackByAccessibleUsers(accessibleUserIds);
      console.log("Storage getFeedbackByAccessibleUsers result:", feedback?.length || 0, "items");
      return feedback;
    } catch (error) {
      console.error("Storage getFeedbackByAccessibleUsers error:", error);
      throw error;
    }
  }

  async createFeedback(feedbackData: any): Promise<any> {
    try {
      const { FeedbackService } = await import("./feedback-service");
      const feedback = await FeedbackService.createFeedback(feedbackData);
      console.log("Storage createFeedback result:", feedback);
      return feedback;
    } catch (error) {
      console.error("Storage createFeedback error:", error);
      throw error;
    }
  }

  async deleteFeedback(feedbackId: number): Promise<boolean> {
    try {
      const { FeedbackService } = await import("./feedback-service");
      const result = await FeedbackService.deleteFeedback(feedbackId);
      console.log("Storage deleteFeedback result for id", feedbackId, ":", result);
      return result;
    } catch (error) {
      console.error("Storage deleteFeedback error:", error);
      return false;
    }
  }


  async createOperationalData(data: any): Promise<any> {
    const [entry] = await db
      .insert(operationalData)
      .values(data)
      .returning();
    return entry;
  }

  async getOperationalData(): Promise<any[]> {
    const entries = await db
      .select()
      .from(operationalData)
      .leftJoin(users, eq(operationalData.createdById, users.id))
      .orderBy(desc(operationalData.createdAt));

    return entries.map(entry => ({
      ...entry.operational_data,
      createdBy: entry.users!,
    }));
  }

  async deleteOperationalData(id: number): Promise<boolean> {
    const result = await db
      .delete(operationalData)
      .where(eq(operationalData.id, id));
    return (result.rowCount || 0) > 0;
  }

  async clearAllOperationalData(): Promise<boolean> {
    await db.delete(operationalData);
    return true;
  }

  async deleteArchivedItem(archiveId: number): Promise<boolean> {
    const result = await db
      .delete(archivedItems)
      .where(eq(archivedItems.id, archiveId));
    return (result.rowCount || 0) > 0;
  }

  async createWeeklyMeeting(data: any): Promise<any> {
    const result = await db.insert(weeklyMeetings).values(data).returning();
    return (result as any[])[0];
  }

  async getWeeklyMeetings(): Promise<any[]> {
    return await db.select().from(weeklyMeetings).orderBy(desc(weeklyMeetings.createdAt));
  }

  async getWeeklyMeeting(id: number): Promise<any> {
    const result = await db.select().from(weeklyMeetings).where(eq(weeklyMeetings.id, id));
    return (result as any[])[0];
  }

  async createWeeklyMeetingTask(data: any): Promise<any> {
    const result = await db.insert(weeklyMeetingTasks).values(data).returning();
    return (result as any[])[0];
  }

  async getWeeklyMeetingTasks(meetingId: number): Promise<any[]> {
    return await db.select().from(weeklyMeetingTasks).where(eq(weeklyMeetingTasks.meetingId, meetingId));
  }

  async updateDepartmentTaskProgress(taskId: number, departmentHeadId: number, updates: any): Promise<any> {
    const result = await db.update(departmentTaskProgress).set(updates)
      .where((col: any) => col.and(eq(departmentTaskProgress.taskId, taskId), eq(departmentTaskProgress.departmentHeadId, departmentHeadId)))
      .returning();
    return (result as any[])[0];
  }

  async getWeeklyMeetingArchive(meetingId: number): Promise<any[]> {
    return await db.select().from(weeklyMeetingArchive).where(eq(weeklyMeetingArchive.meetingId, meetingId));
  }

  async archiveWeeklyMeeting(meetingId: number, archivedById: number, resultsData: any): Promise<any> {
    const meeting = await this.getWeeklyMeeting(meetingId);
    const tasks = await this.getWeeklyMeetingTasks(meetingId);
    const result = await db.insert(weeklyMeetingArchive).values({
      meetingId,
      meetingData: JSON.stringify(meeting),
      tasksData: JSON.stringify(tasks),
      resultsData: JSON.stringify(resultsData),
      archivedById,
    } as any).returning();
    await db.update(weeklyMeetings).set({ status: "archived" as any }).where(eq(weeklyMeetings.id, meetingId));
    return (result as any[])[0];
  }
}

// Using DatabaseStorage to access the actual database with all the big data
export const storage = new DatabaseStorage();
