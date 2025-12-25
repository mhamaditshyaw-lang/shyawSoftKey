import bcrypt from "bcrypt";
import { type IStorage } from "./storage";
import type { 
  User, 
  InsertUser,
  TodoList,
  InsertTodoList,
  TodoItem,
  InsertTodoItem,
  Reminder,
  InsertReminder,
  InterviewRequest,
  InsertInterviewRequest
} from "@shared/schema";

// In-memory storage implementation with test data
export class MemStorage implements IStorage {
  private users: (User & { id: number })[] = [];
  private todoLists: (TodoList & { id: number })[] = [];
  private todoItems: (TodoItem & { id: number })[] = [];
  private reminders: (Reminder & { id: number })[] = [];
  private interviewRequests: (InterviewRequest & { id: number })[] = [];
  private operationalData: any[] = [];
  private archivedItems: any[] = [];
  private feedback: any[] = [];
  private feedbackTypes: any[] = [];

  private nextUserId = 1;
  private nextTodoListId = 1;
  private nextTodoItemId = 1;
  private nextReminderId = 1;
  private nextInterviewRequestId = 1;
  private nextOperationalDataId = 1;
  private nextArchivedItemId = 1;
  private nextFeedbackId = 1;
  private nextFeedbackTypeId = 1;

  constructor() {
    this.initializeTestData();
  }

  private async initializeTestData() {
    try {
      const hashedPassword = await bcrypt.hash('password123', 12);

      // Create test users
      this.users = [
        {
          id: 1,
          username: 'admin',
          email: 'admin@shyaw.com',
          password: hashedPassword,
          firstName: 'System',
          lastName: 'Administrator',
          role: 'admin' as const,
          status: 'active' as const,
          permissions: {
            canViewUsers: true,
            canEditUsers: true,
            canDeleteUsers: true,
            canViewTodos: true,
            canEditTodos: true,
            canViewInterviews: true,
            canEditInterviews: true,
            canViewReports: true,
            canManageNotifications: true
          },
          department: 'IT',
          position: 'System Administrator',
          phoneNumber: '+964-770-100-1000',
          comments: '',
          managerId: null,
          createdAt: new Date(),
          lastActiveAt: new Date()
        },
        {
          id: 2,
          username: 'manager',
          email: 'manager@company.com',
          password: hashedPassword,
          firstName: 'Manager',
          lastName: 'User',
          role: 'manager' as const,
          status: 'active' as const,
          permissions: {
            canViewUsers: true,
            canEditUsers: true,
            canDeleteUsers: false,
            canViewTodos: true,
            canEditTodos: true,
            canViewInterviews: true,
            canEditInterviews: true,
            canViewReports: true,
            canManageNotifications: false
          },
          department: 'Management',
          position: 'Operations Manager',
          phoneNumber: '+964-770-200-2000',
          comments: '',
          managerId: null,
          createdAt: new Date(),
          lastActiveAt: new Date()
        },
        {
          id: 3,
          username: 'security',
          email: 'security@company.com',
          password: hashedPassword,
          firstName: 'Security',
          lastName: 'Guard',
          role: 'security' as const,
          status: 'active' as const,
          permissions: {
            canViewUsers: false,
            canEditUsers: false,
            canDeleteUsers: false,
            canViewTodos: true,
            canEditTodos: true,
            canViewInterviews: true,
            canEditInterviews: false,
            canViewReports: false,
            canManageNotifications: false
          },
          department: 'Security',
          position: 'Security Officer',
          phoneNumber: '+964-770-300-3000',
          comments: '',
          managerId: null,
          createdAt: new Date(),
          lastActiveAt: new Date()
        },
      ];

      this.nextUserId = 4; // Increment based on the number of users added
    } catch (error) {
      console.error('Error initializing test data:', error);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(u => u.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(u => u.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser = {
      ...user,
      id: this.nextUserId++,
      createdAt: new Date(),
      lastActiveAt: new Date()
    } as User & { id: number };

    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) return undefined;

    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    return this.users[userIndex];
  }

  async deleteUser(id: number): Promise<boolean> {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) return false;

    this.users.splice(userIndex, 1);
    return true;
  }

  async getAllUsers(): Promise<User[]> {
    return [...this.users];
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return this.users.filter(u => u.role === role);
  }

  async updateUserPageAccess(userId: number, pagePermissions: Record<string, boolean>): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }

