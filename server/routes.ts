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

  // Todo routes
  app.get("/api/todos", authenticateToken, async (req: AuthRequest, res) => {
    try {
      let todoLists;
      if (req.user!.role === 'admin') {
        todoLists = await storage.getTodoLists();
      } else {
        todoLists = await storage.getTodoListsByUser(req.user!.id);
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
        createdById: req.user!.id,
      });
      
      const todoList = await storage.createTodoList(todoData);
      const fullTodoList = await storage.getTodoList(todoList.id);
      res.status(201).json({ todoList: fullTodoList });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
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

  // Interview request routes
  app.get("/api/interviews", authenticateToken, async (req: AuthRequest, res) => {
    try {
      let requests: any[] = [];
      switch (req.user!.role) {
        case 'admin':
          requests = await storage.getInterviewRequests();
          break;
        case 'manager':
          requests = await storage.getInterviewRequestsByManager(req.user!.id);
          break;
        case 'secretary':
          requests = await storage.getInterviewRequestsBySecretary(req.user!.id);
          break;
        default:
          requests = [];
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
        ...req.body,
        requestedById: req.user!.id,
        proposedDateTime: new Date(req.body.proposedDateTime),
        duration: parseInt(req.body.duration),
        managerId: req.body.managerId ? parseInt(req.body.managerId) : null,
      };
      
      const requestData = insertInterviewRequestSchema.parse(transformedData);
      const request = await storage.createInterviewRequest(requestData);
      res.status(201).json({ request });
    } catch (error: any) {
      console.error('Interview request validation error:', error);
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/interviews/:id", authenticateToken, requireRole(['manager', 'admin']), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const request = await storage.updateInterviewRequest(id, updates);
      if (!request) {
        return res.status(404).json({ message: "Interview request not found" });
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

  const httpServer = createServer(app);
  return httpServer;
}
