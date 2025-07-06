-- Create admin users for Office Management System
-- Default password for all users: admin123 (CHANGE IMMEDIATELY after first login)
-- Password hash generated with bcrypt rounds=10

-- Create admin user
INSERT INTO users (username, email, password_hash, role, status, created_at, updated_at)
VALUES (
  'admin',
  'admin@yourdomain.com',
  '$2b$10$rHQTlkqQtKvHpj1fW1KwJe8fqJgBkNjQXgJbJxMhCqWd5oVQgFgHS',
  'admin',
  'active',
  NOW(),
  NOW()
)
ON CONFLICT (username) DO NOTHING;

-- Create manager user
INSERT INTO users (username, email, password_hash, role, status, created_at, updated_at)
VALUES (
  'manager',
  'manager@yourdomain.com',
  '$2b$10$rHQTlkqQtKvHpj1fW1KwJe8fqJgBkNjQXgJbJxMhCqWd5oVQgFgHS',
  'manager',
  'active',
  NOW(),
  NOW()
)
ON CONFLICT (username) DO NOTHING;

-- Create security user
INSERT INTO users (username, email, password_hash, role, status, created_at, updated_at)
VALUES (
  'security',
  'security@yourdomain.com',
  '$2b$10$rHQTlkqQtKvHpj1fW1KwJe8fqJgBkNjQXgJbJxMhCqWd5oVQgFgHS',
  'security',
  'active',
  NOW(),
  NOW()
)
ON CONFLICT (username) DO NOTHING;

-- Verify users were created
SELECT username, email, role, status, created_at FROM users WHERE username IN ('admin', 'manager', 'security');