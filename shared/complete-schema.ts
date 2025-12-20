import { pgTable, text, serial, integer, boolean, timestamp, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const roleEnum = pgEnum("role", ["admin", "manager", "security", "secretary", "office", "office_team"]);
export const statusEnum = pgEnum("status", ["active", "inactive", "pending"]);
export const priorityEnum = pgEnum("priority", ["low", "medium", "high", "urgent"]);
export const requestStatusEnum = pgEnum("request_status", ["pending", "approved", "rejected"]);
export const feedbackTypeEnum = pgEnum("feedback_type", [
  "interview_feedback",
  "general_feedback", 
  "system_improvement",
  "user_experience"
]);
export const ratingEnum = pgEnum("rating", ["1", "2", "3", "4", "5"]);
export const deviceNotificationTypeEnum = pgEnum("device_notification_type", [
  "system_alert",
  "task_reminder",
  "user_activity",
  "security_alert",
  "maintenance_notice",
  "deadline_warning",
  "achievement",
  "general"
]);
export const deviceNotificationPriorityEnum = pgEnum("device_notification_priority", [
  "low",
  "normal",
  "high", 
  "urgent"
]);
export const meetingStatusEnum = pgEnum("meeting_status", ["planned", "completed", "archived"]);
export const taskProgressEnum = pgEnum("task_progress", ["not_started", "in_progress", "completed", "verified"]);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: roleEnum("role").notNull().default("security"),
  status: statusEnum("status").notNull().default("pending"),
  permissions: jsonb("permissions").default({}) as any,
  department: text("department"),
  position: text("position"),
  phoneNumber: text("phone_number"),
  comments: text("comments"),
  managerId: integer("manager_id").references((): any => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastActiveAt: timestamp("last_active_at"),
} as any);

