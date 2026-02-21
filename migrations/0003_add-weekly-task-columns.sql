-- Add created_by_id and completed_by_id to weekly_meeting_tasks
-- This migration is idempotent (uses IF NOT EXISTS where supported)

ALTER TABLE "weekly_meeting_tasks" ADD COLUMN IF NOT EXISTS "created_by_id" integer;
ALTER TABLE "weekly_meeting_tasks" ADD COLUMN IF NOT EXISTS "completed_by_id" integer;

-- Set a default for existing rows (safe fallback to admin user id = 1)
UPDATE "weekly_meeting_tasks" SET "created_by_id" = 1 WHERE "created_by_id" IS NULL;

-- Add foreign key constraints if they don't already exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'weekly_meeting_tasks_created_by_id_users_id_fk') THEN
    ALTER TABLE "weekly_meeting_tasks"
      ADD CONSTRAINT weekly_meeting_tasks_created_by_id_users_id_fk
      FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'weekly_meeting_tasks_completed_by_id_users_id_fk') THEN
    ALTER TABLE "weekly_meeting_tasks"
      ADD CONSTRAINT weekly_meeting_tasks_completed_by_id_users_id_fk
      FOREIGN KEY (completed_by_id) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END
$$;

-- Ensure created_by_id is NOT NULL now that existing rows are filled
ALTER TABLE "weekly_meeting_tasks" ALTER COLUMN "created_by_id" SET NOT NULL;
