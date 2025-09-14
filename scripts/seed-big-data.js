#!/usr/bin/env node

/**
 * Comprehensive big data seeding script for employee management system
 * This script generates substantial amounts of realistic data across all entities
 */

import { config } from 'dotenv';
import bcrypt from 'bcrypt';
import { db } from '../server/db.ts';
import { 
  users, 
  todoLists, 
  todoItems, 
  interviewRequests,
  operationalData,
  feedback,
  archivedItems,
  feedbackTypes
} from '../shared/complete-schema.ts';
import { deviceNotifications } from '../shared/device-notification-schema.ts';
import { eq } from 'drizzle-orm';

// Load environment variables
config();

// Comprehensive sample data arrays
const departments = [
  'Human Resources', 'Information Technology', 'Operations', 'Security', 
  'Finance', 'Marketing', 'Sales', 'Administration', 'Legal', 'R&D',
  'Customer Service', 'Quality Assurance', 'Procurement', 'Logistics'
];

const positions = {
  admin: ['System Administrator', 'IT Manager', 'Database Administrator', 'Network Administrator'],
  manager: ['Operations Manager', 'Department Head', 'Team Lead', 'Project Manager', 'Regional Manager'],
  security: ['Security Officer', 'Security Supervisor', 'Access Control Specialist', 'Security Analyst'],
  secretary: ['Executive Secretary', 'Administrative Assistant', 'Office Coordinator', 'Records Clerk'],
  office: ['Office Manager', 'Data Entry Clerk', 'Receptionist', 'Administrative Specialist'],
  office_team: ['Office Team Lead', 'Office Coordinator', 'Administrative Supervisor', 'Office Assistant']
};

const firstNames = [
  'Ahmed', 'Fatima', 'Mohammed', 'Aisha', 'Omar', 'Zainab', 'Ali', 'Maryam', 
  'Hassan', 'Khadija', 'Ibrahim', 'Nour', 'Yusuf', 'Layla', 'Khalid', 'Amina',
  'Salam', 'Huda', 'Tariq', 'Yasmin', 'Samir', 'Rania', 'Kareem', 'Sara',
  'Mustafa', 'Dina', 'Rashid', 'Hala', 'Nasser', 'Rana', 'Majid', 'Lina'
];

const lastNames = [
  'Al-Rashid', 'Al-Mahmoud', 'Al-Hassan', 'Al-Zahra', 'Al-Nouri', 'Al-Farouk',
  'Al-Sabah', 'Al-Majid', 'Al-Sharif', 'Al-Karim', 'Al-Saeed', 'Al-Mansour',
  'Al-Habib', 'Al-Amin', 'Al-Jalal', 'Al-Hakeem', 'Al-Rauf', 'Al-Latif'
];

const todoCategories = [
  'Project Management', 'Documentation', 'Training', 'Compliance', 'Maintenance',
  'Client Relations', 'Quality Control', 'Security Review', 'Team Coordination',
  'Budget Planning', 'Process Improvement', 'System Updates', 'Reporting'
];

const todoTitles = [
  'Complete quarterly security audit',
  'Update employee handbook policies',
  'Prepare monthly financial reports',
  'Conduct team performance reviews',
  'Implement new safety protocols',
  'Review and approve budget proposals',
  'Coordinate department meetings',
  'Update system documentation',
  'Process new employee onboarding',
  'Analyze operational efficiency metrics',
  'Prepare compliance reports',
  'Organize training sessions',
  'Review vendor contracts',
  'Update emergency procedures',
  'Conduct equipment inspections'
];

const interviewPositions = [
  'Senior Developer', 'HR Specialist', 'Security Analyst', 'Marketing Manager',
  'Sales Representative', 'Administrative Assistant', 'IT Support Technician',
  'Financial Analyst', 'Operations Coordinator', 'Customer Service Rep',
  'Quality Assurance Specialist', 'Project Manager', 'Legal Advisor'
];

