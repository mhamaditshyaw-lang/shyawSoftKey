import type { Express } from "express";
import { createServer, type Server } from "http";

import { storage } from "./storage";
import { db } from "./db";
import { weeklyMeetings } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { insertUserSchema, loginSchema, insertTodoListSchema, insertTodoItemSchema, insertInterviewRequestSchema, changePasswordSchema, updateUserPasswordSchema, insertReminderSchema, insertInterviewCommentSchema, PAGE_PERMISSIONS } from "@shared/schema";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET environment variable is required. Please set a secure JWT secret."
  );
}

// Helper function to sanitize user objects by removing sensitive data
function toPublicUser(user: any) {
  if (!user) return null;
  const { password, ...publicUser } = user;
  return publicUser;
}

// Helper function to sanitize a single todo with user relations
function sanitizeTodoList(todo: any) {
  if (!todo) return null;
  return {
    ...todo,
    createdBy: toPublicUser(todo.createdBy),
    assignedTo: toPublicUser(todo.assignedTo)
  };
}

// Helper function to sanitize todo lists with user relations
function sanitizeTodoLists(todoLists: any[]) {
  return todoLists.map(todo => sanitizeTodoList(todo));
}

interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
  };
  accessibleUserIds?: number[];
}

// Middleware to verify JWT token
async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as any;
    const user = await storage.getUser(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Middleware to check user role
function requireRole(roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      // This message can be translated on the frontend using the "insufficientPermissions" key
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
}

// Middleware to attach accessible user IDs based on manager hierarchy
async function attachUserScope(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const accessibleUserIds = await storage.getAccessibleUserIds(req.user.id, req.user.role);
    req.accessibleUserIds = accessibleUserIds;
    next();
  } catch (error) {
    console.error('Error attaching user scope:', error);
    return res.status(500).json({ message: 'Failed to determine user access scope' });
  }
}

// Authorization helper utilities
function assertUserInScope(userId: number | null | undefined, accessibleUserIds: number[]): void {
  if (userId && !accessibleUserIds.includes(userId)) {
    throw new Error('User not in your accessible scope');
  }
}

async function assertTodoListInScope(todoListId: number, accessibleUserIds: number[]): Promise<void> {
  const todoList = await storage.getTodoList(todoListId);
  if (!todoList) {
    throw new Error('Todo list not found');
  }

  const isInScope = 
    accessibleUserIds.includes(todoList.createdById) ||
    (todoList.assignedToId && accessibleUserIds.includes(todoList.assignedToId));

  if (!isInScope) {
    throw new Error('Todo list not in your accessible scope');
  }
}

async function assertTodoItemInScope(todoItemId: number, accessibleUserIds: number[]): Promise<void> {
  const todoItem = await storage.getTodoItem(todoItemId);
  if (!todoItem) {
    throw new Error('Todo item not found');
  }

  await assertTodoListInScope(todoItem.todoListId, accessibleUserIds);
}

async function assertInterviewInScope(interviewId: number, accessibleUserIds: number[]): Promise<void> {
  const interview = await storage.getInterviewRequest(interviewId);
  if (!interview) {
    throw new Error('Interview request not found');
  }

  const isInScope = 
    accessibleUserIds.includes(interview.requestedById) ||
    (interview.managerId && accessibleUserIds.includes(interview.managerId));

  if (!isInScope) {
    throw new Error('Interview request not in your accessible scope');
  }
}

// WebSocket connections storage


