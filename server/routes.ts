import type { Express } from "express";
import { createServer, type Server } from "http";

import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { insertUserSchema, loginSchema, insertTodoListSchema, insertTodoItemSchema, insertInterviewRequestSchema, changePasswordSchema, updateUserPasswordSchema, insertReminderSchema } from "@shared/schema";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
  };
}

// Middleware to verify JWT token
async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
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
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
}

// Middleware to check user role
function requireRole(roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
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
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      const { password: _, ...userWithoutPassword } = user;
      res.json({ 
        token, 
        user: userWithoutPassword 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
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

  // User management routes (Admin only can view all users)
  app.get("/api/users", authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
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
      const updates = req.body;

      if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 12);
      }

      const user = await storage.updateUser(id, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
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

  // Todo routes (office role can see all, others see their own)
  app.get("/api/todos", authenticateToken, async (req: AuthRequest, res) => {
    try {
      let todoLists;
      if (req.user?.role === 'office' || req.user?.role === 'admin' || req.user?.role === 'user' || req.user?.role === 'office_team') {
        // Office, admin, user, and office_team roles can see all todo lists
        todoLists = await storage.getTodoLists();
      } else {
        // Manager, security, and other roles only see their own todos
        todoLists = await storage.getTodoListsByUser(req.user?.id || 0);
      }
      res.json({ todoLists });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/todos", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const todoData = insertTodoListSchema.parse({
        ...req.body,
        createdById: req.user?.id || 0,
      });

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

      res.status(201).json({ todoList: fullTodoList });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/todos/items", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { todoListId, text, priority } = req.body;
      console.log("Creating todo item with data:", { todoListId, text, priority, user: req.user?.id });

      // Validate input
      if (!todoListId || !text || !text.trim()) {
        return res.status(400).json({ message: "Todo list ID and task text are required" });
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

  app.post("/api/todos/:id/items", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const todoListId = parseInt(req.params.id);
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

  app.patch("/api/todos/items/:id", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;

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
  app.delete("/api/todos/items/:id", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
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
  app.delete("/api/todos/:id/items", authenticateToken, async (req, res) => {
    try {
      const todoListId = parseInt(req.params.id);
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
  app.delete("/api/todos/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const todoListId = parseInt(req.params.id);
      
      // Check if the todo list exists and get its details for authorization
      const existingList = await storage.getTodoList(todoListId);
      if (!existingList) {
        return res.status(404).json({ message: "Todo list not found" });
      }

      // Authorization: Allow deletion if user is admin/office or owns/is assigned to the list
      const isAuthorized = req.user?.role === 'admin' || 
                          req.user?.role === 'office' ||
                          existingList.createdById === req.user?.id ||
                          existingList.assignedToId === req.user?.id;

      if (!isAuthorized) {
        return res.status(403).json({ message: "Not authorized to delete this todo list" });
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
  app.patch("/api/todos/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const todoListId = parseInt(req.params.id);
      
      // Check if the todo list exists and get its details for authorization
      const existingList = await storage.getTodoList(todoListId);
      if (!existingList) {
        return res.status(404).json({ message: "Todo list not found" });
      }

      // Authorization: Allow updates if user is admin/office or owns/is assigned to the list
      const isAuthorized = req.user?.role === 'admin' || 
                          req.user?.role === 'office' ||
                          existingList.createdById === req.user?.id ||
                          existingList.assignedToId === req.user?.id;

      if (!isAuthorized) {
        return res.status(403).json({ message: "Not authorized to update this todo list" });
      }

      // Validate updates with Zod - only allow specific fields
      const updateTodoListSchema = insertTodoListSchema.pick({
        title: true,
        description: true,
        priority: true,
        assignedToId: true,
      }).partial();

      const validatedUpdates = updateTodoListSchema.parse(req.body);

      const todoList = await storage.updateTodoList(todoListId, validatedUpdates);
      if (!todoList) {
        return res.status(404).json({ message: "Todo list not found" });
      }

      res.json({ todoList });
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
      const reminderData = insertReminderSchema.parse({
        ...req.body,
        createdById: req.user?.id || 0,
      });

      const reminder = await storage.createReminder(reminderData);
      res.status(201).json({ reminder });
    } catch (error: any) {
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

      // Get todo stats based on role
      let todoLists;
      if (req.user!.role === 'admin') {
        // Admins see all tasks
        todoLists = await storage.getTodoLists();
      } else if (req.user!.role === 'manager') {
        // Managers only see tasks assigned to them or created by them
        todoLists = await storage.getTodoListsByUser(req.user!.id);
      } else {
        // Others see only their own tasks
        todoLists = await storage.getTodoListsByUser(req.user!.id);
      }

      // Get todo stats based on role
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

      // Get interview stats based on role
      let interviewStats, interviews;
      if (req.user!.role === 'admin') {
        interviewStats = await storage.getInterviewStats();
        interviews = await storage.getInterviewRequests();
      } else if (req.user!.role === 'manager') {
        interviewStats = await storage.getInterviewStats();
        interviews = await storage.getInterviewRequestsByManager(req.user!.id);
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





  // Interview request routes
  app.get("/api/interviews", authenticateToken, async (req: AuthRequest, res) => {
    try {
      let requests: any[] = [];
      if (req.user!.role === 'admin') {
        requests = await storage.getInterviewRequests();
      } else if (req.user!.role === 'manager') {
        // Managers see requests assigned to them OR unassigned requests
        const allRequests = await storage.getInterviewRequests();
        requests = allRequests.filter(r => 
          r.managerId === req.user!.id || r.managerId === null
        );
      } else if (req.user!.role === 'security') {
        requests = await storage.getInterviewRequestsByUser(req.user!.id);
      }
      res.json({ requests });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/interviews", authenticateToken, requireRole(['security', 'admin', 'manager', 'office', 'office_team']), async (req: AuthRequest, res) => {
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

  app.patch("/api/interviews/:id", authenticateToken, requireRole(['manager', 'admin', 'office', 'office_team']), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;

      // Get original request to get requestedById
      const allRequests = await storage.getInterviewRequests();
      const original = allRequests.find(r => r.id === id);

      const request = await storage.updateInterviewRequest(id, updates);
      if (!request) {
        return res.status(404).json({ message: "Interview request not found" });
      }

      // Send device notification if status changed
      if (updates.status && original && (updates.status === 'approved' || updates.status === 'rejected')) {
        const { DeviceNotificationService } = await import("./device-notification-service");
        await DeviceNotificationService.createUserNotification(
          original.requestedBy.id,
          "security_alert",
          "Interview Status Update",
          `Your interview request has been ${updates.status}`,
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
  app.get("/api/feedback", authenticateToken, async (req: AuthRequest, res) => {
    try {
      let feedback;
      if (req.user?.role === 'security') {
        // Security role can only see their own feedback
        feedback = await storage.getFeedbackByUser(req.user?.id || 0);
      } else {
        // All other roles can see all feedback
        feedback = await storage.getAllFeedback();
      }
      res.json({ feedback });
    } catch (error: any) {
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
      const success = await storage.deleteFeedbackType(id);
      if (!success) {
        return res.status(404).json({ message: "Feedback Type not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting feedback type:", error);
      res.status(500).json({ message: error.message });
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
      const entries = await storage.getOperationalData();
      res.json({ entries });
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

  const httpServer = createServer(app);



  return httpServer;
}