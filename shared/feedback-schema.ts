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

export const feedback = pgTable("feedback", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  type: feedbackTypeEnum("type").notNull(),
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

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
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
export type ArchivedItem = typeof archivedItems.$inferSelect;
export type InsertArchivedItem = z.infer<typeof insertArchivedItemSchema>;