import { pgTable, text, integer, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { users } from "./schema";
import { z } from "zod";

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

export const deviceNotificationsRelations = relations(deviceNotifications, ({ one }) => ({
  user: one(users, {
    fields: [deviceNotifications.userId],
    references: [users.id],
  }),
}));

export const insertDeviceNotificationSchema = createInsertSchema(deviceNotifications).omit({
  id: true,
  createdAt: true,
});

export type DeviceNotification = typeof deviceNotifications.$inferSelect;
export type InsertDeviceNotification = z.infer<typeof insertDeviceNotificationSchema>;