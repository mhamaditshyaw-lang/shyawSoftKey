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

    // Create additional users
    const additionalUsers = [
      {
        username: 'manager',
        email: 'manager@shyaw.com',
        password: hashedPassword,
        firstName: 'System',
        lastName: 'Manager',
        role: 'manager',
        status: 'active'
      },
      {
        username: 'security',
        email: 'security@shyaw.com',
        password: hashedPassword,
        firstName: 'Security',
        lastName: 'Guard',
        role: 'security',
        status: 'active'
      },
      {
        username: 'office',
        email: 'office@shyaw.com',
        password: hashedPassword,
        firstName: 'Office',
        lastName: 'Staff',
        role: 'office',
        status: 'active'
      }
    ];

    for (const userData of additionalUsers) {
      const existingUser = await db.select().from(users).where(eq(users.username, userData.username)).limit(1);
      if (existingUser.length === 0) {
        await db.insert(users).values(userData);
        console.log(`✅ ${userData.role} user created: ${userData.username}`);
      } else {
        console.log(`⚠️  ${userData.username} already exists`);
      }
    }

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('📋 Default user accounts:');
    console.log('👤 admin (admin): password123');
    console.log('👤 manager (manager): password123');
    console.log('👤 security (security): password123');
    console.log('👤 office (office): password123');
    console.log('');
    console.log('⚠️  Please change the default passwords after first login!');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

createAdminUser();