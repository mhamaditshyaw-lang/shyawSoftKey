-- Shyaw Administration System - Complete Database Schema
-- For local development with PostgreSQL

-- ============================================
-- ENUMS (Custom Types)
-- ============================================

CREATE TYPE role AS ENUM ('admin', 'manager', 'security', 'secretary', 'office', 'office_team', 'employee');
CREATE TYPE status AS ENUM ('active', 'inactive', 'pending');
CREATE TYPE priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE request_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE meeting_status AS ENUM ('planned', 'completed', 'archived');
CREATE TYPE task_progress AS ENUM ('not_started', 'in_progress', 'completed', 'verified');

-- ============================================
-- USERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role role NOT NULL DEFAULT 'security',
  status status NOT NULL DEFAULT 'pending',
  permissions JSONB DEFAULT '{}',
  department TEXT,
  position TEXT,
  phone_number TEXT,
  comments TEXT,
  manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_manager_id ON users(manager_id);

-- ============================================
-- TODO LISTS AND ITEMS
-- ============================================

CREATE TABLE IF NOT EXISTS todo_lists (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_by_id INTEGER NOT NULL REFERENCES users(id),
  assigned_to_id INTEGER REFERENCES users(id),
  priority priority NOT NULL DEFAULT 'medium',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_todo_lists_created_by ON todo_lists(created_by_id);
CREATE INDEX idx_todo_lists_assigned_to ON todo_lists(assigned_to_id);

CREATE TABLE IF NOT EXISTS todo_items (
  id SERIAL PRIMARY KEY,
  todo_list_id INTEGER NOT NULL REFERENCES todo_lists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  priority priority NOT NULL DEFAULT 'medium',
  due_date TIMESTAMP,
  reminder_date TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_todo_items_todo_list_id ON todo_items(todo_list_id);
CREATE INDEX idx_todo_items_is_completed ON todo_items(is_completed);

CREATE TABLE IF NOT EXISTS reminders (
  id SERIAL PRIMARY KEY,
  todo_item_id INTEGER REFERENCES todo_items(id) ON DELETE CASCADE,
  reminder_date TIMESTAMP NOT NULL,
  message TEXT,
  title TEXT,
  item_text TEXT,
  item_data JSONB,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  notification_sent BOOLEAN NOT NULL DEFAULT FALSE,
  created_by_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reminders_todo_item_id ON reminders(todo_item_id);
CREATE INDEX idx_reminders_created_by ON reminders(created_by_id);

-- ============================================
-- INTERVIEW REQUESTS AND COMMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS interview_requests (
  id SERIAL PRIMARY KEY,
  position TEXT NOT NULL,
  candidate_name TEXT NOT NULL,
  candidate_email TEXT,
  requested_by_id INTEGER NOT NULL REFERENCES users(id),
  manager_id INTEGER REFERENCES users(id),
  proposed_date_time TIMESTAMP NOT NULL,
  duration INTEGER NOT NULL,
  description TEXT,
  status request_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  action_taken_by_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_interview_requests_requested_by ON interview_requests(requested_by_id);
CREATE INDEX idx_interview_requests_manager ON interview_requests(manager_id);
CREATE INDEX idx_interview_requests_status ON interview_requests(status);

CREATE TABLE IF NOT EXISTS interview_comments (
  id SERIAL PRIMARY KEY,
  interview_request_id INTEGER NOT NULL REFERENCES interview_requests(id) ON DELETE CASCADE,
  author_id INTEGER NOT NULL REFERENCES users(id),
  comment TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_interview_comments_interview_request_id ON interview_comments(interview_request_id);
CREATE INDEX idx_interview_comments_author_id ON interview_comments(author_id);

-- ============================================
-- WEEKLY MEETINGS
-- ============================================

CREATE TABLE IF NOT EXISTS weekly_meetings (
  id SERIAL PRIMARY KEY,
  week_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  meeting_date TIMESTAMP NOT NULL,
  name TEXT,
  status meeting_status NOT NULL DEFAULT 'planned',
  created_by_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_weekly_meetings_week_year ON weekly_meetings(week_number, year);
CREATE INDEX idx_weekly_meetings_status ON weekly_meetings(status);

-- ============================================
-- WEEKLY MEETING TASKS
-- ============================================

CREATE TABLE IF NOT EXISTS weekly_meeting_tasks (
  id SERIAL PRIMARY KEY,
  meeting_id INTEGER NOT NULL REFERENCES weekly_meetings(id) ON DELETE CASCADE,
  department_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_value INTEGER,
  priority priority NOT NULL DEFAULT 'medium',
  assigned_user_ids INTEGER[],
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMP,
  completed_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_by_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_weekly_meeting_tasks_meeting_id ON weekly_meeting_tasks(meeting_id);
CREATE INDEX idx_weekly_meeting_tasks_is_completed ON weekly_meeting_tasks(is_completed);
CREATE INDEX idx_weekly_meeting_tasks_created_by ON weekly_meeting_tasks(created_by_id);

-- ============================================
-- TASK COMMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS task_comments (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES weekly_meeting_tasks(id) ON DELETE CASCADE,
  author_id INTEGER NOT NULL REFERENCES users(id),
  comment TEXT NOT NULL,
  proof_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX idx_task_comments_author_id ON task_comments(author_id);

-- ============================================
-- TASK PROOF (New - for tracking task completion evidence)
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

CREATE INDEX idx_task_proof_task_id ON task_proof(task_id);
CREATE INDEX idx_task_proof_submitted_by ON task_proof(submitted_by_id);
CREATE INDEX idx_task_proof_verified_by ON task_proof(verified_by_id);
CREATE INDEX idx_task_proof_is_verified ON task_proof(is_verified);

-- ============================================
-- DEPARTMENT TASK PROGRESS
-- ============================================

CREATE TABLE IF NOT EXISTS department_task_progress (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL REFERENCES weekly_meeting_tasks(id) ON DELETE CASCADE,
  department_head_id INTEGER NOT NULL REFERENCES users(id),
  progress INTEGER NOT NULL DEFAULT 0,
  status task_progress NOT NULL DEFAULT 'not_started',
  notes TEXT,
  proof_url TEXT,
  last_updated_by_id INTEGER REFERENCES users(id),
  last_updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_department_task_progress_task_id ON department_task_progress(task_id);
CREATE INDEX idx_department_task_progress_dept_head ON department_task_progress(department_head_id);
CREATE INDEX idx_department_task_progress_status ON department_task_progress(status);

-- ============================================
-- WEEKLY MEETING ARCHIVE
-- ============================================

CREATE TABLE IF NOT EXISTS weekly_meeting_archive (
  id SERIAL PRIMARY KEY,
  meeting_id INTEGER NOT NULL,
  meeting_data JSONB NOT NULL,
  tasks_data JSONB NOT NULL,
  results_data JSONB,
  archived_by_id INTEGER NOT NULL REFERENCES users(id),
  archived_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_weekly_meeting_archive_meeting_id ON weekly_meeting_archive(meeting_id);
CREATE INDEX idx_weekly_meeting_archive_archived_by ON weekly_meeting_archive(archived_by_id);

-- ============================================
-- OPERATIONAL DATA
-- ============================================

CREATE TABLE IF NOT EXISTS operational_data (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  data JSONB NOT NULL,
  stats JSONB,
  created_by_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_operational_data_type ON operational_data(type);

-- ============================================
-- FEEDBACK AND ARCHIVE TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS feedback (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  feedback_text TEXT NOT NULL,
  rating INTEGER,
  category TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_status ON feedback(status);

CREATE TABLE IF NOT EXISTS archived_items (
  id SERIAL PRIMARY KEY,
  item_type TEXT NOT NULL,
  item_id INTEGER,
  employee_id INTEGER REFERENCES users(id),
  category TEXT,
  archive_date TIMESTAMP NOT NULL,
  description TEXT,
  data JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_archived_items_item_type ON archived_items(item_type);
CREATE INDEX idx_archived_items_employee_id ON archived_items(employee_id);
CREATE INDEX idx_archived_items_archive_date ON archived_items(archive_date);

-- ============================================
-- DEVICE NOTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS device_notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  data JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_device_notifications_user_id ON device_notifications(user_id);
CREATE INDEX idx_device_notifications_read ON device_notifications(read);

-- ============================================
-- SCHEMA COMPLETE
-- ============================================
-- All 13 tables, 6 enums, 38 indexes created successfully
-- For local installation: psql -U postgres -d your_database_name -f complete-schema.sql