    const currentPermissions = (user.permissions as Record<string, any>) || {};
    const updatedPermissions = {
      ...currentPermissions,
      ...pagePermissions,
    };

    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      this.users[userIndex] = {
        ...this.users[userIndex],
        permissions: updatedPermissions,
        lastActiveAt: new Date()
      };
      return this.users[userIndex];
    }

    throw new Error(`Failed to update user ${userId}`);
  }

  async getUserPageAccess(userId: number): Promise<Record<string, boolean>> {
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
  }

  async getStaffForManager(managerId: number): Promise<User[]> {
    return this.users.filter(u => u.managerId === managerId);
  }

  async assignStaffToManager(staffId: number, managerId: number): Promise<User | undefined> {
    const userIndex = this.users.findIndex(u => u.id === staffId);
    if (userIndex === -1) return undefined;

    this.users[userIndex] = {
      ...this.users[userIndex],
      managerId,
      lastActiveAt: new Date()
    };
    return this.users[userIndex];
  }

  async removeStaffFromManager(staffId: number): Promise<User | undefined> {
    const userIndex = this.users.findIndex(u => u.id === staffId);
    if (userIndex === -1) return undefined;

    this.users[userIndex] = {
      ...this.users[userIndex],
      managerId: null,
      lastActiveAt: new Date()
    };
    return this.users[userIndex];
  }

  async getManagerForStaff(staffId: number): Promise<User | undefined> {
    const staff = await this.getUser(staffId);
    if (!staff || !staff.managerId) {
      return undefined;
    }
    return await this.getUser(staff.managerId);
  }

  // Todo methods
  async getTodoLists(): Promise<(TodoList & { createdBy: User; assignedTo: User | null; items: TodoItem[] })[]> {
    return this.todoLists.map(list => ({
      ...list,
      createdBy: this.users.find(u => u.id === list.createdById)!,
      assignedTo: list.assignedToId ? this.users.find(u => u.id === list.assignedToId) || null : null,
      items: this.todoItems.filter(item => item.todoListId === list.id)
    }));
  }

  async getTodoListsByUser(userId: number): Promise<(TodoList & { createdBy: User; assignedTo: User | null; items: TodoItem[] })[]> {
    const userLists = this.todoLists.filter(list => 
      list.createdById === userId || list.assignedToId === userId
    );

    return userLists.map(list => ({
      ...list,
      createdBy: this.users.find(u => u.id === list.createdById)!,
      assignedTo: list.assignedToId ? this.users.find(u => u.id === list.assignedToId) || null : null,
      items: this.todoItems.filter(item => item.todoListId === list.id)
    }));
  }

  async createTodoList(todoList: InsertTodoList): Promise<TodoList> {
    const newList = {
      ...todoList,
      id: this.nextTodoListId++,
      createdAt: new Date()
    } as TodoList & { id: number };

    this.todoLists.push(newList);
    return newList;
  }

  async getTodoList(id: number): Promise<(TodoList & { createdBy: User; assignedTo: User | null; items: TodoItem[] }) | undefined> {
    const list = this.todoLists.find(l => l.id === id);
    if (!list) return undefined;

    return {
      ...list,
      createdBy: this.users.find(u => u.id === list.createdById)!,
      assignedTo: list.assignedToId ? this.users.find(u => u.id === list.assignedToId) || null : null,
      items: this.todoItems.filter(item => item.todoListId === list.id)
    };
  }

  async createTodoItem(item: InsertTodoItem): Promise<TodoItem> {
    const newItem = {
      ...item,
      id: this.nextTodoItemId++,
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: item.isCompleted ? new Date() : null
    } as TodoItem & { id: number };

    this.todoItems.push(newItem);
    return newItem;
  }

  async updateTodoItem(id: number, updates: Partial<TodoItem>): Promise<TodoItem | undefined> {
    const itemIndex = this.todoItems.findIndex(item => item.id === id);
    if (itemIndex === -1) return undefined;

    const updateData = { 
      ...updates, 
      updatedAt: new Date(),
      completedAt: updates.isCompleted ? new Date() : null
    };

    this.todoItems[itemIndex] = { ...this.todoItems[itemIndex], ...updateData };
    return this.todoItems[itemIndex];
  }

  async deleteTodoItem(id: number): Promise<boolean> {
    const itemIndex = this.todoItems.findIndex(item => item.id === id);
    if (itemIndex === -1) return false;

    this.todoItems.splice(itemIndex, 1);
    return true;
  }

  async deleteAllTodoItems(todoListId: number): Promise<boolean> {
    const initialLength = this.todoItems.length;
    this.todoItems = this.todoItems.filter(item => item.todoListId !== todoListId);
    return this.todoItems.length < initialLength;
  }

  async deleteTodoList(id: number): Promise<boolean> {
    const listIndex = this.todoLists.findIndex(list => list.id === id);
    if (listIndex === -1) return false;

    // Remove all items associated with this todo list
    this.todoItems = this.todoItems.filter(item => item.todoListId !== id);

    // Remove the todo list itself
    this.todoLists.splice(listIndex, 1);
    return true;
  }

  async updateTodoList(id: number, updates: Partial<TodoList>): Promise<TodoList | undefined> {
    const listIndex = this.todoLists.findIndex(list => list.id === id);
    if (listIndex === -1) return undefined;

    this.todoLists[listIndex] = { ...this.todoLists[listIndex], ...updates };
    return this.todoLists[listIndex];
  }

  async getTodoStatsByUser(userId: number): Promise<{ totalTodos: number; completedTodos: number; pendingTodos: number }> {
    const userLists = this.todoLists.filter(list => 
      list.createdById === userId || list.assignedToId === userId
    );
    const listIds = userLists.map(list => list.id);
    const userItems = this.todoItems.filter(item => listIds.includes(item.todoListId));

    const totalTodos = userItems.length;
    const completedTodos = userItems.filter(item => item.isCompleted).length;
    const pendingTodos = totalTodos - completedTodos;

    return { totalTodos, completedTodos, pendingTodos };
  }

  // Interview request methods
  async getInterviewRequests(): Promise<(InterviewRequest & { requestedBy: User; manager: User | null; actionTakenBy: User | null })[]> {
    return this.interviewRequests.map(request => ({
      ...request,
      requestedBy: this.users.find(u => u.id === request.requestedById)!,
      manager: request.managerId ? this.users.find(u => u.id === request.managerId) || null : null,
      actionTakenBy: request.actionTakenById ? this.users.find(u => u.id === request.actionTakenById) || null : null
    }));
  }

  async getInterviewRequestsByManager(managerId: number): Promise<(InterviewRequest & { requestedBy: User; manager: User | null; actionTakenBy: User | null })[]> {
    const managerRequests = this.interviewRequests.filter(request => request.managerId === managerId);
    return managerRequests.map(request => ({
      ...request,
      requestedBy: this.users.find(u => u.id === request.requestedById)!,
      manager: this.users.find(u => u.id === managerId) || null,
      actionTakenBy: request.actionTakenById ? this.users.find(u => u.id === request.actionTakenById) || null : null
    }));
  }

  async getInterviewRequestsByUser(userId: number): Promise<(InterviewRequest & { requestedBy: User; manager: User | null; actionTakenBy: User | null })[]> {
    return this.getInterviewRequests(); // User can see all requests
  }

  async createInterviewRequest(request: InsertInterviewRequest): Promise<InterviewRequest> {
    const newRequest = {
      ...request,
      id: this.nextInterviewRequestId++,
      createdAt: new Date(),
      updatedAt: new Date()
    } as InterviewRequest & { id: number };

    this.interviewRequests.push(newRequest);
    return newRequest;
  }

  async updateInterviewRequest(id: number, updates: Partial<InterviewRequest>): Promise<InterviewRequest | undefined> {
    const requestIndex = this.interviewRequests.findIndex(req => req.id === id);
    if (requestIndex === -1) return undefined;

    this.interviewRequests[requestIndex] = { 
      ...this.interviewRequests[requestIndex], 
      ...updates,
      updatedAt: new Date()
    };
    return this.interviewRequests[requestIndex];
  }

  // Analytics methods
  async getUserStats(): Promise<{ totalUsers: number; activeUsers: number; pendingUsers: number }> {
    const totalUsers = this.users.length;
    const activeUsers = this.users.filter(u => u.status === 'active').length;
    const pendingUsers = this.users.filter(u => u.status === 'pending').length;

    return { totalUsers, activeUsers, pendingUsers };
  }

  async getTodoStats(): Promise<{ totalTodos: number; completedTodos: number; pendingTodos: number }> {
    const totalTodos = this.todoItems.length;
    const completedTodos = this.todoItems.filter(item => item.isCompleted).length;
    const pendingTodos = totalTodos - completedTodos;

    return { totalTodos, completedTodos, pendingTodos };
  }

  async getInterviewStats(): Promise<{ totalRequests: number; pendingRequests: number; approvedRequests: number }> {
    const totalRequests = this.interviewRequests.length;
    const pendingRequests = this.interviewRequests.filter(req => req.status === 'pending').length;
    const approvedRequests = this.interviewRequests.filter(req => req.status === 'approved').length;

    return { totalRequests, pendingRequests, approvedRequests };
  }

  // Feedback methods (mock implementations)
  async createFeedback(feedbackData: any): Promise<any> {
    const feedback = { ...feedbackData, id: this.nextFeedbackId++, createdAt: new Date() };
    this.feedback.push(feedback);
    return feedback;
  }

  async getAllFeedback(): Promise<any[]> {
    return [...this.feedback];
  }

  async getFeedbackByUser(userId: number): Promise<any[]> {
    return this.feedback.filter(feedback => feedback.submittedById === userId);
  }

  // Archive methods (mock implementations)
  async archiveItem(itemType: string, itemId: number, itemData: any, archivedById: number, reason?: string): Promise<any> {
    const archivedItem = {
      id: this.nextArchivedItemId++,
      itemType,
      originalItemId: itemId,
      itemData,
      archivedById,
      reason,
      archivedAt: new Date()
    };
    this.archivedItems.push(archivedItem);
    return archivedItem;
  }

  async getArchivedItems(): Promise<any[]> {
    return [...this.archivedItems];
  }

  async updateArchivedItem(archiveId: number, updates: any): Promise<any> {
    const itemIndex = this.archivedItems.findIndex(item => item.id === archiveId);
    if (itemIndex === -1) return null;

    this.archivedItems[itemIndex] = { ...this.archivedItems[itemIndex], ...updates };
    return this.archivedItems[itemIndex];
  }

  async restoreArchivedItem(archiveId: number, itemType: string): Promise<void> {
    const itemIndex = this.archivedItems.findIndex(item => item.id === archiveId);
    if (itemIndex !== -1) {
      this.archivedItems.splice(itemIndex, 1);
    }
  }

  async deleteArchivedItem(archiveId: number): Promise<boolean> {
    const itemIndex = this.archivedItems.findIndex(item => item.id === archiveId);
    if (itemIndex === -1) return false;

    this.archivedItems.splice(itemIndex, 1);
    return true;
  }

  // Operational data methods (mock implementations)
  async createOperationalData(data: any): Promise<any> {
    const entry = { ...data, id: this.nextOperationalDataId++, createdAt: new Date() };
    this.operationalData.push(entry);
    return entry;
  }

  async getOperationalData(): Promise<any[]> {
    return this.operationalData.map(entry => ({
      ...entry,
      createdBy: this.users.find(u => u.id === entry.createdById)
    }));
  }

  async deleteOperationalData(id: number): Promise<boolean> {
    const itemIndex = this.operationalData.findIndex(item => item.id === id);
    if (itemIndex === -1) return false;

    this.operationalData.splice(itemIndex, 1);
    return true;
  }

  async clearAllOperationalData(): Promise<boolean> {
    this.operationalData = [];
    return true;
  }

  // Reminder methods implementation
  async getReminders(userId: number): Promise<Reminder[]> {
    return this.reminders
      .filter(reminder => reminder.createdById === userId)
      .sort((a, b) => new Date(b.reminderDate).getTime() - new Date(a.reminderDate).getTime());
  }

  async getRemindersByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Reminder[]> {
    return this.reminders
      .filter(reminder => {
        const reminderDate = new Date(reminder.reminderDate);
        return reminder.createdById === userId && 
               reminderDate >= startDate && 
               reminderDate < endDate;
      })
      .sort((a, b) => new Date(a.reminderDate).getTime() - new Date(b.reminderDate).getTime());
  }

  async createReminder(reminder: InsertReminder): Promise<Reminder> {
    const newReminder = {
      ...reminder,
      id: this.nextReminderId++,
      createdAt: new Date()
    } as Reminder & { id: number };

    this.reminders.push(newReminder);
    return newReminder;
  }

  async updateReminder(id: number, updates: Partial<Reminder>): Promise<Reminder | undefined> {
    const reminderIndex = this.reminders.findIndex(r => r.id === id);
    if (reminderIndex === -1) return undefined;

    this.reminders[reminderIndex] = { 
      ...this.reminders[reminderIndex], 
      ...updates
    };
    return this.reminders[reminderIndex];
  }

  async deleteReminder(id: number): Promise<boolean> {
    const reminderIndex = this.reminders.findIndex(r => r.id === id);
    if (reminderIndex === -1) return false;

    this.reminders.splice(reminderIndex, 1);
    return true;
  }

  // Additional mock methods for feedback types
  async createFeedbackType(feedbackTypeData: any): Promise<any> {
    const feedbackType = { ...feedbackTypeData, id: this.nextFeedbackTypeId++, createdAt: new Date() };
    this.feedbackTypes.push(feedbackType);
    return feedbackType;
  }

  async getAllFeedbackTypes(): Promise<any[]> {
    return [...this.feedbackTypes];
  }

  async updateFeedbackType(typeId: number, updates: any): Promise<any> {
    const typeIndex = this.feedbackTypes.findIndex(type => type.id === typeId);
    if (typeIndex === -1) return null;

    this.feedbackTypes[typeIndex] = { ...this.feedbackTypes[typeIndex], ...updates };
    return this.feedbackTypes[typeIndex];
  }

  async deleteFeedbackType(typeId: number): Promise<void> {
    const typeIndex = this.feedbackTypes.findIndex(type => type.id === typeId);
    if (typeIndex !== -1) {
      this.feedbackTypes.splice(typeIndex, 1);
    }
  }

  // Add feedback delete method
  async deleteFeedback(feedbackId: number): Promise<boolean> {
    const feedbackIndex = this.feedback.findIndex(f => f.id === feedbackId);
    if (feedbackIndex === -1) return false;

    this.feedback.splice(feedbackIndex, 1);
    return true;
  }

  async getAccessibleUserIds(userId: number, userRole: string): Promise<number[]> {
    if (userRole === 'admin') {
      // Admin can see all users
      return this.users.map(u => u.id);
    } else if (userRole === 'manager') {
      // Manager can ONLY see themselves and their direct staff
      const staffIds = this.users
        .filter(u => u.managerId === userId)
        .map(u => u.id);
      return [userId, ...staffIds];
    } else if (userRole === 'office' || userRole === 'office_team' || userRole === 'secretary') {
      // Staff can see themselves and their manager (if assigned)
      const user = this.users.find(u => u.id === userId);
      const accessibleIds = [userId];
      if (user?.managerId) {
        accessibleIds.push(user.managerId);
        // Also include other staff under the same manager
        const siblings = this.users
          .filter(u => u.managerId === user.managerId && u.id !== userId)
          .map(u => u.id);
        accessibleIds.push(...siblings);
      }
      return accessibleIds;
    } else {
      // Security and other roles can only see themselves
      return [userId];
    }
  }
}