export async function registerRoutes(app: Express): Promise<Server> {


  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (user.status !== 'active') {
        return res.status(401).json({ message: "Account not activated" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Update last active time
      await storage.updateUser(user.id, { lastActiveAt: new Date() });

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET!,
        { expiresIn: '24h' }
      );

      const { password: _, ...userWithoutPassword } = user;
      res.json({ 
        token, 
        user: userWithoutPassword 
      });
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message?.includes('endpoint has been disabled')) {
        return res.status(503).json({ 
          message: "Database connection issue. Please wait a moment and try again." 
        });
      }
      res.status(400).json({ message: error.message || "Login failed" });
    }
  });

  // Protected routes
  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res) => {
    const user = await storage.getUser(req.user!.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { password, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  });

  // User management routes - each manager sees only their own team
  app.get("/api/users", authenticateToken, attachUserScope, requireRole(['admin', 'manager', 'office', 'office_team']), async (req: AuthRequest, res) => {
    try {
      // Filter users based on accessible user IDs - managers can only see their own team
      const users = await storage.getAllUsers(req.accessibleUserIds);
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json({ users: usersWithoutPasswords });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/users", authenticateToken, requireRole(['admin', 'office_team']), async (req: AuthRequest, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);

      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
        status: 'active', // Admin created users are active by default
      });

      // Device notification creation temporarily disabled due to foreign key constraint issues
      // TODO: Re-enable once user database issues are resolved
      console.log(`User ${user.username} created successfully by admin ${req.user?.username || req.user?.id}`);

      const { password, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/users/:id", authenticateToken, requireRole(['admin', 'manager']), async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const isAdmin = req.user?.role === 'admin';

      // Define allowed fields based on role
      const allowedFields = isAdmin 
        ? ['firstName', 'lastName', 'email', 'role', 'status', 'permissions', 'department', 'position', 'phoneNumber', 'managerId', 'comments']
        : ['firstName', 'lastName', 'department', 'position', 'phoneNumber']; // managers can only update profile fields

      // Filter updates to only allowed fields
      const updates: any = {};
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          // Handle permissions as JSON string if it's an object
          if (field === 'permissions' && typeof req.body[field] === 'object') {
            updates[field] = JSON.stringify(req.body[field]);
          } else {
            updates[field] = req.body[field];
          }
        }
      }

      // Only allow password updates for admin or self
      if (req.body.password) {
        if (isAdmin || req.user?.id === id) {
          updates.password = await bcrypt.hash(req.body.password, 12);
        } else {
          return res.status(403).json({ message: "Only admins can change other users' passwords" });
        }
      }

      // Prevent any unauthorized field updates
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }

      console.log('Updating user with ID:', id, 'Updates:', updates);

      const user = await storage.updateUser(id, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      console.error('Error updating user:', error);
      res.status(400).json({ message: error.message });
    }
  });

  // Change user password (for users changing their own password)
  app.patch("/api/users/:id/password", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = parseInt(req.params.id);
      // Validate only the fields being sent from frontend
      const passwordData = z.object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z.string().min(6, "New password must be at least 6 characters"),
      }).parse(req.body);

      // Get the user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Only allow users to change their own password, or admins to change any password
      if (req.user!.id !== userId && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "You can only change your own password" });
      }

      // If not admin, verify current password
      if (req.user!.role !== 'admin') {
        const isCurrentPasswordValid = await bcrypt.compare(passwordData.currentPassword, user.password);
        if (!isCurrentPasswordValid) {
          return res.status(400).json({ message: "Current password is incorrect" });
        }
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(passwordData.newPassword, 12);

      // Update password
      const updatedUser = await storage.updateUser(userId, { password: hashedNewPassword });
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update password" });
      }

      res.json({ message: "Password updated successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Admin route to update user password without current password verification
  app.patch("/api/admin/users/:id/password", authenticateToken, requireRole(['admin']), async (req: AuthRequest, res) => {
    try {
      const userId = parseInt(req.params.id);
      const passwordData = updateUserPasswordSchema.parse(req.body);

      // Get the user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(passwordData.newPassword, 12);

      // Update password
      const updatedUser = await storage.updateUser(userId, { password: hashedNewPassword });
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update password" });
      }

      res.json({ message: "User password updated successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/users/:id", authenticateToken, requireRole(['admin']), async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);

      // Check if user exists
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Prevent self-deletion
      if (id === req.user?.id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }

      const success = await storage.deleteUser(id);
      if (!success) {
        return res.status(500).json({ message: "Failed to delete user" });
      }

      res.json({ message: "User deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Page access management routes
  app.get("/api/users/:id/page-access", authenticateToken, requireRole(['admin']), async (req: AuthRequest, res) => {
    try {
      const userId = parseInt(req.params.id);

      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const pageAccess = await storage.getUserPageAccess(userId);
      res.json({ pageAccess });
    } catch (error: any) {
      console.error("Error getting user page access:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/users/:id/page-access", authenticateToken, requireRole(['admin']), async (req: AuthRequest, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { pagePermissions } = req.body;

      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Validate pagePermissions is an object
      if (!pagePermissions || typeof pagePermissions !== 'object') {
        return res.status(400).json({ message: "pagePermissions must be an object" });
      }

      const updatedUser = await storage.updateUserPageAccess(userId, pagePermissions);
      const { password, ...userWithoutPassword } = updatedUser;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      console.error("Error updating user page access:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/pages/available", authenticateToken, requireRole(['admin']), async (req: AuthRequest, res) => {
    try {
      const pageLabels: Record<string, string> = {
        "/": "Dashboard",
        "/interviews": "Interview Requests",
        "/todos": "Todo Lists",
        "/reminders": "Reminders",
        "/feedback": "Feedback",
        "/metrics": "Metrics",
        "/users": "User Management",
        "/employee-management": "Employee Management",
        "/department-management": "Department Management",
        "/add-employee": "Add Employee",
        "/data-view": "Data View",
        "/reports": "Reports",
        "/archive": "Archive",
        "/all-data": "All Data",
        "/user-activity": "User Activity",
        "/page-access-management": "Page Access Management",
        "/notification-management": "Notification Management",
        "/notification-test": "Notification Test",
        "/broadcast-notification": "Broadcast Notification",
        "/weekly-meetings": "Weekly Meetings",
        "/weekly-meetings-data": "Weekly Meetings Data",
        "/backup-restore": "Backup & Restore",
        "/partitions": "Partition Browser",
        "/manager-todos": "Manager Todos",
        "/manager-dashboard": "Manager Dashboard",
        "/multilingual-demo": "Multilingual Demo"
      };

      const pages = Object.entries(PAGE_PERMISSIONS).map(([path, permission]) => ({
        path,
        permission,
        label: pageLabels[path] || path.split('/').pop()?.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ') || path
      }));

      res.json({ pages });
    } catch (error: any) {
      console.error("Error getting available pages:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Manager-staff relationship routes
  app.get("/api/managers/:managerId/staff", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const managerId = parseInt(req.params.managerId);

      // Only allow admin or the manager themselves to view their staff
      if (req.user?.role !== 'admin' && req.user?.id !== managerId) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      const staff = await storage.getStaffForManager(managerId);
      const sanitizedStaff = staff.map(toPublicUser);
      res.json({ staff: sanitizedStaff });
    } catch (error: any) {
      console.error("Error getting manager staff:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/staff/:staffId/assign-manager", authenticateToken, requireRole(['admin', 'manager']), async (req: AuthRequest, res) => {
    try {
      const staffId = parseInt(req.params.staffId);
      const { managerId } = req.body;

      if (!managerId) {
        return res.status(400).json({ message: "Manager ID is required" });
      }

      // Verify manager exists and has manager role
      const manager = await storage.getUser(managerId);
      if (!manager) {
        return res.status(404).json({ message: "Manager not found" });
      }
      if (manager.role !== 'manager') {
        return res.status(400).json({ message: "User is not a manager" });
      }

      // If the user is a manager (not admin), they can only assign staff to themselves
      if (req.user?.role === 'manager' && req.user?.id !== managerId) {
        return res.status(403).json({ message: 'Managers can only assign staff to themselves' });
      }

      const updatedStaff = await storage.assignStaffToManager(staffId, managerId);
      if (!updatedStaff) {
        return res.status(404).json({ message: "Staff member not found" });
      }

      res.json({ user: toPublicUser(updatedStaff) });
    } catch (error: any) {
      console.error("Error assigning staff to manager:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/staff/:staffId/remove-manager", authenticateToken, requireRole(['admin', 'manager']), async (req: AuthRequest, res) => {
    try {
      const staffId = parseInt(req.params.staffId);

      // Get current staff to check their manager
      const staff = await storage.getUser(staffId);
      if (!staff) {
        return res.status(404).json({ message: "Staff member not found" });
      }

      // If the user is a manager (not admin), they can only remove their own staff
      if (req.user?.role === 'manager' && req.user?.id !== staff.managerId) {
        return res.status(403).json({ message: 'Managers can only remove their own staff' });
      }

      const updatedStaff = await storage.removeStaffFromManager(staffId);
      res.json({ user: toPublicUser(updatedStaff) });
    } catch (error: any) {
      console.error("Error removing staff from manager:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/staff/:staffId/manager", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const staffId = parseInt(req.params.staffId);

      // Allow admin, the staff member themselves, or their manager to view this
      const staff = await storage.getUser(staffId);
      if (!staff) {
        return res.status(404).json({ message: "Staff member not found" });
      }

      if (req.user?.role !== 'admin' && req.user?.id !== staffId && req.user?.id !== staff.managerId) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      const manager = await storage.getManagerForStaff(staffId);
      res.json({ manager: toPublicUser(manager) });
    } catch (error: any) {
      console.error("Error getting staff manager:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Todo routes - each user sees only their own department data
  app.get("/api/todos", authenticateToken, attachUserScope, async (req: AuthRequest, res) => {
    try {
      // Filter todos by accessible users in same department
      const todoLists = await storage.getTodoLists(req.accessibleUserIds);
      // Sanitize user data to remove passwords and other sensitive information
      const sanitizedTodoLists = sanitizeTodoLists(todoLists);
      res.json({ todoLists: sanitizedTodoLists });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Manager-specific todos endpoint - only shows todos for manager's team
  app.get("/api/manager-todos", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (req.user?.role !== 'manager') {
        return res.status(403).json({ message: 'Only managers can access this endpoint' });
      }

      // Get staff members where this manager is their manager
      const staff = await storage.getStaffForManager(req.user.id);
      const staffIds = staff.map(s => s.id);

      // Get todos assigned to or created by the manager's staff
      const allTodos = await storage.getTodoLists();
      const filteredTodos = allTodos.filter(todo => 
        staffIds.includes(todo.assignedToId || 0) || 
        staffIds.includes(todo.createdById)
      );

      const sanitizedTodos = sanitizeTodoLists(filteredTodos);
      res.json({ todoLists: sanitizedTodos });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/todos", authenticateToken, attachUserScope, async (req: AuthRequest, res) => {
    try {
      const todoData = insertTodoListSchema.parse({
        ...req.body,
        createdById: req.user?.id || 0,
      });

      // Verify assignedToId is in accessible scope (for non-admin roles)
      if (req.user?.role !== 'admin' && todoData.assignedToId) {
        assertUserInScope(todoData.assignedToId, req.accessibleUserIds!);
      }

      const todoList = await storage.createTodoList(todoData);
      const fullTodoList = await storage.getTodoList(todoList.id);

      // Send notification if todo is assigned to someone
      if (todoData.assignedToId && todoData.assignedToId !== req.user?.id) {
        const { DeviceNotificationService } = await import("./device-notification-service");
        await DeviceNotificationService.createUserNotification(
          todoData.assignedToId,
          "task_reminder",
          "New Task Assigned",
          `You have been assigned a new task: ${todoData.title}`,
          "normal"
        );
      }

      res.status(201).json({ todoList: sanitizeTodoList(fullTodoList) });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/todos/items", authenticateToken, attachUserScope, async (req: AuthRequest, res) => {
    try {
      const { todoListId, text, priority } = req.body;
      console.log("Creating todo item with data:", { todoListId, text, priority, user: req.user?.id });

      // Validate input
      if (!todoListId || !text || !text.trim()) {
        return res.status(400).json({ message: "Todo list ID and task text are required" });
      }

      // Verify todoList is in accessible scope (for non-admin roles)
      if (req.user?.role !== 'admin') {
        await assertTodoListInScope(parseInt(todoListId), req.accessibleUserIds!);
      }

      const itemData = {
        todoListId: parseInt(todoListId),
        title: text.trim(),
        description: "",
        priority: priority || "medium",
        isCompleted: false,
      };

      console.log("Parsed item data:", itemData);
      const todoItem = await storage.createTodoItem(itemData);
      console.log("Created todo item:", todoItem);

      res.status(201).json({ todoItem });
    } catch (error: any) {
      console.error("Error creating todo item:", error);
      res.status(500).json({ message: error.message || "Failed to create todo item" });
    }
  });

  app.post("/api/todos/:id/items", authenticateToken, attachUserScope, async (req: AuthRequest, res) => {
    try {
      const todoListId = parseInt(req.params.id);

      // Verify todoList is in accessible scope (for non-admin roles)
      if (req.user?.role !== 'admin') {
        await assertTodoListInScope(todoListId, req.accessibleUserIds!);
      }

      const itemData = insertTodoItemSchema.parse({
        ...req.body,
        todoListId,
      });

      const todoItem = await storage.createTodoItem(itemData);
      res.status(201).json({ todoItem });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/todos/items/:id", authenticateToken, attachUserScope, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      let updates: any = {};

      // Only allow specific fields to be updated
      const allowedFields = ['isCompleted', 'title', 'description', 'priority', 'dueDate', 'reminderDate', 'completedByNote'];

      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      }

      // Verify todo item is in accessible scope - only allow modifications for same department
      if (req.user?.role !== 'admin') {
        await assertTodoItemInScope(id, req.accessibleUserIds!);
      }

      // If marking as complete, auto-set completedById and completedAt
      if (updates.isCompleted === true) {
        updates.completedById = req.user?.id;
        updates.completedAt = new Date();
      }

      const todoItem = await storage.updateTodoItem(id, updates);
      if (!todoItem) {
        return res.status(404).json({ message: "Todo item not found" });
      }

      res.json({ todoItem });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Cannot modify tasks from other departments" });
    }
  });

  // Delete todo item
  app.delete("/api/todos/items/:id", authenticateToken, attachUserScope, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);

      // Verify todo item is in accessible scope - only allow deletion for same department
      if (req.user?.role !== 'admin') {
        await assertTodoItemInScope(id, req.accessibleUserIds!);
      }

      const success = await storage.deleteTodoItem(id);
      if (!success) {
        return res.status(404).json({ message: "Todo item not found" });
      }

      res.json({ message: "Todo item deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting todo item:", error);
      res.status(500).json({ message: error.message || "Cannot delete tasks from other departments" });
    }
  });

  // Delete all tasks in a todo list
  app.delete("/api/todos/:id/items", authenticateToken, attachUserScope, async (req: AuthRequest, res) => {
    try {
      const todoListId = parseInt(req.params.id);

      // Verify todoList is in accessible scope (for non-admin roles)
      if (req.user?.role !== 'admin') {
        await assertTodoListInScope(todoListId, req.accessibleUserIds!);
      }

      const success = await storage.deleteAllTodoItems(todoListId);

      if (!success) {
        return res.status(404).json({ message: "Todo list not found" });
      }

      res.json({ message: "All tasks deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting all todo items:", error);
      res.status(500).json({ message: error.message || "Failed to delete all tasks" });
    }
  });

  // Delete entire todo list
  app.delete("/api/todos/:id", authenticateToken, attachUserScope, async (req: AuthRequest, res) => {
    try {
      const todoListId = parseInt(req.params.id);

      // Verify todoList is in accessible scope (for non-admin roles)
      if (req.user?.role !== 'admin') {
        await assertTodoListInScope(todoListId, req.accessibleUserIds!);
      }

      const success = await storage.deleteTodoList(todoListId);
      if (!success) {
        return res.status(404).json({ message: "Todo list not found" });
      }

      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting todo list:", error);
      res.status(500).json({ message: error.message || "Failed to delete todo list" });
    }
  });

  // Update todo list
  app.patch("/api/todos/:id", authenticateToken, attachUserScope, async (req: AuthRequest, res) => {
    try {
      const todoListId = parseInt(req.params.id);

      // Verify todoList is in accessible scope (for non-admin roles)
      if (req.user?.role !== 'admin') {
        await assertTodoListInScope(todoListId, req.accessibleUserIds!);
      }

      // Validate updates with Zod - only allow specific fields
      const updateTodoListSchema = insertTodoListSchema.pick({
        title: true,
        description: true,
        priority: true,
        assignedToId: true,
      }).partial();

      const validatedUpdates = updateTodoListSchema.parse(req.body);

      // If assignedToId is being updated, verify it's in accessible scope
      if (req.user?.role !== 'admin' && validatedUpdates.assignedToId) {
        assertUserInScope(validatedUpdates.assignedToId, req.accessibleUserIds!);
      }

      const todoList = await storage.updateTodoList(todoListId, validatedUpdates);
      if (!todoList) {
        return res.status(404).json({ message: "Todo list not found" });
      }

      res.json({ todoList: sanitizeTodoList(todoList) });
    } catch (error: any) {
      console.error("Error updating todo list:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid update data", errors: error.errors });
      }
      res.status(500).json({ message: error.message || "Failed to update todo list" });
    }
  });

  // Reminder routes
  app.get("/api/reminders", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const reminders = await storage.getReminders(req.user?.id || 0);
      res.json({ reminders });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/reminders/today", authenticateToken, async (req: AuthRequest, res) => {
    try {
      // Get today's date range in local timezone
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const reminders = await storage.getRemindersByDateRange(req.user?.id || 0, today, tomorrow);
      res.json({ reminders });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/reminders", authenticateToken, async (req: AuthRequest, res) => {
    try {
      // Clean the data before validation
      const cleanedData = {
        ...req.body,
        createdById: req.user?.id || 0,
      };

      // Handle todoItemId - if it's null or undefined, don't include it
      if (cleanedData.todoItemId === null || cleanedData.todoItemId === undefined) {
        delete cleanedData.todoItemId;
      }

      console.log("Creating reminder with data:", cleanedData);

      const reminderData = insertReminderSchema.parse(cleanedData);
      const reminder = await storage.createReminder(reminderData);

      console.log("Reminder created successfully:", reminder);
      res.status(201).json({ reminder });
    } catch (error: any) {
      console.error("Reminder creation error:", error);
      if (error.issues) {
        console.error("Validation issues:", error.issues);
      }
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/reminders/:id", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;

      const reminder = await storage.updateReminder(id, updates);
      if (!reminder) {
        return res.status(404).json({ message: "Reminder not found" });
      }

      res.json({ reminder });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/reminders/:id", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteReminder(id);

      if (!success) {
        return res.status(404).json({ message: "Reminder not found" });
      }

      res.json({ message: "Reminder deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });


  // Reports endpoints (manager/admin only)
  app.get("/api/reports", authenticateToken, requireRole(['manager', 'admin']), async (req: AuthRequest, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      // Get user stats
      const userStats = await storage.getUserStats();
      const allUsers = await storage.getAllUsers();
      const usersByRole = allUsers.reduce((acc: any[], user) => {
        const existing = acc.find(item => item.role === user.role);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ role: user.role, count: 1 });
        }
        return acc;
      }, []);

      // Get todo stats based on role - managers see only their team's data
      let todoLists;
      if (req.user!.role === 'admin') {
        // Admins see all tasks
        todoLists = await storage.getTodoLists();
      } else if (req.user!.role === 'manager') {
        // Managers see tasks from their accessible users (themselves + their staff)
        const accessibleUserIds = await storage.getAccessibleUserIds(req.user!.id, req.user!.role);
        todoLists = await storage.getTodoLists(accessibleUserIds);
      } else {
        // Others see only their own tasks
        todoLists = await storage.getTodoListsByUser(req.user!.id);
      }

      // Get todo stats based on role - managers see only their team's data
      let todoStats;
      if (req.user!.role === 'admin') {
        todoStats = await storage.getTodoStats();
      } else {
        todoStats = await storage.getTodoStatsByUser(req.user!.id);
      }
      const todosByPriority = todoLists.reduce((acc: any[], list) => {
        const existing = acc.find(item => item.priority === list.priority);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ priority: list.priority, count: 1 });
        }
        return acc;
      }, []);

      // Generate completion trend (mock data for demo)
      const completionTrend = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toLocaleDateString(),
          completed: Math.floor(Math.random() * 20) + 5,
          created: Math.floor(Math.random() * 25) + 8,
        };
      });

      // Get interview stats based on role - managers see only their team's data
      let interviewStats, interviews;
      if (req.user!.role === 'admin') {
        interviewStats = await storage.getInterviewStats();
        interviews = await storage.getInterviewRequests();
      } else if (req.user!.role === 'manager') {
        // Get accessible user IDs for this manager
        const accessibleUserIds = await storage.getAccessibleUserIds(req.user!.id, req.user!.role);
        interviews = await storage.getInterviewRequests(accessibleUserIds, false);
        // Calculate stats from filtered interviews
        interviewStats = {
          totalRequests: interviews.length,
          pendingRequests: interviews.filter((r: any) => r.status === 'pending').length,
          approvedRequests: interviews.filter((r: any) => r.status === 'approved').length,
        };
      } else {
        interviewStats = await storage.getInterviewStats();
        interviews = await storage.getInterviewRequestsByUser(req.user!.id);
      }
      const requestsByStatus = interviews.reduce((acc: any[], request) => {
        const existing = acc.find(item => item.status === request.status);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ status: request.status, count: 1 });
        }
        return acc;
      }, []);

      // Generate interview trend (mock data for demo)
      const requestsTrend = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toLocaleDateString(),
          requests: Math.floor(Math.random() * 10) + 2,
        };
      });

      // Get feedback stats
      const allFeedback = await storage.getAllFeedback();
      const feedbackStats = {
        totalFeedback: allFeedback.length,
        averageRating: allFeedback.length > 0 
          ? allFeedback.reduce((sum, f) => sum + parseInt(f.rating), 0) / allFeedback.length 
          : 0,
        feedbackByType: allFeedback.reduce((acc: any[], feedback) => {
          const existing = acc.find(item => item.type === feedback.type);
          if (existing) {
            existing.count++;
          } else {
            acc.push({ type: feedback.type, count: 1 });
          }
          return acc;
        }, []),

      };

      const reportsData = {
        userStats: {
          ...userStats,
          usersByRole,
        },
        todoStats: {
          ...todoStats,
          todosByPriority,
          completionTrend,
        },
        interviewStats: {
          ...interviewStats,
          requestsByStatus,
          requestsTrend,
        },

        feedbackStats,
      };

      res.json(reportsData);
    } catch (error: any) {
      console.error("Error generating reports:", error);
      res.status(500).json({ message: error.message });
    }
  });





  // Interview request routes - each manager sees only their own data
  app.get("/api/interviews", authenticateToken, attachUserScope, async (req: AuthRequest, res) => {
    try {
      // Use accessibleUserIds to filter interviews based on manager hierarchy
      // Managers should NOT see unassigned requests from other managers
      const includeUnassigned = false; // Changed to prevent managers seeing other managers' unassigned requests
      const requests = await storage.getInterviewRequests(req.accessibleUserIds, includeUnassigned);

      res.json({ requests });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/interviews", authenticateToken, attachUserScope, requireRole(['security', 'admin', 'manager', 'office', 'office_team']), async (req: AuthRequest, res) => {
    try {
      // Transform the data before validation
      const transformedData = {
        position: req.body.position,
        candidateName: req.body.candidateName,
        candidateEmail: req.body.candidateEmail && req.body.candidateEmail.trim() !== "" ? req.body.candidateEmail : undefined,
        requestedById: req.user!.id,
        proposedDateTime: new Date(req.body.proposedDateTime),
        duration: parseInt(req.body.duration),
        managerId: req.body.managerId && req.body.managerId !== "" ? parseInt(req.body.managerId) : null,
        description: req.body.description && req.body.description.trim() !== "" ? req.body.description : undefined,
      };

      const requestData = insertInterviewRequestSchema.parse(transformedData);

      // Verify managerId is in accessible scope (for non-admin roles)
      if (req.user?.role !== 'admin' && requestData.managerId) {
        assertUserInScope(requestData.managerId, req.accessibleUserIds!);
      }

      const request = await storage.createInterviewRequest(requestData);

      // Send device notification about new interview request
      const { DeviceNotificationService } = await import("./device-notification-service");
      if (requestData.managerId) {
        await DeviceNotificationService.createUserNotification(
          requestData.managerId,
          "security_alert",
          "New Interview Request",
          `New interview request for ${requestData.candidateName} - ${requestData.position}`,
          "high"
        );
      }

      res.status(201).json({ request });
    } catch (error: any) {
      console.error('Interview request validation error:', error);
      console.error('Request body:', req.body);
      if (error.issues) {
        console.error('Validation issues:', error.issues);
      }
      res.status(400).json({ 
        message: error.message,
        details: error.issues || error
      });
    }
  });

  app.patch("/api/interviews/:id", authenticateToken, attachUserScope, requireRole(['manager', 'admin', 'office', 'office_team']), async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      let updates = { ...req.body };

      // Verify interview is in accessible scope (for non-admin roles)
      if (req.user?.role !== 'admin') {
        await assertInterviewInScope(id, req.accessibleUserIds!);
      }

      // Get original request for notification purposes
      const original = await storage.getInterviewRequest(id);
      if (!original) {
        return res.status(404).json({ message: "Interview request not found" });
      }

      // If status is being changed to approved or rejected, save who took the action
      if (updates.status && (updates.status === 'approved' || updates.status === 'rejected')) {
        updates.actionTakenById = req.user?.id;
      }

      await storage.updateInterviewRequest(id, updates);

      // Fetch the updated request with all relations to return to client
      const request = await storage.getInterviewRequest(id);
      if (!request) {
        return res.status(404).json({ message: "Interview request not found" });
      }

      // Send device notification if status changed
      if (updates.status && (updates.status === 'approved' || updates.status === 'rejected')) {
        const { DeviceNotificationService } = await import("./device-notification-service");
        const message = updates.status === 'approved' 
          ? 'تم الموافقة على طلب الاجتماع الخاص بك'
          : 'تم رفض طلب الاجتماع الخاص بك';
        await DeviceNotificationService.createUserNotification(
          original.requestedBy.id,
          "security_alert",
          "تحديث حالة الاجتماع",
          message,
          updates.status === 'approved' ? 'normal' : 'high'
        );
      }

      res.json({ request });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Analytics/Stats routes
  app.get("/api/stats", authenticateToken, async (req, res) => {
    try {
      const [userStats, todoStats, interviewStats] = await Promise.all([
        storage.getUserStats(),
        storage.getTodoStats(),
        storage.getInterviewStats(),
      ]);

      // Flatten the stats into a single object for the dashboard
      res.json({
        // User stats
        totalUsers: userStats.totalUsers || 0,
        activeUsers: userStats.activeUsers || 0,
        pendingUsers: userStats.pendingUsers || 0,

        // Todo stats
        totalTodos: todoStats.totalTodos || 0,
        completedTodos: todoStats.completedTodos || 0,
        pendingTodos: todoStats.pendingTodos || 0,

        // Interview stats
        totalRequests: interviewStats.totalRequests || 0,
        pendingRequests: interviewStats.pendingRequests || 0,
        approvedRequests: interviewStats.approvedRequests || 0,

        // Keep original nested structure for compatibility
        users: userStats,
        todos: todoStats,
        interviews: interviewStats,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/managers", authenticateToken, requireRole(['security', 'admin']), async (req, res) => {
    try {
      const managers = await storage.getUsersByRole('manager');
      const managersWithoutPasswords = managers.map(({ password, ...manager }) => manager);
      res.json({ managers: managersWithoutPasswords });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });



  // Feedback routes
  app.get("/api/feedback", authenticateToken, attachUserScope, async (req: AuthRequest, res) => {
    try {
      console.log("Fetching feedback for user:", req.user?.id, "role:", req.user?.role);
      let feedback;

      if (req.user?.role === 'admin' || req.user?.role === 'office' || req.user?.role === 'office_team') {
        // Admin and office roles can see all feedback
        feedback = await storage.getAllFeedback();
        console.log("Admin/office feedback:", feedback);
      } else if (req.user?.role === 'security') {
        // Security role can only see their own feedback
        feedback = await storage.getFeedbackByUser(req.user?.id || 0);
        console.log("Security user feedback:", feedback);
      } else {
        // Managers and other roles see feedback from their accessible users
        feedback = await storage.getFeedbackByAccessibleUsers(req.accessibleUserIds!);
        console.log("Manager/scoped feedback:", feedback);
      }

      console.log("Returning feedback count:", feedback?.length || 0);
      res.json({ feedback });
    } catch (error: any) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/feedback", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const feedbackData = {
        ...req.body,
        submittedById: req.user?.id || 0,
      };
      const feedback = await storage.createFeedback(feedbackData);
      res.status(201).json({ feedback });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/feedback/:id", authenticateToken, requireRole(['admin', 'manager']), async (req: AuthRequest, res) => {
    try {
      const feedbackId = parseInt(req.params.id);
      const success = await storage.deleteFeedback(feedbackId);

      if (!success) {
        return res.status(404).json({ message: "Feedback not found" });
      }

      res.json({ message: "Feedback deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Feedback Types routes
  app.post("/api/feedback-types", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const feedbackTypeData = {
        ...req.body,
        createdById: req.user!.id,
      };

      const feedbackType = await storage.createFeedbackType(feedbackTypeData);
      res.json({ feedbackType });
    } catch (error: any) {
      console.error("Error creating feedback type:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/feedback-types", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const feedbackTypes = await storage.getAllFeedbackTypes();
      res.json({ feedbackTypes });
    } catch (error: any) {
      console.error("Error fetching feedback types:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/feedback-types/:id", authenticateToken, requireRole(['admin']), async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;

      const feedbackType = await storage.updateFeedbackType(id, updates);
      if (!feedbackType) {
        return res.status(404).json({ message: "Feedback Type not found" });
      }
      res.json({ feedbackType });
    } catch (error: any) {
      console.error("Error updating feedback type:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/feedback-types/:id", authenticateToken, requireRole(['admin']), async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteFeedbackType(id);
      // deleteFeedbackType always succeeds (soft delete), so no need to check success
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting feedback type:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Interview comments routes
  app.get("/api/interviews/:id/comments", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const interviewId = parseInt(req.params.id);
      const comments = await storage.getInterviewComments(interviewId);
      res.json({ comments });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/interviews/:id/comments", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const interviewId = parseInt(req.params.id);
      const commentData = insertInterviewCommentSchema.parse({
        comment: req.body.comment,
        interviewRequestId: interviewId,
        authorId: req.user!.id,
      });

      const comment = await storage.createInterviewComment(commentData);
      res.status(201).json({ comment });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Archive routes
  app.get("/api/archive", authenticateToken, requireRole(['admin', 'manager', 'office', 'office_team']), async (req: AuthRequest, res) => {
    try {
      const archivedItems = await storage.getArchivedItems();
      res.json({ archivedItems });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/archive", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { itemType, itemId, reason } = req.body;

      console.log("Archive request received:", { itemType, itemId, reason, userId: req.user!.id });

      if (!itemType || !itemId) {
        return res.status(400).json({ message: "itemType and itemId are required" });
      }

      // Get the item data before archiving
      let itemData = {};
      if (itemType === 'todo_item') {
        const todoLists = await storage.getTodoLists();
        for (const list of todoLists) {
          const item = list.items.find(i => i.id === itemId);
          if (item) {
            itemData = item;
            break;
          }
        }
      } else if (itemType === 'todo_list') {
        const todoList = await storage.getTodoList(itemId);
        if (todoList) {
          itemData = todoList;
        }
      }

      console.log("Item data found:", itemData);

      const archivedItem = await storage.archiveItem(itemType, itemId, itemData, req.user!.id, reason);
      res.status(201).json({ archivedItem });
    } catch (error: any) {
      console.error("Archive error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/archive/:id", authenticateToken, requireRole(['admin', 'manager', 'office', 'office_team']), async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const { newReport, itemData } = req.body;

      if (newReport) {
        // Adding a new interview report
        const reportData = {
          description: newReport.description,
          rating: newReport.rating,
          reportedBy: req.user!.id,
          reportedAt: new Date().toISOString(),
        };

        // Get the current archived item to append the new report
        const currentItem = await storage.getArchivedItems();
        const targetItem = currentItem.find(item => item.id === id);

        if (!targetItem) {
          return res.status(404).json({ message: "Archive item not found" });
        }

        // Parse existing item data and add the new report
        let existingData = JSON.parse(targetItem.itemData);
        if (!existingData.reports) {
          existingData.reports = [];
        }
        existingData.reports.push(reportData);

        const updatedItem = await storage.updateArchivedItem(id, { 
          itemData: JSON.stringify(existingData) 
        });
        res.json({ success: true, item: updatedItem });
      } else if (itemData) {
        // Updating item data
        const updatedItem = await storage.updateArchivedItem(id, { itemData });
        res.json({ success: true, item: updatedItem });
      } else {
        res.status(400).json({ message: "No data provided for update" });
      }
    } catch (error: any) {
      console.error("Archive update error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/archive/:id/restore", authenticateToken, requireRole(['admin', 'manager']), async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const { itemType } = req.body;
      await storage.restoreArchivedItem(id, itemType);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/archive/:id", authenticateToken, requireRole(['admin', 'manager']), async (req: AuthRequest, res) => {
    try {
      const archiveId = parseInt(req.params.id);

      const success = await storage.deleteArchivedItem(archiveId);
      if (!success) {
        return res.status(404).json({ message: "Archive item not found" });
      }

      res.json({ success: true, message: "Archive item deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });


  // Operational data routes
  app.get("/api/operational-data", authenticateToken, async (req: AuthRequest, res) => {
    try {
      let entries = await storage.getOperationalData();

      // Filter data based on manager-staff relationships
      if (req.user?.role === 'admin') {
        // Admin can see all data
        res.json({ entries });
      } else if (req.user?.role === 'manager') {
        // Manager can only see their own data
        const filteredEntries = entries.filter(entry => entry.createdById === req.user?.id);
        res.json({ entries: filteredEntries });
      } else {
        // Staff members (secretary, office, office_team) can only see their manager's data
        const currentUser = await storage.getUser(req.user!.id);
        if (currentUser?.managerId) {
          const filteredEntries = entries.filter(entry => entry.createdById === currentUser.managerId);
          res.json({ entries: filteredEntries });
        } else {
          // If staff has no manager assigned, they see no data
          res.json({ entries: [] });
        }
      }
    } catch (error) {
      console.error("Error fetching operational data:", error);
      res.status(500).json({ message: "Failed to fetch operational data" });
    }
  });

  app.post("/api/operational-data", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const operationalDataEntry = {
        ...req.body,
        createdById: req.user!.id,
      };

      const entry = await storage.createOperationalData(operationalDataEntry);
      res.json(entry);
    } catch (error) {
      console.error("Error creating operational data:", error);
      res.status(500).json({ message: "Failed to create operational data" });
    }
  });

  app.delete("/api/operational-data/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      // Check if user is admin
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const entryId = parseInt(req.params.id);
      const success = await storage.deleteOperationalData(entryId);

      if (success) {
        res.json({ message: "Operational data deleted successfully" });
      } else {
        res.status(404).json({ message: "Operational data not found" });
      }
    } catch (error) {
      console.error("Error deleting operational data:", error);
      res.status(500).json({ message: "Failed to delete operational data" });
    }
  });

  app.delete("/api/operational-data", authenticateToken, async (req: AuthRequest, res) => {
    try {
      // Check if user is admin
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.clearAllOperationalData();
      res.json({ message: "All operational data cleared successfully" });
    } catch (error) {
      console.error("Error clearing operational data:", error);
      res.status(500).json({ message: "Failed to clear operational data" });
    }
  });

  // Device Notification routes
  app.get("/api/device-notifications", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { DeviceNotificationService } = await import("./device-notification-service");
      const notifications = await DeviceNotificationService.getUserNotifications(req.user!.id);
      res.json({ notifications });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/device-notifications/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const { DeviceNotificationService } = await import("./device-notification-service");
      await DeviceNotificationService.markAsRead(id, req.user!.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/device-notifications/mark-all-read", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { DeviceNotificationService } = await import("./device-notification-service");
      await DeviceNotificationService.markAllAsRead(req.user!.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/device-notifications/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      const { DeviceNotificationService } = await import("./device-notification-service");
      await DeviceNotificationService.deleteNotification(notificationId, req.user!.id);
      res.json({ message: "Notification deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  app.post("/api/device-notifications/test", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { DeviceNotificationService } = await import("./device-notification-service");
      await DeviceNotificationService.createUserNotification(
        req.user!.id,
        "general",
        "Test Notification",
        "This is a test device notification to verify the system is working correctly.",
        "normal",
        { 
          icon: "🧪",
          actionUrl: "/dashboard"
        }
      );

      res.json({ message: "Test notification sent successfully" });
    } catch (error) {
      console.error("Error sending test notification:", error);
      res.status(500).json({ message: "Failed to send test notification" });
    }
  });

  app.post("/api/device-notifications/system-alert", authenticateToken, requireRole(['admin']), async (req: AuthRequest, res) => {
    try {
      const { title, message, priority } = req.body;
      const { DeviceNotificationService } = await import("./device-notification-service");

      await DeviceNotificationService.createSystemAlert(
        title || "System Alert",
        message || "A system alert has been triggered",
        priority || "normal"
      );

      res.json({ message: "System alert sent to all users" });
    } catch (error) {
      console.error("Error sending system alert:", error);
      res.status(500).json({ message: "Failed to send system alert" });
    }
  });

  app.post("/api/broadcast-notification", authenticateToken, requireRole(['admin']), async (req: AuthRequest, res) => {
    try {
      const { title, message } = req.body;

      if (!title || !message) {
        return res.status(400).json({ message: "Title and message are required" });
      }

      const { DeviceNotificationService } = await import("./device-notification-service");

      // Get all active users count for response
      const allUsers = await storage.getAllUsers();
      const usersCount = allUsers.length;

      // Send broadcast notification to all users
      const notificationPromises = allUsers.map(user =>
        DeviceNotificationService.createUserNotification(
          user.id,
          "broadcast",
          title,
          message,
          "normal",
          { 
            icon: "📢",
            actionUrl: "/"
          }
        )
      );

      await Promise.all(notificationPromises);

      res.json({ 
        message: "Broadcast notification sent successfully",
        usersCount 
      });
    } catch (error) {
      console.error("Error sending broadcast notification:", error);
      res.status(500).json({ message: "Failed to send broadcast notification" });
    }
  });

  // Reminder notification service routes
  app.post("/api/reminder-notifications/trigger", authenticateToken, requireRole(['admin']), async (req: AuthRequest, res) => {
    try {
      const { ReminderNotificationService } = await import("./reminder-notification-service");
      await ReminderNotificationService.triggerCheck();
      res.json({ message: "Reminder check triggered successfully" });
    } catch (error) {
      console.error("Error triggering reminder check:", error);
      res.status(500).json({ message: "Failed to trigger reminder check" });
    }
  });

  app.get("/api/reminder-notifications/status", authenticateToken, requireRole(['admin']), async (req: AuthRequest, res) => {
    try {
      const { ReminderNotificationService } = await import("./reminder-notification-service");
      const status = ReminderNotificationService.getStatus();
      res.json({ status });
    } catch (error) {
      console.error("Error getting reminder service status:", error);
      res.status(500).json({ message: "Failed to get reminder service status" });
    }
  });

  // Backup and Restore routes
  app.get("/api/backup/download", authenticateToken, requireRole(['admin']), async (req: AuthRequest, res) => {
    try {
      const { spawn } = await import('child_process');
      const fs = await import('fs');
      const path = await import('path');
      const { URL } = await import('url');

      const backupDir = path.join(process.cwd(), 'backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(backupDir, `backup-${timestamp}.sql`);

      const dbUrl = process.env.DATABASE_URL;
      if (!dbUrl) {
        return res.status(500).json({ message: 'Database not configured' });
      }

      const dbConfig = new URL(dbUrl);
      const hostname = dbConfig.hostname || 'localhost';
      const port = dbConfig.port || '5432';
      const username = dbConfig.username || 'postgres';
      const password = dbConfig.password || '';
      const database = dbConfig.pathname?.slice(1) || 'postgres';

      const writeStream = fs.createWriteStream(backupFile);
      const env = { ...process.env };
      if (password) {
        env.PGPASSWORD = password;
      }

      const pgDump = spawn('pg_dump', [
        '-h', hostname,
        '-p', port,
        '-U', username,
        '-d', database,
        '-F', 'p',
        '--no-password'
      ], { env });

      let stderr = '';
      pgDump.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pgDump.stdout.pipe(writeStream);

      await new Promise((resolve, reject) => {
        pgDump.on('close', (code) => {
          if (code === 0) {
            resolve(code);
          } else {
            reject(new Error(`pg_dump failed: ${stderr}`));
          }
        });
        pgDump.on('error', (err) => {
          reject(new Error(`Failed to start pg_dump: ${err.message}`));
        });
      });

      res.download(backupFile, `database-backup-${timestamp}.sql`, (err) => {
        if (err) {
          console.error('Error downloading backup:', err);
        }
        try {
          fs.unlinkSync(backupFile);
        } catch (e) {
          console.error('Error deleting temp backup file:', e);
        }
      });
    } catch (error: any) {
      console.error("Error creating backup:", error);
      res.status(500).json({ message: "Failed to create backup: " + error.message });
    }
  });

  app.post("/api/backup/restore", authenticateToken, requireRole(['admin']), async (req: AuthRequest, res) => {
    try {
      const { spawn } = await import('child_process');
      const fs = await import('fs');
      const path = await import('path');
      const { URL } = await import('url');

      const { backupData } = req.body;

      if (!backupData || typeof backupData !== 'string') {
        return res.status(400).json({ message: "No valid backup data provided" });
      }

      const MAX_BACKUP_SIZE = 100 * 1024 * 1024;
      if (backupData.length > MAX_BACKUP_SIZE) {
        return res.status(400).json({ message: "Backup file too large (max 100MB)" });
      }

      const backupDir = path.join(process.cwd(), 'backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const restoreFile = path.join(backupDir, `restore-${timestamp}.sql`);

      fs.writeFileSync(restoreFile, backupData, 'utf-8');

      const dbUrl = process.env.DATABASE_URL;
      if (!dbUrl) {
        return res.status(500).json({ message: 'Database not configured' });
      }

      const dbConfig = new URL(dbUrl);
      const hostname = dbConfig.hostname || 'localhost';
      const port = dbConfig.port || '5432';
      const username = dbConfig.username || 'postgres';
      const password = dbConfig.password || '';
      const database = dbConfig.pathname?.slice(1) || 'postgres';

      const readStream = fs.createReadStream(restoreFile);
      const env = { ...process.env };
      if (password) {
        env.PGPASSWORD = password;
      }

      const psql = spawn('psql', [
        '-h', hostname,
        '-p', port,
        '-U', username,
        '-d', database,
        '--no-password'
      ], { env });

      let stderr = '';
      psql.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      readStream.pipe(psql.stdin);

      await new Promise((resolve, reject) => {
        psql.on('close', (code) => {
          if (code === 0) {
            resolve(code);
          } else {
            reject(new Error(`psql failed: ${stderr}`));
          }
        });
        psql.on('error', (err) => {
          reject(new Error(`Failed to start psql: ${err.message}`));
        });
      });

      try {
        fs.unlinkSync(restoreFile);
      } catch (e) {
        console.error('Error deleting temp restore file:', e);
      }

      res.json({ message: "Database restored successfully" });
    } catch (error: any) {
      console.error("Error restoring backup:", error);
      res.status(500).json({ message: "Failed to restore backup: " + error.message });
    }
  });

  // Weekly Meetings Routes
  app.post("/api/weekly-meetings", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (req.user?.role !== "admin" && req.user?.role !== "manager" && req.user?.role !== "office" && req.user?.role !== "staff_office") {
        return res.status(403).json({ message: "Only admin, manager, office, and staff_office users can create weekly meetings" });
      }
      const meeting = await storage.createWeeklyMeeting({
        weekNumber: req.body.weekNumber,
        year: req.body.year,
        meetingDate: new Date(req.body.meetingDate),
        createdById: req.user?.id,
      } as any);
      res.json(meeting);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/weekly-meetings", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const meetings = await storage.getWeeklyMeetings();
      res.json(meetings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/weekly-meetings/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const meeting = await storage.getWeeklyMeeting(parseInt(req.params.id));
      res.json(meeting || { message: "Not found" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/weekly-meetings/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const meetingId = parseInt(req.params.id);
      const { status, name } = req.body;
      const updates: any = {};
      if (status !== undefined) updates.status = status;
      if (name !== undefined) updates.name = name;

      // Get current meeting
      const meeting = await db.query.weeklyMeetings.findFirst({
        where: eq(weeklyMeetings.id, meetingId)
      });

      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }

      // Only execute update if there are fields to update
      if (Object.keys(updates).length > 0) {
        const result = await db.update(weeklyMeetings)
          .set(updates)
          .where(eq(weeklyMeetings.id, meetingId))
          .returning();
        res.json((result as any[])[0]);
      } else {
        // No database fields to update, just return the meeting
        res.json(meeting);
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/weekly-meetings/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (req.user?.role !== "admin" && req.user?.role !== "manager" && req.user?.role !== "office") {
        return res.status(403).json({ message: "Only admin, manager, and office users can delete weekly meetings" });
      }
      const meetingId = parseInt(req.params.id);
      
      // Delete the meeting
      const result = await db.delete(weeklyMeetings)
        .where(eq(weeklyMeetings.id, meetingId))
        .returning();
      
      if (result.length === 0) {
        return res.status(404).json({ message: "Meeting not found" });
      }
      
      res.json({ message: "Meeting deleted successfully", meeting: result[0] });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/weekly-meetings/all-tasks", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const userRole = req.user?.role;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const meetings = await storage.getWeeklyMeetings();
      const allTasks: any[] = [];
      for (const meeting of meetings) {
        const tasks = await storage.getWeeklyMeetingTasks(meeting.id);
        allTasks.push(...tasks);
      }

      // Admin, manager, office, and office_team can see all tasks
      const fullAccessRoles = ["admin", "manager", "office", "office_team"];
      if (fullAccessRoles.includes(userRole || "")) {
        res.json(allTasks);
      } else {
        // Other users can only see tasks assigned to them
        const filteredTasks = allTasks.filter((task: any) => {
          return task.assignedUserIds && Array.isArray(task.assignedUserIds) && task.assignedUserIds.includes(userId);
        });
        res.json(filteredTasks);
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/weekly-meetings/:id/tasks", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (req.user?.role !== "admin" && req.user?.role !== "manager") {
        return res.status(403).json({ message: "Only admin and manager can create tasks" });
      }
      const task = await storage.createWeeklyMeetingTask({ ...req.body, createdById: req.user?.id || 1 });

      // Send notifications to assigned users
      if (req.body.assignedUserIds && Array.isArray(req.body.assignedUserIds) && req.body.assignedUserIds.length > 0) {
        try {
          const { DeviceNotificationService } = await import("./device-notification-service");
          for (const userId of req.body.assignedUserIds) {
            await DeviceNotificationService.createNotification({
              userId: userId,
              type: "general",
              priority: "normal",
              title: "New Task Assigned",
              message: `You have a new task "${req.body.title}" assigned to you in this week's meeting.`,
            });
          }
        } catch (notificationError: any) {
          console.log("Note: Task created but notification sending had issues:", notificationError.message);
          // Don't fail the task creation if notification fails
        }
      }

      res.json(task);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/weekly-meetings/:id/tasks", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const userRole = req.user?.role;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const tasks = await storage.getWeeklyMeetingTasks(parseInt(req.params.id));

      // Admin, manager, office, and office_team can see all tasks
      const fullAccessRoles = ["admin", "manager", "office", "office_team"];
      let filteredTasks = tasks;

      if (!fullAccessRoles.includes(userRole || "")) {
        // Other users can only see tasks assigned to them
        filteredTasks = tasks.filter((task: any) => {
          return task.assignedUserIds && Array.isArray(task.assignedUserIds) && task.assignedUserIds.includes(userId);
        });
      }

      const tasksWithComments = await Promise.all(
        filteredTasks.map(async (task: any) => ({
          ...task,
          comments: await storage.getTaskComments(task.id)
        }))
      );
      res.json(tasksWithComments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/weekly-meetings/tasks/:taskId/comments", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const comment = await storage.createTaskComment(
        parseInt(req.params.taskId),
        req.user?.id || 1,
        req.body.comment,
        req.body.proofUrl
      );
      res.json(comment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/weekly-meetings/tasks/:taskId/comments", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const comments = await storage.getTaskComments(parseInt(req.params.taskId));
      res.json(comments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/weekly-meetings/comments/:commentId", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const commentId = parseInt(req.params.commentId);

      // Get the comment to check ownership
      const comment = await storage.getTaskCommentById(commentId);

      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      // Only allow deletion if:
      // 1. User is admin, manager, or office
      // 2. User is the author of the comment
      const isAdmin = req.user?.role === "admin" || req.user?.role === "manager" || req.user?.role === "office";
      const isAuthor = comment.authorId === req.user?.id;

      if (!isAdmin && !isAuthor) {
        return res.status(403).json({ message: "You can only delete your own comments" });
      }

      const result = await storage.deleteTaskComment(commentId);
      res.json({ success: true, comment: result });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Task Proof endpoints
  app.post("/api/weekly-meetings/tasks/:taskId/proof", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const { proofType, proofUrl, description } = req.body;
      if (!proofType || !proofUrl) {
        return res.status(400).json({ message: "proofType and proofUrl are required" });
      }
      const proof = await storage.createTaskProof(
        parseInt(req.params.taskId),
        req.user?.id || 1,
        proofType,
        proofUrl,
        description
      );
      res.json(proof);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/weekly-meetings/tasks/:taskId/proof", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const proofs = await storage.getTaskProofs(parseInt(req.params.taskId));
      res.json(proofs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/weekly-meetings/proof/:proofId", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (req.user?.role === "employee") {
        return res.status(403).json({ message: "Employee users cannot delete proof" });
      }
      const result = await storage.deleteTaskProof(parseInt(req.params.proofId));
      res.json({ success: true, proof: result });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/weekly-meetings/proof/:proofId/verify", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (req.user?.role !== "admin" && req.user?.role !== "manager" && req.user?.role !== "office") {
        return res.status(403).json({ message: "Only admin, manager, and office can verify proof" });
      }
      const { verificationNotes } = req.body;
      const result = await storage.verifyTaskProof(
        parseInt(req.params.proofId),
        req.user?.id || 1,
        verificationNotes
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/users", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const allUsers = await storage.getAllUsers();
      res.json(allUsers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/weekly-meetings/tasks/:taskId/progress", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const taskId = parseInt(req.params.taskId);
      const { current, status } = req.body;

      // Store progress in task comments as a special entry
      const comment = await storage.createTaskComment(
        taskId,
        req.user?.id || 1,
        `Progress updated: ${current}/${(await storage.getWeeklyMeetingTasks(1))[0]?.targetValue || 1} - Status: ${status}`,
        ""
      );
      res.json({ success: true, taskId, current, status });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/weekly-meetings/tasks/:taskId/complete", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (req.user?.role !== "admin" && req.user?.role !== "manager") {
        return res.status(403).json({ message: "Only admin and manager can complete tasks" });
      }
      const taskId = parseInt(req.params.taskId);
      const result = await storage.completeTask(taskId, req.user?.id);
      res.json(result || { message: "Task completed" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/weekly-meetings/tasks/:taskId/uncomplete", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (req.user?.role !== "admin" && req.user?.role !== "manager") {
        return res.status(403).json({ message: "Only admin and manager can uncomplete tasks" });
      }
      const taskId = parseInt(req.params.taskId);
      const result = await storage.uncompleteTask(taskId);
      res.json(result || { message: "Task uncompleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/weekly-meetings/tasks/:taskId", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (req.user?.role !== "admin" && req.user?.role !== "manager") {
        return res.status(403).json({ message: "Only admin and manager can edit tasks" });
      }
      const taskId = parseInt(req.params.taskId);
      const { title } = req.body;
      if (!title) {
        return res.status(400).json({ message: "Title is required" });
      }
      const result = await storage.updateTaskName(taskId, title);
      res.json(result || { message: "Task updated" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/weekly-meetings/tasks/:taskId", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (req.user?.role !== "admin" && req.user?.role !== "manager") {
        return res.status(403).json({ message: "Only admin and manager can delete tasks" });
      }
      const taskId = parseInt(req.params.taskId);
      const result = await storage.deleteTask(taskId);
      res.json(result || { message: "Task deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // IT Support Tickets Routes
  app.get("/api/it-support", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const userRole = req.user?.role;
      const userId = req.user?.id;
      
      // Admin, manager, and office can see all tickets
      if (userRole === "admin" || userRole === "manager" || userRole === "office") {
        const tickets = await storage.getItSupportTickets();
        // Enrich with user info
        const enrichedTickets = await Promise.all(tickets.map(async (ticket: any) => {
          const requestedBy = await storage.getUser(ticket.requestedById);
          const assignedTo = ticket.assignedToId ? await storage.getUser(ticket.assignedToId) : null;
          const completedBy = ticket.completedById ? await storage.getUser(ticket.completedById) : null;
          return {
            ...ticket,
            requestedBy: requestedBy ? { id: requestedBy.id, firstName: requestedBy.firstName, lastName: requestedBy.lastName } : null,
            assignedTo: assignedTo ? { id: assignedTo.id, firstName: assignedTo.firstName, lastName: assignedTo.lastName } : null,
            completedBy: completedBy ? { id: completedBy.id, firstName: completedBy.firstName, lastName: completedBy.lastName } : null,
          };
        }));
        res.json(enrichedTickets);
      } else {
        // Other users can only see their own tickets
        const tickets = await storage.getItSupportTicketsByUser(userId!);
        const enrichedTickets = await Promise.all(tickets.map(async (ticket: any) => {
          const requestedBy = await storage.getUser(ticket.requestedById);
          const assignedTo = ticket.assignedToId ? await storage.getUser(ticket.assignedToId) : null;
          return {
            ...ticket,
            requestedBy: requestedBy ? { id: requestedBy.id, firstName: requestedBy.firstName, lastName: requestedBy.lastName } : null,
            assignedTo: assignedTo ? { id: assignedTo.id, firstName: assignedTo.firstName, lastName: assignedTo.lastName } : null,
          };
        }));
        res.json(enrichedTickets);
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/it-support", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const ticket = await storage.createItSupportTicket({
        ...req.body,
        requestedById: req.user?.id,
      });
      res.json(ticket);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/it-support/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const ticket = await storage.getItSupportTicket(parseInt(req.params.id));
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      res.json(ticket);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/it-support/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const userRole = req.user?.role;
      const ticketId = parseInt(req.params.id);
      
      // Only admin, manager, office can update tickets (except status updates by the requester)
      if (userRole !== "admin" && userRole !== "manager" && userRole !== "office") {
        const ticket = await storage.getItSupportTicket(ticketId);
        if (!ticket || ticket.requestedById !== req.user?.id) {
          return res.status(403).json({ message: "You can only update your own tickets" });
        }
        // Regular users can only cancel their own tickets
        if (req.body.status && req.body.status !== "cancelled") {
          return res.status(403).json({ message: "You can only cancel your own tickets" });
        }
      }
      
      const updates: any = { ...req.body };
      
      // If marking as completed, set completedById and completedAt
      if (updates.status === "completed") {
        updates.completedById = req.user?.id;
        updates.completedAt = new Date();
      }
      
      const result = await storage.updateItSupportTicket(ticketId, updates);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/it-support/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const userRole = req.user?.role;
      if (userRole !== "admin" && userRole !== "manager") {
        return res.status(403).json({ message: "Only admin and manager can delete tickets" });
      }
      const result = await storage.deleteItSupportTicket(parseInt(req.params.id));
      res.json({ success: result });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}