
#!/usr/bin/env node

/**
 * Script to add multiple users to the system
 */

import { config } from 'dotenv';
import bcrypt from 'bcrypt';
import { db } from '../server/db.ts';
import { users } from '../shared/schema.ts';
import { eq } from 'drizzle-orm';

// Load environment variables
config();

const newUsers = [
  {
    username: 'admin2',
    email: 'admin2@shyaw.com',
    password: 'password123',
    firstName: 'Second',
    lastName: 'Admin',
    role: 'admin',
    status: 'active'
  },
  {
    username: 'manager1',
    email: 'manager1@shyaw.com',
    password: 'password123',
    firstName: 'Manager',
    lastName: 'One',
    role: 'manager',
    status: 'active'
  },
  {
    username: 'manager2',
    email: 'manager2@shyaw.com',
    password: 'password123',
    firstName: 'Manager',
    lastName: 'Two',
    role: 'manager',
    status: 'active'
  },
  {
    username: 'office_manager',
    email: 'office.manager@shyaw.com',
    password: 'password123',
    firstName: 'Office',
    lastName: 'Manager',
    role: 'office',
    status: 'active'
  }
];

async function addUsers() {
  try {
    console.log('🔍 Adding new users...');
    
    for (const userData of newUsers) {
      // Check if user already exists
      const existingUser = await db.select().from(users).where(eq(users.username, userData.username)).limit(1);
      
      if (existingUser.length > 0) {
        console.log(`⚠️  User ${userData.username} already exists, skipping...`);
        continue;
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      // Create user
      await db.insert(users).values({
        ...userData,
        password: hashedPassword,
      });

      console.log(`✅ Created user: ${userData.username} (${userData.role})`);
    }

    console.log('');
    console.log('🎉 All users created successfully!');
    console.log('');
    console.log('New login credentials:');
    newUsers.forEach(user => {
      console.log(`👤 ${user.username} (${user.role}): password123`);
    });
    
  } catch (error) {
    console.error('❌ Error creating users:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

addUsers();
