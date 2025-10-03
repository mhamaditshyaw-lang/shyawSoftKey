
#!/usr/bin/env node

import pg from 'pg';
import bcrypt from 'bcrypt';
import { config } from 'dotenv';

const { Pool } = pg;

// Load environment variables
config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL not found');
  process.exit(1);
}

console.log('🔧 Recovering database after inactivity...');

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('neon.tech') ? { rejectUnauthorized: false } : false
});

async function recoverDatabase() {
  try {
    console.log('📡 Testing database connection...');
    await pool.query('SELECT 1 as test');
    console.log('✅ Database connection successful!');

    // Create enums
    console.log('🔨 Creating enums...');
    await pool.query(`DO $$ BEGIN
      CREATE TYPE IF NOT EXISTS "role" AS ENUM('admin', 'manager', 'security', 'office');
    EXCEPTION WHEN duplicate_object THEN null; END $$;`);
    
    await pool.query(`DO $$ BEGIN
      CREATE TYPE IF NOT EXISTS "status" AS ENUM('active', 'inactive', 'pending');
    EXCEPTION WHEN duplicate_object THEN null; END $$;`);
    
    await pool.query(`DO $$ BEGIN
      CREATE TYPE IF NOT EXISTS "priority" AS ENUM('low', 'medium', 'high', 'urgent');
    EXCEPTION WHEN duplicate_object THEN null; END $$;`);
    
    await pool.query(`DO $$ BEGIN
      CREATE TYPE IF NOT EXISTS "request_status" AS ENUM('pending', 'approved', 'rejected');
    EXCEPTION WHEN duplicate_object THEN null; END $$;`);

    await pool.query(`DO $$ BEGIN
      CREATE TYPE IF NOT EXISTS "device_notification_type" AS ENUM('general', 'task_reminder', 'interview_update', 'security_alert', 'system');
    EXCEPTION WHEN duplicate_object THEN null; END $$;`);

    await pool.query(`DO $$ BEGIN
      CREATE TYPE IF NOT EXISTS "device_notification_priority" AS ENUM('low', 'normal', 'high', 'urgent');
    EXCEPTION WHEN duplicate_object THEN null; END $$;`);

    // Create users table
    console.log('👥 Creating users table...');
    await pool.query(`CREATE TABLE IF NOT EXISTS "users" (
      "id" serial PRIMARY KEY NOT NULL,
      "username" text NOT NULL UNIQUE,
      "email" text NOT NULL UNIQUE,
      "password" text NOT NULL,
      "first_name" text NOT NULL,
      "last_name" text NOT NULL,
      "role" "role" DEFAULT 'security' NOT NULL,
      "status" "status" DEFAULT 'pending' NOT NULL,
      "permissions" jsonb DEFAULT '{}',
      "department" text,
      "position" text,
      "phone_number" text,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "last_active_at" timestamp
    )`);

    // Create other tables
    await pool.query(`CREATE TABLE IF NOT EXISTS "todo_lists" (
      "id" serial PRIMARY KEY NOT NULL,
      "title" text NOT NULL,
      "description" text,
      "created_by_id" integer NOT NULL,
      "assigned_to_id" integer,
      "priority" "priority" DEFAULT 'medium' NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action,
      FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS "todo_items" (
      "id" serial PRIMARY KEY NOT NULL,
      "todo_list_id" integer NOT NULL,
      "title" text NOT NULL,
      "description" text,
      "is_completed" boolean DEFAULT false NOT NULL,
      "priority" "priority" DEFAULT 'medium' NOT NULL,
      "due_date" timestamp,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL,
      "completed_at" timestamp,
      FOREIGN KEY ("todo_list_id") REFERENCES "todo_lists"("id") ON DELETE cascade ON UPDATE no action
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS "interview_requests" (
      "id" serial PRIMARY KEY NOT NULL,
      "position" text NOT NULL,
      "candidate_name" text NOT NULL,
      "candidate_email" text,
      "requested_by_id" integer NOT NULL,
      "manager_id" integer,
      "proposed_date_time" timestamp NOT NULL,
      "duration" integer NOT NULL,
      "description" text,
      "status" "request_status" DEFAULT 'pending' NOT NULL,
      "rejection_reason" text,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL,
      FOREIGN KEY ("requested_by_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action,
      FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS "reminders" (
      "id" serial PRIMARY KEY NOT NULL,
      "title" text NOT NULL,
      "message" text,
      "reminder_date" timestamp NOT NULL,
      "is_completed" boolean DEFAULT false NOT NULL,
      "notification_sent" boolean DEFAULT false NOT NULL,
      "created_by_id" integer NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE cascade
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS "operational_data" (
      "id" serial PRIMARY KEY NOT NULL,
      "type" text NOT NULL,
      "data" jsonb NOT NULL,
      "stats" jsonb,
      "created_by_id" integer NOT NULL,
      "created_at" timestamp DEFAULT now()
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS "device_notifications" (
      "id" serial PRIMARY KEY NOT NULL,
      "user_id" integer NOT NULL,
      "type" "device_notification_type" NOT NULL,
      "priority" "device_notification_priority" DEFAULT 'normal' NOT NULL,
      "title" text NOT NULL,
      "message" text NOT NULL,
      "icon" text,
      "action_url" text,
      "is_read" boolean DEFAULT false NOT NULL,
      "is_sent_to_device" boolean DEFAULT false NOT NULL,
      "device_data" text,
      "expires_at" timestamp,
      "created_at" timestamp DEFAULT now() NOT NULL,
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade
    )`);

    console.log('✅ All tables created successfully!');

    // Create test users
    console.log('👤 Creating test users...');
    const hashedPassword = await bcrypt.hash('password123', 12);

    const users = [
      { username: 'admin', email: 'admin@shyaw.com', firstName: 'System', lastName: 'Administrator', role: 'admin' },
      { username: 'manager', email: 'manager@shyaw.com', firstName: 'Manager', lastName: 'User', role: 'manager' },
      { username: 'security', email: 'security@shyaw.com', firstName: 'Security', lastName: 'Guard', role: 'security' },
      { username: 'office', email: 'office@shyaw.com', firstName: 'Office', lastName: 'Worker', role: 'office' }
    ];

    for (const user of users) {
      const existing = await pool.query('SELECT id FROM users WHERE username = $1', [user.username]);
      if (existing.rows.length === 0) {
        await pool.query(
          `INSERT INTO users (username, email, password, first_name, last_name, role, status)
           VALUES ($1, $2, $3, $4, $5, $6, 'active')`,
          [user.username, user.email, hashedPassword, user.firstName, user.lastName, user.role]
        );
        console.log(`✅ Created ${user.role} user: ${user.username}`);
      } else {
        console.log(`⚠️  User ${user.username} already exists`);
      }
    }

    console.log('🎉 Database recovery completed!');
    console.log('📝 Login credentials: admin / password123');

  } catch (error) {
    console.error('❌ Recovery failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

recoverDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
