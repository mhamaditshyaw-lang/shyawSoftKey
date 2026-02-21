-- Adds completed_by_note to todo_items
ALTER TABLE "todo_items" ADD COLUMN IF NOT EXISTS "completed_by_note" text;
--> statement-breakpoint
ALTER TABLE "todo_items" ADD COLUMN IF NOT EXISTS "completed_by_id" integer;
--> statement-breakpoint
