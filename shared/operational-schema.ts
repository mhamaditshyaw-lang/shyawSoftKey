import { pgTable, serial, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./schema";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const operationalData = pgTable("operational_data", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // employee, operations, staffCount, yesterdayProduction, yesterdayLoading
  data: jsonb("data").notNull(),
  stats: jsonb("stats"), // { total, average, max, min }
  createdById: integer("created_by_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const operationalDataRelations = relations(operationalData, ({ one }) => ({
  createdBy: one(users, {
    fields: [operationalData.createdById],
    references: [users.id],
  }),
}));

export const insertOperationalDataSchema = createInsertSchema(operationalData).omit({
  id: true,
  createdAt: true,
});

export type OperationalData = typeof operationalData.$inferSelect;
export type InsertOperationalData = z.infer<typeof insertOperationalDataSchema>;