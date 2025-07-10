-- Employee Affairs Management System - Database Export
-- Generated on: 2025-07-10T10:03:31.775Z
-- Database: PostgreSQL
-- 
-- This file contains the complete database schema and data
-- To restore: psql -d your_database < database_export.sql
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


-- Table: archived_items
DROP TABLE IF EXISTS archived_items CASCADE;
CREATE TABLE archived_items (
  id integer NOT NULL,
  item_type text NOT NULL,
  item_id integer NOT NULL,
  item_data text NOT NULL,
  archived_by_id integer NOT NULL,
  archived_at timestamp without time zone NOT NULL DEFAULT now(),
  reason text
);


-- Table: feedback
DROP TABLE IF EXISTS feedback CASCADE;
CREATE TABLE feedback (
  id integer NOT NULL,
  type USER-DEFINED NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  rating USER-DEFINED,
  submitted_by_id integer NOT NULL,
  related_interview_id integer,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now()
);


-- Table: interview_requests
DROP TABLE IF EXISTS interview_requests CASCADE;
CREATE TABLE interview_requests (
  id integer NOT NULL DEFAULT nextval('interview_requests_id_seq'::regclass),
  position text NOT NULL,
  candidate_name text NOT NULL,
  candidate_email text,
  requested_by_id integer NOT NULL,
  manager_id integer,
  proposed_date_time timestamp without time zone NOT NULL,
  duration integer NOT NULL,
  description text,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::request_status,
  rejection_reason text,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now()
);


-- Table: notifications
DROP TABLE IF EXISTS notifications CASCADE;
CREATE TABLE notifications (
  id integer NOT NULL,
  user_id integer NOT NULL,
  type USER-DEFINED NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  data text
);

-- Data for table: notifications
INSERT INTO notifications (id, user_id, type, title, message, is_read, created_at, data) VALUES (1, 1, 'user_created', 'New User Created', 'System Administrator created a new manager account for Baxtyar Muhammad Ali', FALSE, '2025-07-10T09:57:32.934Z', '{"newUserId":2,"createdByUserId":1}');
INSERT INTO notifications (id, user_id, type, title, message, is_read, created_at, data) VALUES (2, 1, 'user_created', 'New User Created', 'System Administrator created a new security account for Evan shyaw', FALSE, '2025-07-10T09:58:04.464Z', '{"newUserId":3,"createdByUserId":1}');


-- Table: operational_data
DROP TABLE IF EXISTS operational_data CASCADE;
CREATE TABLE operational_data (
  id integer NOT NULL DEFAULT nextval('operational_data_id_seq'::regclass),
  type text NOT NULL,
  data jsonb NOT NULL,
  stats jsonb,
  created_by_id integer NOT NULL,
  created_at timestamp without time zone DEFAULT now()
);


-- Table: todo_items
DROP TABLE IF EXISTS todo_items CASCADE;
CREATE TABLE todo_items (
  id integer NOT NULL DEFAULT nextval('todo_items_id_seq'::regclass),
  todo_list_id integer NOT NULL,
  title text NOT NULL,
  description text,
  is_completed boolean NOT NULL DEFAULT false,
  priority USER-DEFINED NOT NULL DEFAULT 'medium'::priority,
  due_date timestamp without time zone,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  completed_at timestamp without time zone
);


-- Table: todo_lists
DROP TABLE IF EXISTS todo_lists CASCADE;
CREATE TABLE todo_lists (
  id integer NOT NULL DEFAULT nextval('todo_lists_id_seq'::regclass),
  title text NOT NULL,
  description text,
  created_by_id integer NOT NULL,
  assigned_to_id integer,
  priority USER-DEFINED NOT NULL DEFAULT 'medium'::priority,
  created_at timestamp without time zone NOT NULL DEFAULT now()
);


-- Table: users
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
  id integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
  username text NOT NULL,
  email text NOT NULL,
  password text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  role USER-DEFINED NOT NULL DEFAULT 'security'::role,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::status,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  last_active_at timestamp without time zone
);

-- Data for table: users
INSERT INTO users (id, username, email, password, first_name, last_name, role, status, created_at, last_active_at) VALUES (1, 'admin', 'admin@system.local', '$2b$10$VdYNbDv7deuVcUepb2yw5u4XfQeQy6WP4YBj7.35ghO2fV08pn1Nm', 'System', 'Administrator', 'admin', 'active', '2025-07-10T09:51:20.895Z', '2025-07-10T09:56:29.232Z');
INSERT INTO users (id, username, email, password, first_name, last_name, role, status, created_at, last_active_at) VALUES (2, 'Baxtyar', 'baxtyar@gmail.com', '$2b$12$JG2zZtd89TxN.L5JSLx2EOPglj7BBCZsm9lXIH7OwI2MFcGfOLHkS', 'Baxtyar', 'Muhammad Ali', 'manager', 'active', '2025-07-10T09:57:31.479Z', NULL);
INSERT INTO users (id, username, email, password, first_name, last_name, role, status, created_at, last_active_at) VALUES (3, 'Evan', 'evan@gmail.com', '$2b$12$ojbHTVqSZsm5WIXoIYq/B.S.Z4iHp2wh3FfhCNpSlPWOvd4QDAR1K', 'Evan', 'shyaw', 'security', 'active', '2025-07-10T09:58:02.998Z', NULL);

-- Indexes
CREATE UNIQUE INDEX users_email_unique ON public.users USING btree (email);
CREATE UNIQUE INDEX users_username_unique ON public.users USING btree (username);

-- Foreign Key Constraints
ALTER TABLE interview_requests ADD CONSTRAINT interview_requests_requested_by_id_users_id_fk FOREIGN KEY (requested_by_id) REFERENCES users(id);
ALTER TABLE interview_requests ADD CONSTRAINT interview_requests_manager_id_users_id_fk FOREIGN KEY (manager_id) REFERENCES users(id);
ALTER TABLE todo_items ADD CONSTRAINT todo_items_todo_list_id_todo_lists_id_fk FOREIGN KEY (todo_list_id) REFERENCES todo_lists(id);
ALTER TABLE todo_lists ADD CONSTRAINT todo_lists_created_by_id_users_id_fk FOREIGN KEY (created_by_id) REFERENCES users(id);
ALTER TABLE todo_lists ADD CONSTRAINT todo_lists_assigned_to_id_users_id_fk FOREIGN KEY (assigned_to_id) REFERENCES users(id);

-- Sequences
SELECT setval('interview_requests_id_seq', 1, true);
SELECT setval('operational_data_id_seq', 1, true);
SELECT setval('todo_items_id_seq', 1, true);
SELECT setval('todo_lists_id_seq', 1, true);
SELECT setval('users_id_seq', 3, true);

-- Export completed on: 2025-07-10T10:03:37.808Z
-- Total tables exported: 8