// Todo Lists table
export const todoLists = pgTable("todo_lists", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  createdById: integer("created_by_id").references(() => users.id).notNull(),
  assignedToId: integer("assigned_to_id").references(() => users.id),
  priority: priorityEnum("priority").notNull().default("medium"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Todo Items table
export const todoItems = pgTable("todo_items", {
  id: serial("id").primaryKey(),
  todoListId: integer("todo_list_id").references(() => todoLists.id, {
    onDelete: "cascade"
  }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  isCompleted: boolean("is_completed").notNull().default(false),
  priority: priorityEnum("priority").notNull().default("medium"),
  dueDate: timestamp("due_date"),
  reminderDate: timestamp("reminder_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// Reminders table
export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  todoItemId: integer("todo_item_id").references(() => todoItems.id, {
    onDelete: "cascade"
  }),
  reminderDate: timestamp("reminder_date").notNull(),
  message: text("message"),
  title: text("title"),
  itemText: text("item_text"),
  itemData: jsonb("item_data"),
  isCompleted: boolean("is_completed").notNull().default(false),
  notificationSent: boolean("notification_sent").notNull().default(false),
  createdById: integer("created_by_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Interview Requests table
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
  actionTakenById: integer("action_taken_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Interview Comments table
export const interviewComments = pgTable("interview_comments", {
  id: serial("id").primaryKey(),
  interviewRequestId: integer("interview_request_id").references(() => interviewRequests.id, { onDelete: "cascade" }).notNull(),
  authorId: integer("author_id").references(() => users.id).notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Operational Data table
export const operationalData = pgTable("operational_data", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  data: jsonb("data").notNull(),
  stats: jsonb("stats"),
  createdById: integer("created_by_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Feedback Types table
export const feedbackTypes = pgTable("feedback_types", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  isActive: integer("is_active").default(1).notNull(), // 1 = active, 0 = inactive
  createdById: integer("created_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Feedback table
export const feedback = pgTable("feedback", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  type: text("type").notNull(), // Changed from enum to text to support dynamic types
  title: text("title").notNull(),
  description: text("description").notNull(),
  rating: ratingEnum("rating"),
  submittedById: integer("submitted_by_id").notNull().references(() => users.id),
  relatedInterviewId: integer("related_interview_id").references(() => interviewRequests.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Archived Items table
export const archivedItems = pgTable("archived_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  itemType: text("item_type").notNull(), // 'interview', 'todo', 'user'
  itemId: integer("item_id").notNull(),
  itemData: text("item_data").notNull(), // JSON string of the original item
  archivedById: integer("archived_by_id").notNull().references(() => users.id),
  archivedAt: timestamp("archived_at").defaultNow().notNull(),
  reason: text("reason"), // Optional reason for archiving
});

// Device Notifications table
export const deviceNotifications = pgTable("device_notifications", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: deviceNotificationTypeEnum("type").notNull(),
  priority: deviceNotificationPriorityEnum("priority").notNull().default("normal"),
  title: text("title").notNull(),
  message: text("message").notNull(),
  icon: text("icon"), // Icon name or emoji
  actionUrl: text("action_url"), // URL to redirect when clicked
  isRead: boolean("is_read").default(false).notNull(),
  isSentToDevice: boolean("is_sent_to_device").default(false).notNull(),
  deviceData: text("device_data"), // JSON string for device notification data
  expiresAt: timestamp("expires_at"), // When notification expires
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Weekly Meetings table
export const weeklyMeetings = pgTable("weekly_meetings", {
  id: serial("id").primaryKey(),
  weekNumber: integer("week_number").notNull(),
  year: integer("year").notNull(),
  meetingDate: timestamp("meeting_date").notNull(),
  name: text("name"),
  status: meetingStatusEnum("status").notNull().default("planned"),
  createdById: integer("created_by_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Weekly Meeting Tasks table
export const weeklyMeetingTasks = pgTable("weekly_meeting_tasks", {
  id: serial("id").primaryKey(),
  meetingId: integer("meeting_id").references(() => weeklyMeetings.id, { onDelete: "cascade" }).notNull(),
  departmentName: text("department_name").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  targetValue: integer("target_value"),
  priority: priorityEnum("priority").notNull().default("medium"),
  assignedUserIds: integer("assigned_user_ids").array(),
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Task Comments table
export const taskComments = pgTable("task_comments", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => weeklyMeetingTasks.id, { onDelete: "cascade" }).notNull(),
  authorId: integer("author_id").references(() => users.id).notNull(),
  comment: text("comment").notNull(),
  proofUrl: text("proof_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Department Task Progress table
export const departmentTaskProgress = pgTable("department_task_progress", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => weeklyMeetingTasks.id, { onDelete: "cascade" }).notNull(),
  departmentHeadId: integer("department_head_id").references(() => users.id).notNull(),
  progress: integer("progress").notNull().default(0),
  status: taskProgressEnum("status").notNull().default("not_started"),
  notes: text("notes"),
  proofUrl: text("proof_url"),
  lastUpdatedById: integer("last_updated_by_id").references(() => users.id),
  lastUpdatedAt: timestamp("last_updated_at").defaultNow().notNull(),
});

// Weekly Meeting Archive table
export const weeklyMeetingArchive = pgTable("weekly_meeting_archive", {
  id: serial("id").primaryKey(),
  meetingId: integer("meeting_id").notNull(),
  meetingData: jsonb("meeting_data").notNull(),
  tasksData: jsonb("tasks_data").notNull(),
  resultsData: jsonb("results_data"),
  archivedById: integer("archived_by_id").references(() => users.id).notNull(),
  archivedAt: timestamp("archived_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  createdTodoLists: many(todoLists, { relationName: "created_by" }),
  assignedTodoLists: many(todoLists, { relationName: "assigned_to" }),
  requestedInterviews: many(interviewRequests, { relationName: "requested_by" }),
  managedInterviews: many(interviewRequests, { relationName: "manager" }),
  feedback: many(feedback),
  createdFeedbackTypes: many(feedbackTypes),
  archivedItems: many(archivedItems),
  deviceNotifications: many(deviceNotifications),
  operationalData: many(operationalData),
  manager: one(users, {
    fields: [users.managerId],
    references: [users.id],
    relationName: "manager_staff",
  }),
  staff: many(users, { relationName: "manager_staff" }),
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

export const todoItemsRelations = relations(todoItems, ({ one, many }) => ({
  todoList: one(todoLists, {
    fields: [todoItems.todoListId],
    references: [todoLists.id],
  }),
  reminders: many(reminders),
}));

export const remindersRelations = relations(reminders, ({ one }) => ({
  todoItem: one(todoItems, {
    fields: [reminders.todoItemId],
    references: [todoItems.id],
  }),
}));

export const interviewRequestsRelations = relations(interviewRequests, ({ one, many }) => ({
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
  actionTakenBy: one(users, {
    fields: [interviewRequests.actionTakenById],
    references: [users.id],
    relationName: "action_taken_by",
  }),
  comments: many(interviewComments),
  feedback: many(feedback),
}));

export const interviewCommentsRelations = relations(interviewComments, ({ one }) => ({
  interviewRequest: one(interviewRequests, {
    fields: [interviewComments.interviewRequestId],
    references: [interviewRequests.id],
  }),
  author: one(users, {
    fields: [interviewComments.authorId],
    references: [users.id],
  }),
}));

export const operationalDataRelations = relations(operationalData, ({ one }) => ({
  createdBy: one(users, {
    fields: [operationalData.createdById],
    references: [users.id],
  }),
}));

export const feedbackTypesRelations = relations(feedbackTypes, ({ one }) => ({
  createdBy: one(users, {
    fields: [feedbackTypes.createdById],
    references: [users.id],
  }),
}));

export const feedbackRelations = relations(feedback, ({ one }) => ({
  submittedBy: one(users, {
    fields: [feedback.submittedById],
    references: [users.id],
  }),
  relatedInterview: one(interviewRequests, {
    fields: [feedback.relatedInterviewId],
    references: [interviewRequests.id],
  }),
}));

export const archivedItemsRelations = relations(archivedItems, ({ one }) => ({
  archivedBy: one(users, {
    fields: [archivedItems.archivedById],
    references: [users.id],
  }),
}));

export const deviceNotificationsRelations = relations(deviceNotifications, ({ one }) => ({
  user: one(users, {
    fields: [deviceNotifications.userId],
    references: [users.id],
  }),
}));

export const weeklyMeetingsRelations = relations(weeklyMeetings, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [weeklyMeetings.createdById],
    references: [users.id],
  }),
  tasks: many(weeklyMeetingTasks),
}));

export const weeklyMeetingTasksRelations = relations(weeklyMeetingTasks, ({ one, many }) => ({
  meeting: one(weeklyMeetings, {
    fields: [weeklyMeetingTasks.meetingId],
    references: [weeklyMeetings.id],
  }),
  progress: many(departmentTaskProgress),
  comments: many(taskComments),
}));

export const taskCommentsRelations = relations(taskComments, ({ one }) => ({
  task: one(weeklyMeetingTasks, {
    fields: [taskComments.taskId],
    references: [weeklyMeetingTasks.id],
  }),
  author: one(users, {
    fields: [taskComments.authorId],
    references: [users.id],
  }),
}));

export const departmentTaskProgressRelations = relations(departmentTaskProgress, ({ one }) => ({
  task: one(weeklyMeetingTasks, {
    fields: [departmentTaskProgress.taskId],
    references: [weeklyMeetingTasks.id],
  }),
  departmentHead: one(users, {
    fields: [departmentTaskProgress.departmentHeadId],
    references: [users.id],
    relationName: "dept_head",
  }),
  lastUpdatedBy: one(users, {
    fields: [departmentTaskProgress.lastUpdatedById],
    references: [users.id],
    relationName: "last_updated",
  }),
}));

export const weeklyMeetingArchiveRelations = relations(weeklyMeetingArchive, ({ one }) => ({
  archivedBy: one(users, {
    fields: [weeklyMeetingArchive.archivedById],
    references: [users.id],
  }),
}));

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastActiveAt: true,
});

export const insertTodoListSchema = createInsertSchema(todoLists).omit({
  id: true,
  createdAt: true,
});

export const insertTodoItemSchema = createInsertSchema(todoItems, {
  title: z.string().min(1, "Title is required"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
});

export const insertReminderSchema = createInsertSchema(reminders, {
  reminderDate: z.string().datetime().or(z.date()).transform(val => 
    typeof val === 'string' ? val : val.toISOString()
  ),
  todoItemId: z.number().optional().nullable(),
}).omit({
  id: true,
  createdAt: true,
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

export const insertInterviewCommentSchema = createInsertSchema(interviewComments).omit({
  id: true,
  createdAt: true,
});

export const insertOperationalDataSchema = createInsertSchema(operationalData).omit({
  id: true,
  createdAt: true,
});

export const insertFeedbackTypeSchema = createInsertSchema(feedbackTypes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertArchivedItemSchema = createInsertSchema(archivedItems).omit({
  id: true,
  archivedAt: true,
});

export const insertDeviceNotificationSchema = createInsertSchema(deviceNotifications).omit({
  id: true,
  createdAt: true,
});

export const insertWeeklyMeetingSchema = createInsertSchema(weeklyMeetings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWeeklyMeetingTaskSchema = createInsertSchema(weeklyMeetingTasks).omit({
  id: true,
  createdAt: true,
});

export const insertDepartmentTaskProgressSchema = createInsertSchema(departmentTaskProgress).omit({
  id: true,
  lastUpdatedAt: true,
});

export const insertWeeklyMeetingArchiveSchema = createInsertSchema(weeklyMeetingArchive).omit({
  id: true,
  archivedAt: true,
});

// Authentication Schemas
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(6, "New password must be at least 6 characters long")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const updateUserPasswordSchema = z.object({
  newPassword: z.string()
    .min(6, "New password must be at least 6 characters long")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
});

// Type Definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type TodoList = typeof todoLists.$inferSelect;
export type InsertTodoList = z.infer<typeof insertTodoListSchema>;
export type TodoItem = typeof todoItems.$inferSelect;
export type InsertTodoItem = z.infer<typeof insertTodoItemSchema>;
export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = z.infer<typeof insertReminderSchema>;
export type InterviewRequest = typeof interviewRequests.$inferSelect;
export type InsertInterviewRequest = z.infer<typeof insertInterviewRequestSchema>;
export type InterviewComment = typeof interviewComments.$inferSelect;
export type InsertInterviewComment = z.infer<typeof insertInterviewCommentSchema>;
export type OperationalData = typeof operationalData.$inferSelect;
export type InsertOperationalData = z.infer<typeof insertOperationalDataSchema>;
export type FeedbackType = typeof feedbackTypes.$inferSelect;
export type InsertFeedbackType = z.infer<typeof insertFeedbackTypeSchema>;
export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type ArchivedItem = typeof archivedItems.$inferSelect;
export type InsertArchivedItem = z.infer<typeof insertArchivedItemSchema>;
export type DeviceNotification = typeof deviceNotifications.$inferSelect;
export type InsertDeviceNotification = z.infer<typeof insertDeviceNotificationSchema>;
export type WeeklyMeeting = typeof weeklyMeetings.$inferSelect;
export type InsertWeeklyMeeting = z.infer<typeof insertWeeklyMeetingSchema>;
export type WeeklyMeetingTask = typeof weeklyMeetingTasks.$inferSelect;
export type InsertWeeklyMeetingTask = z.infer<typeof insertWeeklyMeetingTaskSchema>;
export type DepartmentTaskProgress = typeof departmentTaskProgress.$inferSelect;
export type InsertDepartmentTaskProgress = z.infer<typeof insertDepartmentTaskProgressSchema>;
export type WeeklyMeetingArchive = typeof weeklyMeetingArchive.$inferSelect;
export type InsertWeeklyMeetingArchive = z.infer<typeof insertWeeklyMeetingArchiveSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type UpdateUserPasswordData = z.infer<typeof updateUserPasswordSchema>;