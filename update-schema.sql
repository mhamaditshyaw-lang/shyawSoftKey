-- Shyaw Administration System - UPDATE SCRIPT
-- Add Task Proof System to Existing Database
-- For local databases that already have the complete schema

-- ============================================
-- TASK PROOF TABLE (NEW)
-- ============================================

CREATE TABLE IF NOT EXISTS task_proof (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES weekly_meeting_tasks(id) ON DELETE CASCADE,
  proof_type TEXT NOT NULL,
  proof_url TEXT NOT NULL,
  description TEXT,
  submitted_by_id INTEGER NOT NULL REFERENCES users(id),
  submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  verified_at TIMESTAMP,
  verification_notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================
-- PERFORMANCE INDEXES FOR TASK_PROOF
-- ============================================

CREATE INDEX IF NOT EXISTS idx_task_proof_task_id ON task_proof(task_id);
CREATE INDEX IF NOT EXISTS idx_task_proof_submitted_by ON task_proof(submitted_by_id);
CREATE INDEX IF NOT EXISTS idx_task_proof_verified_by ON task_proof(verified_by_id);
CREATE INDEX IF NOT EXISTS idx_task_proof_is_verified ON task_proof(is_verified);

-- ============================================
-- UPDATE COMPLETE
-- ============================================
-- Task proof table and indexes have been added successfully
-- Your database now supports task completion evidence tracking
