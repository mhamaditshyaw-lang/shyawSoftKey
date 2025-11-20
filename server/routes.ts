import type { Express } from "express";
import { createServer, type Server } from "http";

import { storage } from "./storage";
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
      const passwordData = changePasswordSchema.parse(req.body);

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
      const pages = Object.entries(PAGE_PERMISSIONS).map(([path, permission]) => ({
        path,
        permission,
        label: path === '/' ? 'Dashboard' : path.split('/').pop()?.split('-').map(word => 
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

  // Todo routes - each manager sees only their own data
  app.get("/api/todos", authenticateToken, attachUserScope, async (req: AuthRequest, res) => {
    try {
      // Use accessibleUserIds to filter todos based on manager hierarchy
      // This ensures managers can only see todos created by or assigned to their accessible users
      const todoLists = await storage.getTodoLists(req.accessibleUserIds);
      // Sanitize user data to remove passwords and other sensitive information
      const sanitizedTodoLists = sanitizeTodoLists(todoLists);
      res.json({ todoLists: sanitizedTodoLists });
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
      let updates = { ...req.body };

      // Verify todo item is in accessible scope (for non-admin roles)
      if (req.user?.role !== 'admin') {
        await assertTodoItemInScope(id, req.accessibleUserIds!);
      }

      // If marking as complete, auto-set completedById
      if (updates.isCompleted === true && !updates.completedById) {
        updates.completedById = req.user?.id;
      }

      const todoItem = await storage.updateTodoItem(id, updates);
      if (!todoItem) {
        return res.status(404).json({ message: "Todo item not found" });
      }

      res.json({ todoItem });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Delete todo item
  app.delete("/api/todos/items/:id", authenticateToken, attachUserScope, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Verify todo item is in accessible scope (for non-admin roles)
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
      res.status(500).json({ message: error.message || "Failed to delete todo item" });
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

  const httpServer = createServer(app);



  return httpServer;
}