import pg from 'pg';
import bcrypt from 'bcrypt';

const { Pool } = pg;

// Use the fresh DATABASE_URL from environment
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL not found');
  process.exit(1);
}

console.log('🔧 Setting up database with fresh connection...');

const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('neon.tech') ? { rejectUnauthorized: false } : false
});

async function setupDatabase() {
  try {
    // Test connection first
    console.log('📡 Testing database connection...');
    const testResult = await pool.query('SELECT 1 as test');
    console.log('✅ Database connection successful!');

    // Create enums
    console.log('🔨 Creating enums...');
    await pool.query(`DO $$ BEGIN
      CREATE TYPE IF NOT EXISTS "role" AS ENUM('admin', 'manager', 'security', 'office');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`);
    
    await pool.query(`DO $$ BEGIN
      CREATE TYPE IF NOT EXISTS "status" AS ENUM('active', 'inactive', 'pending');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`);
    
    await pool.query(`DO $$ BEGIN
      CREATE TYPE IF NOT EXISTS "priority" AS ENUM('low', 'medium', 'high', 'urgent');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`);
    
    await pool.query(`DO $$ BEGIN
      CREATE TYPE IF NOT EXISTS "request_status" AS ENUM('pending', 'approved', 'rejected');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`);

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
    console.log('📋 Creating todo_lists table...');
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

    await pool.query(`CREATE TABLE IF NOT EXISTS "operational_data" (
      "id" serial PRIMARY KEY NOT NULL,
      "type" text NOT NULL,
      "data" jsonb NOT NULL,
      "stats" jsonb,
      "created_by_id" integer NOT NULL,
      "created_at" timestamp DEFAULT now()
    )`);

    console.log('✅ Database schema created successfully!');

    // Create test users
    console.log('👤 Creating test users...');
    const hashedPassword = await bcrypt.hash('password123', 12);

    const testUsers = [
      {
        username: 'admin',
        email: 'admin@shyaw.com',
        firstName: 'System',
        lastName: 'Administrator',
        role: 'admin',
        permissions: JSON.stringify({
          canViewUsers: true,
          canEditUsers: true,
          canDeleteUsers: true,
          canViewTodos: true,
          canEditTodos: true,
          canViewInterviews: true,
          canEditInterviews: true,
          canViewReports: true,
          canManageNotifications: true
        })
      },
      {
        username: 'manager',
        email: 'manager@shyaw.com',
        firstName: 'Manager',
        lastName: 'User',
        role: 'manager',
        permissions: JSON.stringify({
          canViewUsers: true,
          canEditUsers: true,
          canDeleteUsers: false,
          canViewTodos: true,
          canEditTodos: true,
          canViewInterviews: true,
          canEditInterviews: true,
          canViewReports: true,
          canManageNotifications: false
        })
      },
      {
        username: 'security',
        email: 'security@shyaw.com',
        firstName: 'Security',
        lastName: 'Guard',
        role: 'security',
        permissions: JSON.stringify({
          canViewUsers: false,
          canEditUsers: false,
          canDeleteUsers: false,
          canViewTodos: true,
          canEditTodos: true,
          canViewInterviews: true,
          canEditInterviews: false,
          canViewReports: false,
          canManageNotifications: false
        })
      },
      {
        username: 'office',
        email: 'office@shyaw.com',
        firstName: 'Office',
        lastName: 'Worker',
        role: 'office',
        department: 'Administration',
        position: 'Office Assistant',
        phoneNumber: '+964-770-123-4567',
        permissions: JSON.stringify({
          canViewUsers: false,
          canEditUsers: false,
          canDeleteUsers: false,
          canViewTodos: true,
          canEditTodos: true,
          canViewInterviews: true,
          canEditInterviews: false,
          canViewReports: false,
          canManageNotifications: false
        })
      }
    ];

    for (const user of testUsers) {
      // Check if user already exists
      const existingUser = await pool.query('SELECT id FROM users WHERE username = $1', [user.username]);
      
      if (existingUser.rows.length === 0) {
        await pool.query(`
          INSERT INTO users (username, email, password, first_name, last_name, role, status, department, position, phone_number, permissions)
          VALUES ($1, $2, $3, $4, $5, $6, 'active', $7, $8, $9, $10)
        `, [
          user.username,
          user.email,
          hashedPassword,
          user.firstName,
          user.lastName,
          user.role,
          user.department || null,
          user.position || null,
          user.phoneNumber || null,
          user.permissions
        ]);
        console.log(`✅ Created ${user.role} user: ${user.username}`);
      } else {
        console.log(`⚠️  User ${user.username} already exists`);
      }
    }

    console.log('🎉 Database setup completed successfully!');
    console.log('📝 Test Login Credentials:');
    console.log('   Admin: admin / password123');
    console.log('   Manager: manager / password123');
    console.log('   Security: security / password123');
    console.log('   Office: office / password123');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

setupDatabase().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Setup failed:', error);
  process.exit(1);
});