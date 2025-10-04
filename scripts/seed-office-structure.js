#!/usr/bin/env node

/**
 * Script to create sample office structure with managers, employees, and secretaries
 * Demonstrates office-based data isolation where each manager can only see their team's data
 */

import { config } from 'dotenv';
import bcrypt from 'bcrypt';
import { db } from '../server/db.ts';
import { users } from '../shared/schema.ts';
import { eq } from 'drizzle-orm';

config();

async function seedOfficeStructure() {
  try {
    console.log('🏢 Creating office structure with managers, employees, and secretaries...\n');

    const hashedPassword = await bcrypt.hash('password123', 12);

    // Office 1: Sales Department
    console.log('📋 Creating Sales Department...');
    
    const [salesManager] = await db.insert(users).values({
      username: 'sales_manager',
      email: 'sales.manager@company.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Smith',
      role: 'manager',
      status: 'active',
      department: 'Sales',
      position: 'Sales Manager',
      phoneNumber: '+1-555-0101'
    }).returning();
    console.log(`  ✅ Manager created: ${salesManager.firstName} ${salesManager.lastName} (${salesManager.username})`);

    const [salesSecretary] = await db.insert(users).values({
      username: 'sales_secretary',
      email: 'sales.secretary@company.com',
      password: hashedPassword,
      firstName: 'Emily',
      lastName: 'Johnson',
      role: 'secretary',
      status: 'active',
      department: 'Sales',
      position: 'Executive Secretary',
      phoneNumber: '+1-555-0102',
      managerId: salesManager.id
    }).returning();
    console.log(`  ✅ Secretary created: ${salesSecretary.firstName} ${salesSecretary.lastName} (${salesSecretary.username})`);

    const salesEmployees = await db.insert(users).values([
      {
        username: 'sales_emp1',
        email: 'michael.brown@company.com',
        password: hashedPassword,
        firstName: 'Michael',
        lastName: 'Brown',
        role: 'security',
        status: 'active',
        department: 'Sales',
        position: 'Sales Representative',
        phoneNumber: '+1-555-0103',
        managerId: salesManager.id
      },
      {
        username: 'sales_emp2',
        email: 'sarah.davis@company.com',
        password: hashedPassword,
        firstName: 'Sarah',
        lastName: 'Davis',
        role: 'security',
        status: 'active',
        department: 'Sales',
        position: 'Senior Sales Representative',
        phoneNumber: '+1-555-0104',
        managerId: salesManager.id
      },
      {
        username: 'sales_emp3',
        email: 'david.wilson@company.com',
        password: hashedPassword,
        firstName: 'David',
        lastName: 'Wilson',
        role: 'security',
        status: 'active',
        department: 'Sales',
        position: 'Sales Representative',
        phoneNumber: '+1-555-0105',
        managerId: salesManager.id
      }
    ]).returning();
    console.log(`  ✅ ${salesEmployees.length} employees created\n`);

    // Office 2: Marketing Department
    console.log('📋 Creating Marketing Department...');
    
    const [marketingManager] = await db.insert(users).values({
      username: 'marketing_manager',
      email: 'marketing.manager@company.com',
      password: hashedPassword,
      firstName: 'Jennifer',
      lastName: 'Taylor',
      role: 'manager',
      status: 'active',
      department: 'Marketing',
      position: 'Marketing Manager',
      phoneNumber: '+1-555-0201'
    }).returning();
    console.log(`  ✅ Manager created: ${marketingManager.firstName} ${marketingManager.lastName} (${marketingManager.username})`);

    const [marketingSecretary] = await db.insert(users).values({
      username: 'marketing_secretary',
      email: 'marketing.secretary@company.com',
      password: hashedPassword,
      firstName: 'Lisa',
      lastName: 'Anderson',
      role: 'secretary',
      status: 'active',
      department: 'Marketing',
      position: 'Administrative Assistant',
      phoneNumber: '+1-555-0202',
      managerId: marketingManager.id
    }).returning();
    console.log(`  ✅ Secretary created: ${marketingSecretary.firstName} ${marketingSecretary.lastName} (${marketingSecretary.username})`);

    const marketingEmployees = await db.insert(users).values([
      {
        username: 'marketing_emp1',
        email: 'james.martinez@company.com',
        password: hashedPassword,
        firstName: 'James',
        lastName: 'Martinez',
        role: 'security',
        status: 'active',
        department: 'Marketing',
        position: 'Marketing Specialist',
        phoneNumber: '+1-555-0203',
        managerId: marketingManager.id
      },
      {
        username: 'marketing_emp2',
        email: 'emma.garcia@company.com',
        password: hashedPassword,
        firstName: 'Emma',
        lastName: 'Garcia',
        role: 'security',
        status: 'active',
        department: 'Marketing',
        position: 'Content Creator',
        phoneNumber: '+1-555-0204',
        managerId: marketingManager.id
      }
    ]).returning();
    console.log(`  ✅ ${marketingEmployees.length} employees created\n`);

    // Office 3: HR Department
    console.log('📋 Creating HR Department...');
    
    const [hrManager] = await db.insert(users).values({
      username: 'hr_manager',
      email: 'hr.manager@company.com',
      password: hashedPassword,
      firstName: 'Robert',
      lastName: 'Miller',
      role: 'manager',
      status: 'active',
      department: 'Human Resources',
      position: 'HR Manager',
      phoneNumber: '+1-555-0301'
    }).returning();
    console.log(`  ✅ Manager created: ${hrManager.firstName} ${hrManager.lastName} (${hrManager.username})`);

    const [hrSecretary] = await db.insert(users).values({
      username: 'hr_secretary',
      email: 'hr.secretary@company.com',
      password: hashedPassword,
      firstName: 'Amanda',
      lastName: 'Rodriguez',
      role: 'secretary',
      status: 'active',
      department: 'Human Resources',
      position: 'HR Assistant',
      phoneNumber: '+1-555-0302',
      managerId: hrManager.id
    }).returning();
    console.log(`  ✅ Secretary created: ${hrSecretary.firstName} ${hrSecretary.lastName} (${hrSecretary.username})`);

    const hrEmployees = await db.insert(users).values([
      {
        username: 'hr_emp1',
        email: 'william.lee@company.com',
        password: hashedPassword,
        firstName: 'William',
        lastName: 'Lee',
        role: 'security',
        status: 'active',
        department: 'Human Resources',
        position: 'HR Specialist',
        phoneNumber: '+1-555-0303',
        managerId: hrManager.id
      },
      {
        username: 'hr_emp2',
        email: 'olivia.thomas@company.com',
        password: hashedPassword,
        firstName: 'Olivia',
        lastName: 'Thomas',
        role: 'security',
        status: 'active',
        department: 'Human Resources',
        position: 'Recruiter',
        phoneNumber: '+1-555-0304',
        managerId: hrManager.id
      },
      {
        username: 'hr_emp3',
        email: 'daniel.jackson@company.com',
        password: hashedPassword,
        firstName: 'Daniel',
        lastName: 'Jackson',
        role: 'security',
        status: 'active',
        department: 'Human Resources',
        position: 'Training Coordinator',
        phoneNumber: '+1-555-0305',
        managerId: hrManager.id
      }
    ]).returning();
    console.log(`  ✅ ${hrEmployees.length} employees created\n`);

    // Office 4: IT Department
    console.log('📋 Creating IT Department...');
    
    const [itManager] = await db.insert(users).values({
      username: 'it_manager',
      email: 'it.manager@company.com',
      password: hashedPassword,
      firstName: 'Christopher',
      lastName: 'White',
      role: 'manager',
      status: 'active',
      department: 'Information Technology',
      position: 'IT Manager',
      phoneNumber: '+1-555-0401'
    }).returning();
    console.log(`  ✅ Manager created: ${itManager.firstName} ${itManager.lastName} (${itManager.username})`);

    const [itSecretary] = await db.insert(users).values({
      username: 'it_secretary',
      email: 'it.secretary@company.com',
      password: hashedPassword,
      firstName: 'Sophia',
      lastName: 'Harris',
      role: 'secretary',
      status: 'active',
      department: 'Information Technology',
      position: 'Technical Administrator',
      phoneNumber: '+1-555-0402',
      managerId: itManager.id
    }).returning();
    console.log(`  ✅ Secretary created: ${itSecretary.firstName} ${itSecretary.lastName} (${itSecretary.username})`);

    const itEmployees = await db.insert(users).values([
      {
        username: 'it_emp1',
        email: 'matthew.clark@company.com',
        password: hashedPassword,
        firstName: 'Matthew',
        lastName: 'Clark',
        role: 'security',
        status: 'active',
        department: 'Information Technology',
        position: 'System Administrator',
        phoneNumber: '+1-555-0403',
        managerId: itManager.id
      },
      {
        username: 'it_emp2',
        email: 'isabella.lewis@company.com',
        password: hashedPassword,
        firstName: 'Isabella',
        lastName: 'Lewis',
        role: 'security',
        status: 'active',
        department: 'Information Technology',
        position: 'Network Engineer',
        phoneNumber: '+1-555-0404',
        managerId: itManager.id
      }
    ]).returning();
    console.log(`  ✅ ${itEmployees.length} employees created\n`);

    console.log('═══════════════════════════════════════════════════════════');
    console.log('✨ Office structure created successfully!\n');
    console.log('📊 Summary:');
    console.log('   • 4 Departments created');
    console.log('   • 4 Managers');
    console.log('   • 4 Secretaries');
    console.log('   • 10 Employees');
    console.log('   • Total: 18 users\n');
    
    console.log('🔐 Login Credentials (all passwords: password123):\n');
    console.log('📁 SALES DEPARTMENT:');
    console.log('   Manager:   sales_manager');
    console.log('   Secretary: sales_secretary');
    console.log('   Employees: sales_emp1, sales_emp2, sales_emp3\n');
    
    console.log('📁 MARKETING DEPARTMENT:');
    console.log('   Manager:   marketing_manager');
    console.log('   Secretary: marketing_secretary');
    console.log('   Employees: marketing_emp1, marketing_emp2\n');
    
    console.log('📁 HR DEPARTMENT:');
    console.log('   Manager:   hr_manager');
    console.log('   Secretary: hr_secretary');
    console.log('   Employees: hr_emp1, hr_emp2, hr_emp3\n');
    
    console.log('📁 IT DEPARTMENT:');
    console.log('   Manager:   it_manager');
    console.log('   Secretary: it_secretary');
    console.log('   Employees: it_emp1, it_emp2\n');
    
    console.log('🔒 DATA ISOLATION DEMO:');
    console.log('   • Each manager can ONLY see their own team members');
    console.log('   • Sales Manager sees: sales_manager, sales_secretary, sales_emp1-3');
    console.log('   • Marketing Manager sees: marketing_manager, marketing_secretary, marketing_emp1-2');
    console.log('   • HR Manager sees: hr_manager, hr_secretary, hr_emp1-3');
    console.log('   • IT Manager sees: it_manager, it_secretary, it_emp1-2');
    console.log('   • Employees and secretaries can only see their own data');
    console.log('   • Admin users can see ALL users and data\n');
    console.log('═══════════════════════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Error creating office structure:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seedOfficeStructure();
