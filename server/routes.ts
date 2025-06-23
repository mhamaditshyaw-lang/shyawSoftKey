import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { insertUserSchema, loginSchema, insertTodoListSchema, insertTodoItemSchema, insertInterviewRequestSchema } from "@shared/schema";
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

  // User management routes (Admin only)
  app.get("/api/users", authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json({ users: usersWithoutPasswords });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/users", authenticateToken, requireRole(['admin']), async (req, res) => {
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

      // Send notification about new user creation
      const { NotificationService } = await import("./notification-service");
      await NotificationService.notifyUserCreated(user.id, req.user!.id);

      const { password, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/users/:id", authenticateToken, requireRole(['admin']), async (req, res) => {
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

  // Todo routes (users only see their own)
  app.get("/api/todos", authenticateToken, async (req: AuthRequest, res) => {
    try {
      // All users (including managers and admins) only see their own todos
      const todoLists = await storage.getTodoListsByUser(req.user!.id);
      res.json({ todoLists });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/todos", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const todoData = insertTodoListSchema.parse({
        ...req.body,
        createdById: req.user!.id,
      });
      
      const todoList = await storage.createTodoList(todoData);
      const fullTodoList = await storage.getTodoList(todoList.id);
      
      // Send notification if todo is assigned to someone
      if (todoData.assignedToId && todoData.assignedToId !== req.user!.id) {
        const { NotificationService } = await import("./notification-service");
        await NotificationService.notifyTodoAssigned(todoList.id, todoData.assignedToId, req.user!.id);
      }
      
      res.status(201).json({ todoList: fullTodoList });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/todos/items", authenticateToken, async (req, res) => {
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

  app.post("/api/todos/:id/items", authenticateToken, async (req, res) => {
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

  // Smart prioritization endpoints
  app.get("/api/todos/priorities", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { PrioritizationService } = await import("./prioritization-service");
      // All users only see their own priority analysis
      const priorities = await PrioritizationService.getPrioritizedTodos(req.user!.id);
      res.json({ priorities });
    } catch (error: any) {
      console.error("Error getting prioritized todos:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/todos/recommendations", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { PrioritizationService } = await import("./prioritization-service");
      const recommendations = await PrioritizationService.getDailyRecommendations(req.user!.id);
      res.json({ recommendations });
    } catch (error: any) {
      console.error("Error getting recommendations:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/todos/auto-prioritize", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { PrioritizationService } = await import("./prioritization-service");
      const result = await PrioritizationService.autoPrioritizeTodos(req.user!.id);
      res.json({ result });
    } catch (error: any) {
      console.error("Error auto-prioritizing todos:", error);
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
      } else if (req.user!.role === 'secretary') {
        requests = await storage.getInterviewRequestsBySecretary(req.user!.id);
      }
      res.json({ requests });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/interviews", authenticateToken, requireRole(['secretary', 'admin']), async (req: AuthRequest, res) => {
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
      
      // Send notification about new interview request
      const { NotificationService } = await import("./notification-service");
      await NotificationService.notifyInterviewRequest(
        request.id, 
        req.user!.id, 
        requestData.managerId || undefined
      );
      
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

  app.patch("/api/interviews/:id", authenticateToken, requireRole(['manager', 'admin']), async (req, res) => {
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

      // Send notification if status changed
      if (updates.status && original && (updates.status === 'approved' || updates.status === 'rejected')) {
        const { NotificationService } = await import("./notification-service");
        await NotificationService.notifyInterviewStatus(
          id, 
          updates.status, 
          original.requestedBy.id, 
          req.user!.id
        );
      }

      res.json({ request });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Analytics/Stats routes
  app.get("/api/stats", authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
      const [userStats, todoStats, interviewStats] = await Promise.all([
        storage.getUserStats(),
        storage.getTodoStats(),
        storage.getInterviewStats(),
      ]);

      res.json({
        users: userStats,
        todos: todoStats,
        interviews: interviewStats,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/managers", authenticateToken, requireRole(['secretary', 'admin']), async (req, res) => {
    try {
      const managers = await storage.getUsersByRole('manager');
      const managersWithoutPasswords = managers.map(({ password, ...manager }) => manager);
      res.json({ managers: managersWithoutPasswords });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Notification routes
  app.get("/api/notifications", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const notifications = await storage.getUserNotifications(req.user!.id);
      res.json({ notifications });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/notifications/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markNotificationAsRead(id, req.user!.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/notifications/mark-all-read", authenticateToken, async (req: AuthRequest, res) => {
    try {
      await storage.markAllNotificationsAsRead(req.user!.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Feedback routes
  app.get("/api/feedback", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const feedback = await storage.getAllFeedback();
      res.json({ feedback });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/feedback", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const feedbackData = {
        ...req.body,
        submittedById: req.user!.id,
      };
      const feedback = await storage.createFeedback(feedbackData);
      res.status(201).json({ feedback });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Archive routes
  app.get("/api/archive", authenticateToken, requireRole(['admin', 'manager']), async (req: AuthRequest, res) => {
    try {
      const archivedItems = await storage.getArchivedItems();
      res.json({ archivedItems });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/archive", authenticateToken, requireRole(['admin', 'manager']), async (req: AuthRequest, res) => {
    try {
      const { itemType, itemId, itemData, reason } = req.body;
      const archivedItem = await storage.archiveItem(itemType, itemId, itemData, req.user!.id, reason);
      res.status(201).json({ archivedItem });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/archive/:id", authenticateToken, requireRole(['admin', 'manager']), async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const { itemData } = req.body;
      const updatedItem = await storage.updateArchivedItem(id, { itemData });
      res.json({ success: true, item: updatedItem });
    } catch (error: any) {
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


  const httpServer = createServer(app);
  return httpServer;
}
