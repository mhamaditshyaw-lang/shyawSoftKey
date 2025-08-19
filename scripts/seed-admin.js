#!/usr/bin/env node

/**
 * Script to create an initial admin user for local installation
 */

import { config } from 'dotenv';
import bcrypt from 'bcrypt';
import { db } from '../server/db.ts';
import { users } from '../shared/schema.ts';
import { eq } from 'drizzle-orm';

// Load environment variables
config();

async function createAdminUser() {
  try {
    console.log('🔍 Checking for existing admin user...');
    
    // Check if admin user already exists
    const existingAdmin = await db.select().from(users).where(eq(users.username, 'admin')).limit(1);
    
    if (existingAdmin.length > 0) {
      console.log('✅ Admin user already exists!');
      console.log('Username: admin');
      console.log('Password: password123');
      return;
    }

    console.log('🔐 Creating admin user...');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    // Create admin user
    const adminUser = await db.insert(users).values({
      username: 'admin',
      email: 'admin@shyaw.com',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin',
      status: 'active'
    }).returning();

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@shyaw.com');
    console.log('👤 Username: admin');
    console.log('🔑 Password: password123');
    console.log('');
    console.log('⚠️  Please change the default password after first login!');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

createAdminUser();