import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const roleEnum = pgEnum("role", ["admin", "manager", "secretary"]);
export const statusEnum = pgEnum("status", ["active", "inactive", "pending"]);
export const priorityEnum = pgEnum("priority", ["low", "medium", "high", "urgent"]);
export const requestStatusEnum = pgEnum("request_status", ["pending", "approved", "rejected"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: roleEnum("role").notNull().default("secretary"),
  status: statusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastActiveAt: timestamp("last_active_at"),
});

export const todoLists = pgTable("todo_lists", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  createdById: integer("created_by_id").references(() => users.id).notNull(),
  assignedToId: integer("assigned_to_id").references(() => users.id),
  priority: priorityEnum("priority").notNull().default("medium"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const todoItems = pgTable("todo_items", {
  id: serial("id").primaryKey(),
  todoListId: integer("todo_list_id").references(() => todoLists.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  isCompleted: boolean("is_completed").notNull().default(false),
  priority: priorityEnum("priority").notNull().default("medium"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const interviewRequests = pgTable("interview_requests", {
  id: serial("id").primaryKey(),
  position: text("position").notNull(),
  candidateName: text("candidate_name").notNull(),
  candidateEmail: text("candidate_email"),
  requestedById: integer("requested_by_id").references(() => users.id).notNull(),
  managerId: integer("manager_id").references(() => users.id),
  proposedDateTime: timestamp("proposed_date_time").notNull(),
  duration: integer("duration").notNull(), // in minutes
  description: text("description"),
  status: requestStatusEnum("status").notNull().default("pending"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  createdTodoLists: many(todoLists, { relationName: "created_by" }),
  assignedTodoLists: many(todoLists, { relationName: "assigned_to" }),
  requestedInterviews: many(interviewRequests, { relationName: "requested_by" }),
  managedInterviews: many(interviewRequests, { relationName: "manager" }),
}));

export const todoListsRelations = relations(todoLists, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [todoLists.createdById],
    references: [users.id],
    relationName: "created_by",
  }),
  assignedTo: one(users, {
    fields: [todoLists.assignedToId],
    references: [users.id],
    relationName: "assigned_to",
  }),
  items: many(todoItems),
}));

export const todoItemsRelations = relations(todoItems, ({ one }) => ({
  todoList: one(todoLists, {
    fields: [todoItems.todoListId],
    references: [todoLists.id],
  }),
}));

export const interviewRequestsRelations = relations(interviewRequests, ({ one }) => ({
  requestedBy: one(users, {
    fields: [interviewRequests.requestedById],
    references: [users.id],
    relationName: "requested_by",
  }),
  manager: one(users, {
    fields: [interviewRequests.managerId],
    references: [users.id],
    relationName: "manager",
  }),
}));


// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastActiveAt: true,
});

export const insertTodoListSchema = createInsertSchema(todoLists).omit({
  id: true,
  createdAt: true,
});

export const insertTodoItemSchema = createInsertSchema(todoItems).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertInterviewRequestSchema = createInsertSchema(interviewRequests, {
  candidateEmail: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).transform((data) => ({
  ...data,
  candidateEmail: data.candidateEmail && data.candidateEmail.trim() !== "" ? data.candidateEmail : undefined,
  description: data.description && data.description.trim() !== "" ? data.description : undefined,
}));


export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type TodoList = typeof todoLists.$inferSelect;
export type InsertTodoList = z.infer<typeof insertTodoListSchema>;
export type TodoItem = typeof todoItems.$inferSelect;
export type InsertTodoItem = z.infer<typeof insertTodoItemSchema>;
export type InterviewRequest = typeof interviewRequests.$inferSelect;
export type InsertInterviewRequest = z.infer<typeof insertInterviewRequestSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;

// Export notification types
export * from "./notification-schema";

// Export feedback and archive types
export * from "./feedback-schema";
