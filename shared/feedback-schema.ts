import { pgTable, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { users, interviewRequests } from "./schema";
import { z } from "zod";

export const feedbackTypeEnum = pgEnum("feedback_type", [
  "interview_feedback",
  "general_feedback",
  "system_improvement",
  "user_experience"
]);

export const ratingEnum = pgEnum("rating", ["1", "2", "3", "4", "5"]);

// Dynamic feedback types table
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

// Archive table for completed/closed items
export const archivedItems = pgTable("archived_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  itemType: text("item_type").notNull(), // 'interview', 'todo', 'user'
  itemId: integer("item_id").notNull(),
  itemData: text("item_data").notNull(), // JSON string of the original item
  archivedById: integer("archived_by_id").notNull().references(() => users.id),
  archivedAt: timestamp("archived_at").defaultNow().notNull(),
  reason: text("reason"), // Optional reason for archiving
});

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

export const insertFeedbackSchema = createInsertSchema(feedback, {
  rating: z.enum(["1", "2", "3", "4", "5"]).optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFeedbackTypeSchema = createInsertSchema(feedbackTypes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertArchivedItemSchema = createInsertSchema(archivedItems).omit({
  id: true,
  archivedAt: true,
});

export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type FeedbackType = typeof feedbackTypes.$inferSelect;
export type InsertFeedbackType = z.infer<typeof insertFeedbackTypeSchema>;
export type ArchivedItem = typeof archivedItems.$inferSelect;
export type InsertArchivedItem = z.infer<typeof insertArchivedItemSchema>;