-- Migration: convert users.role column to role enum safely
-- Idempotent: will create enum type if missing and only alter column if it's not already the enum type

DO $$
BEGIN
  -- create enum type if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role') THEN
    CREATE TYPE role AS ENUM ('admin','manager','security','secretary','office','office_team','employee');
  END IF;
END$$;

-- alter column only if it's not already of enum type
DO $$
DECLARE
  current_type text;
BEGIN
  SELECT atttypid::regtype::text INTO current_type
  FROM pg_attribute a
  JOIN pg_class c ON a.attrelid = c.oid
  WHERE c.relname = 'users' AND a.attname = 'role'
  LIMIT 1;

  IF current_type IS NULL THEN
    RAISE NOTICE 'users.role column not found; skipping';
  ELSIF current_type != 'role' THEN
    ALTER TABLE users ALTER COLUMN role TYPE role USING role::role;
    ALTER TABLE users ALTER COLUMN role SET DEFAULT 'security';
    RAISE NOTICE 'Altered users.role to enum role';
  ELSE
    RAISE NOTICE 'users.role already of type role; no action';
  END IF;
END$$;