// Helper functions
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generatePhoneNumber() {
  const prefixes = ['770', '750', '780', '790'];
  const prefix = getRandomElement(prefixes);
  const number = Math.floor(Math.random() * 9000000) + 1000000;
  return `+964-${prefix}-${number.toString().substring(0, 3)}-${number.toString().substring(3)}`;
}

async function seedBigData() {
  console.log('🚀 Starting comprehensive big data seeding...');
  
  try {
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    // Step 1: Create diverse users (100+ users)
    console.log('👥 Creating diverse user base...');
    const createdUsers = [];
    
    for (let i = 0; i < 120; i++) {
      const role = getRandomElement(['admin', 'manager', 'security', 'secretary', 'office', 'office_team']);
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      const department = getRandomElement(departments);
      const position = getRandomElement(positions[role]);
      const status = Math.random() > 0.1 ? 'active' : Math.random() > 0.5 ? 'pending' : 'inactive';
      
      const username = `${firstName.toLowerCase()}.${lastName.toLowerCase().replace('al-', '')}_${i}`;
      const email = `${username}@company.com`;
      
      // Check if user already exists
      const existingUser = await db.select().from(users).where(eq(users.username, username)).limit(1);
      if (existingUser.length > 0) continue;
      
      const userData = {
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        status,
        lastActiveAt: status === 'active' ? getRandomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()) : null
      };
      
      const [newUser] = await db.insert(users).values(userData).returning();
      createdUsers.push(newUser);
    }
    
    console.log(`✅ Created ${createdUsers.length} users`);
    
    // Get all users for relationships
    const allUsers = await db.select().from(users);
    const activeUsers = allUsers.filter(u => u.status === 'active');
    
    // Step 2: Create extensive todo lists and items (200+ lists, 800+ items)
    console.log('📋 Creating comprehensive todo system...');
    const createdTodoLists = [];
    
    for (let i = 0; i < 250; i++) {
      const creator = getRandomElement(activeUsers);
      const assignee = Math.random() > 0.3 ? getRandomElement(activeUsers) : null;
      const category = getRandomElement(todoCategories);
      const priority = getRandomElement(['low', 'medium', 'high', 'urgent']);
      
      const todoListData = {
        title: `${category} - ${getRandomElement(todoTitles)}`,
        description: `Comprehensive ${category.toLowerCase()} activities for ${getRandomElement(departments)} department`,
        createdById: creator.id,
        assignedToId: assignee?.id || null,
        priority
      };
      
      const [newTodoList] = await db.insert(todoLists).values(todoListData).returning();
      createdTodoLists.push(newTodoList);
      
      // Create 3-6 items per list
      const itemCount = Math.floor(Math.random() * 4) + 3;
      for (let j = 0; j < itemCount; j++) {
        const isCompleted = Math.random() > 0.6;
        const dueDate = getRandomDate(new Date(), new Date(Date.now() + 60 * 24 * 60 * 60 * 1000));
        
        const todoItemData = {
          todoListId: newTodoList.id,
          title: getRandomElement(todoTitles),
          description: `Detailed task description for ${category.toLowerCase()} item ${j + 1}`,
          isCompleted,
          priority: getRandomElement(['low', 'medium', 'high', 'urgent']),
          dueDate,
          completedAt: isCompleted ? getRandomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()) : null
        };
        
        await db.insert(todoItems).values(todoItemData);
      }
    }
    
    console.log(`✅ Created ${createdTodoLists.length} todo lists with ~${createdTodoLists.length * 4} items`);
    
    // Step 3: Create substantial operational data
    console.log('📊 Generating operational data...');
    const operationalTypes = [
      'employee', 'operations', 'staffCount', 'yesterdayProduction', 
      'yesterdayLoading', 'monthlyMetrics', 'weeklyReports', 'dailyStats'
    ];
    
    for (let i = 0; i < 200; i++) {
      const type = getRandomElement(operationalTypes);
      const creator = getRandomElement(activeUsers);
      
      const operationalDataEntry = {
        type,
        data: generateOperationalData(type),
        stats: generateOperationalStats(),
        createdById: creator.id
      };
      
      await db.insert(operationalData).values(operationalDataEntry);
    }
    
    console.log('✅ Created 200 operational data entries');
    
    // Step 4: Create interview requests (80+ requests)
    console.log('🎤 Creating interview requests...');
    
    for (let i = 0; i < 85; i++) {
      const requester = getRandomElement(activeUsers.filter(u => ['manager', 'admin'].includes(u.role)));
      const manager = getRandomElement(activeUsers.filter(u => u.role === 'manager'));
      const position = getRandomElement(interviewPositions);
      const status = getRandomElement(['pending', 'approved', 'rejected']);
      
      const candidateFirstName = getRandomElement(firstNames);
      const candidateLastName = getRandomElement(lastNames);
      
      const interviewData = {
        candidateName: `${candidateFirstName} ${candidateLastName}`,
        candidateEmail: `${candidateFirstName.toLowerCase()}.${candidateLastName.toLowerCase().replace('al-', '')}@email.com`,
        position,
        department: getRandomElement(departments),
        requestedById: requester.id,
        managerId: manager.id,
        status,
        description: `Interview request for ${position} position in ${getRandomElement(departments)} department. Candidate has relevant experience and qualifications.`,
        proposedDateTime: getRandomDate(new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        duration: Math.floor(Math.random() * 60) + 30
      };
      
      await db.insert(interviewRequests).values(interviewData);
    }
    
    console.log('✅ Created 85 interview requests');
    
    // Step 5: Create feedback types and feedback entries
    console.log('💬 Creating feedback system...');
    
    const feedbackTypeData = [
      { name: 'interview_feedback', displayName: 'Interview Feedback', description: 'Feedback from interview processes' },
      { name: 'general_feedback', displayName: 'General Feedback', description: 'General employee feedback' },
      { name: 'system_improvement', displayName: 'System Improvement', description: 'Suggestions for system improvements' },
      { name: 'user_experience', displayName: 'User Experience', description: 'User experience feedback' },
      { name: 'performance_review', displayName: 'Performance Review', description: 'Employee performance feedback' },
      { name: 'training_feedback', displayName: 'Training Feedback', description: 'Training session feedback' }
    ];
    
    for (const typeData of feedbackTypeData) {
      const creator = getRandomElement(activeUsers.filter(u => u.role === 'admin'));
      const existingType = await db.select().from(feedbackTypes).where(eq(feedbackTypes.name, typeData.name)).limit(1);
      
      if (existingType.length === 0) {
        await db.insert(feedbackTypes).values({
          ...typeData,
          createdById: creator.id
        });
      }
    }
    
    // Create feedback entries
    for (let i = 0; i < 150; i++) {
      const submitter = getRandomElement(activeUsers);
      const type = getRandomElement(feedbackTypeData).name;
      const rating = getRandomElement(['1', '2', '3', '4', '5']);
      
      const feedbackData = {
        type,
        title: `${type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} - ${i + 1}`,
        description: `Detailed feedback about ${type.replace('_', ' ')} submitted by ${submitter.firstName} ${submitter.lastName}`,
        rating,
        submittedById: submitter.id
      };
      
      await db.insert(feedback).values(feedbackData);
    }
    
    console.log('✅ Created feedback types and 150 feedback entries');
    
    // Step 6: Create archived items
    console.log('🗄️ Creating archived items...');
    
    for (let i = 0; i < 60; i++) {
      const archiver = getRandomElement(activeUsers.filter(u => ['admin', 'manager'].includes(u.role)));
      const itemType = getRandomElement(['todo', 'interview', 'user']);
      
      const archiveData = {
        itemType,
        itemId: Math.floor(Math.random() * 100) + 1,
        itemData: JSON.stringify({
          title: `Archived ${itemType} item`,
          description: `Historical data for ${itemType}`,
          archived_reason: `Completed ${itemType} process`
        }),
        archivedById: archiver.id,
        reason: `${itemType} completed and archived for record keeping`
      };
      
      await db.insert(archivedItems).values(archiveData);
    }
    
    console.log('✅ Created 60 archived items');
    
    // Step 7: Create device notifications
    console.log('🔔 Creating device notifications...');
    
    const notificationTypes = [
      'system_alert', 'task_reminder', 'user_activity', 'security_alert',
      'maintenance_notice', 'deadline_warning', 'achievement', 'general'
    ];
    
    for (let i = 0; i < 300; i++) {
      const recipient = getRandomElement(activeUsers);
      const type = getRandomElement(notificationTypes);
      const priority = getRandomElement(['low', 'normal', 'high', 'urgent']);
      const isRead = Math.random() > 0.4;
      
      const notificationData = {
        userId: recipient.id,
        type,
        priority,
        title: `${type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Notification`,
        message: `Important ${type.replace('_', ' ')} notification for ${recipient.firstName} ${recipient.lastName}`,
        isRead,
        readAt: isRead ? getRandomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()) : null
      };
      
      await db.insert(deviceNotifications).values(notificationData);
    }
    
    console.log('✅ Created 300 device notifications');
    
    console.log('✅ Skipped reminders as they are handled separately');
    
    console.log('');
    console.log('🎉 Big data seeding completed successfully!');
    console.log('');
    console.log('📈 Summary of created data:');
    console.log(`👥 Users: 120+`);
    console.log(`📋 Todo Lists: 250+`);
    console.log(`✅ Todo Items: 1000+`);
    console.log(`📊 Operational Data: 200 entries`);
    console.log(`🎤 Interview Requests: 85`);
    console.log(`💬 Feedback Entries: 150`);
    console.log(`🗄️ Archived Items: 60`);
    console.log(`🔔 Device Notifications: 300`);
    console.log('');
    console.log('Your system now has substantial big data for testing and demonstration!');
    
  } catch (error) {
    console.error('❌ Error during big data seeding:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Permissions removed since they don't exist in the current schema

// Helper function to generate operational data based on type
function generateOperationalData(type) {
  switch (type) {
    case 'employee':
      return {
        totalEmployees: Math.floor(Math.random() * 500) + 100,
        activeEmployees: Math.floor(Math.random() * 450) + 90,
        departmentBreakdown: departments.reduce((acc, dept) => {
          acc[dept] = Math.floor(Math.random() * 50) + 5;
          return acc;
        }, {})
      };
    
    case 'operations':
      return {
        dailyTransactions: Math.floor(Math.random() * 1000) + 200,
        systemUptime: (Math.random() * 10 + 90).toFixed(2),
        activeProcesses: Math.floor(Math.random() * 50) + 10
      };
    
    case 'staffCount':
      return {
        morning: Math.floor(Math.random() * 200) + 50,
        afternoon: Math.floor(Math.random() * 180) + 45,
        evening: Math.floor(Math.random() * 100) + 20
      };
    
    case 'yesterdayProduction':
      return {
        totalUnits: Math.floor(Math.random() * 5000) + 1000,
        qualityScore: (Math.random() * 20 + 80).toFixed(2),
        efficiency: (Math.random() * 30 + 70).toFixed(2)
      };
    
    case 'yesterdayLoading':
      return {
        trucksLoaded: Math.floor(Math.random() * 50) + 10,
        totalWeight: Math.floor(Math.random() * 100000) + 20000,
        averageTime: Math.floor(Math.random() * 60) + 30
      };
    
    default:
      return {
        value: Math.floor(Math.random() * 1000),
        timestamp: new Date().toISOString(),
        category: type
      };
  }
}

// Helper function to generate operational stats
function generateOperationalStats() {
  return {
    total: Math.floor(Math.random() * 10000) + 1000,
    average: (Math.random() * 100 + 50).toFixed(2),
    max: Math.floor(Math.random() * 500) + 100,
    min: Math.floor(Math.random() * 50) + 1
  };
}

// Run the seeding
seedBigData();