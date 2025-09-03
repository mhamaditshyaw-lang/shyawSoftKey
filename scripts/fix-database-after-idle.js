#!/usr/bin/env node

/**
 * Script to fix database issues after extended inactivity (2+ weeks)
 * This handles the common Neon database endpoint disable issue
 */

import { config } from 'dotenv';
import bcrypt from 'bcrypt';

// Load environment variables
config();

async function fixDatabaseAfterIdle() {
  console.log('🔧 Fixing database after extended inactivity...');
  
  try {
    // First, check if we can connect to database
    console.log('📡 Testing database connection...');
    
    // Try to use the current connection - if it fails, we'll catch it
    const { db } = await import('../server/db.ts');
    const { sql } = await import('drizzle-orm');
    
    // Test basic connectivity
    await db.execute(sql`SELECT 1`);
    console.log('✅ Database connection successful!');
    
    // Create all tables if they don't exist
    console.log('🔨 Creating database tables...');
    
    // Create enums
    await db.execute(sql`DO $$ BEGIN
      CREATE TYPE IF NOT EXISTS "role" AS ENUM('admin', 'manager', 'security', 'office');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`);
    
    await db.execute(sql`DO $$ BEGIN
      CREATE TYPE IF NOT EXISTS "status" AS ENUM('active', 'inactive', 'pending');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`);
    
    await db.execute(sql`DO $$ BEGIN
      CREATE TYPE IF NOT EXISTS "priority" AS ENUM('low', 'medium', 'high', 'urgent');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`);
    
    await db.execute(sql`DO $$ BEGIN
      CREATE TYPE IF NOT EXISTS "request_status" AS ENUM('pending', 'approved', 'rejected');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`);
    
    // Create users table
    await db.execute(sql`CREATE TABLE IF NOT EXISTS "users" (
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
    
    // Create other essential tables
    await db.execute(sql`CREATE TABLE IF NOT EXISTS "todo_lists" (
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
    
    await db.execute(sql`CREATE TABLE IF NOT EXISTS "todo_items" (
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
    
    await db.execute(sql`CREATE TABLE IF NOT EXISTS "interview_requests" (
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
    
    // Create operational_data table
    await db.execute(sql`CREATE TABLE IF NOT EXISTS "operational_data" (
      "id" serial PRIMARY KEY NOT NULL,
      "type" text NOT NULL,
      "data" jsonb NOT NULL,
      "stats" jsonb,
      "created_by_id" integer NOT NULL,
      "created_at" timestamp DEFAULT now()
    )`);
    
    console.log('✅ Database tables created successfully!');
    
    // Now create test users
    console.log('👥 Creating test users...');
    
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    // Check if admin exists
    const existingAdmin = await db.execute(sql`SELECT id FROM users WHERE username = 'admin' LIMIT 1`);
    if (existingAdmin.rows.length === 0) {
      await db.execute(sql`INSERT INTO users (username, email, password, first_name, last_name, role, status) 
        VALUES ('admin', 'admin@shyaw.com', ${hashedPassword}, 'System', 'Administrator', 'admin', 'active')`);
      console.log('✅ Admin user created');
    }
    
    // Check if manager exists  
    const existingManager = await db.execute(sql`SELECT id FROM users WHERE username = 'manager' LIMIT 1`);
    if (existingManager.rows.length === 0) {
      await db.execute(sql`INSERT INTO users (username, email, password, first_name, last_name, role, status)
        VALUES ('manager', 'manager@shyaw.com', ${hashedPassword}, 'Manager', 'User', 'manager', 'active')`);
      console.log('✅ Manager user created');
    }
    
    // Check if security exists
    const existingSecurity = await db.execute(sql`SELECT id FROM users WHERE username = 'security' LIMIT 1`);
    if (existingSecurity.rows.length === 0) {
      await db.execute(sql`INSERT INTO users (username, email, password, first_name, last_name, role, status)
        VALUES ('security', 'security@shyaw.com', ${hashedPassword}, 'Security', 'Guard', 'security', 'active')`);
      console.log('✅ Security user created');
    }
    
    // Check if office exists
    const existingOffice = await db.execute(sql`SELECT id FROM users WHERE username = 'office' LIMIT 1`);
    if (existingOffice.rows.length === 0) {
      await db.execute(sql`INSERT INTO users (username, email, password, first_name, last_name, role, status, department, position, phone_number, permissions)
        VALUES ('office', 'office@shyaw.com', ${hashedPassword}, 'Office', 'Worker', 'office', 'active', 'Administration', 'Office Assistant', '+964-770-123-4567', 
        '{"canViewUsers": false, "canEditUsers": false, "canDeleteUsers": false, "canViewTodos": true, "canEditTodos": true, "canViewInterviews": true, "canEditInterviews": false, "canViewReports": false, "canManageNotifications": false}'::jsonb)`);
      console.log('✅ Office user created');
    }
    
    console.log('🎉 Database recovery completed successfully!');
    console.log('📝 Test Login Credentials:');
    console.log('   Admin: admin / password123');
    console.log('   Manager: manager / password123');
    console.log('   Security: security / password123');
    console.log('   Office: office / password123');
    
  } catch (error) {
    console.error('❌ Database recovery failed:', error.message);
    console.log('🔧 This is likely due to a disabled Neon database endpoint.');
    console.log('📋 Solutions:');
    console.log('   1. The database endpoint was disabled due to inactivity (2+ weeks)');
    console.log('   2. A new database connection should be created automatically');
    console.log('   3. If this persists, the Replit environment may need to be restarted');
    throw error;
  }
}

fixDatabaseAfterIdle().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Database recovery failed:', error);
  process.exit(1);
});