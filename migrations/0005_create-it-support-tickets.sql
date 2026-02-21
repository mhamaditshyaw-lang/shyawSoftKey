-- 0005_create-it-support-tickets.sql
-- Idempotent migration to create it_support_status enum and it_support_tickets table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'it_support_status') THEN
    CREATE TYPE it_support_status AS ENUM ('pending','in_progress','completed','cancelled');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS it_support_tickets (
  id serial PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  priority priority NOT NULL DEFAULT 'medium',
  status it_support_status NOT NULL DEFAULT 'pending',
  category text NOT NULL DEFAULT 'general',
  requested_by_id integer NOT NULL REFERENCES users(id),
  assigned_to_id integer REFERENCES users(id),
  completed_by_id integer REFERENCES users(id),
  completed_at timestamp,
  notes text,
  planned_date timestamp,
  created_at timestamp DEFAULT NOW() NOT NULL,
  updated_at timestamp DEFAULT NOW() NOT NULL
);

-- Ensure priority enum exists (declared in main schema)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'priority') THEN
    CREATE TYPE priority AS ENUM ('low','medium','high','urgent');
  END IF;
END$$;

-- Add missing columns/indexes if any in future safe runs
