#!/usr/bin/env node

/**
 * Script to add interview requests and feedback data
 */

import { config } from 'dotenv';
import { db } from '../server/db.ts';
import { 
  interviewRequests,
  feedback,
  feedbackTypes 
} from '../shared/complete-schema.ts';
import { eq } from 'drizzle-orm';

// Load environment variables
config();

const interviewPositions = [
  'Senior Developer', 'HR Specialist', 'Security Analyst', 'Marketing Manager',
  'Sales Representative', 'Administrative Assistant', 'IT Support Technician',
  'Financial Analyst', 'Operations Coordinator', 'Customer Service Rep',
  'Quality Assurance Specialist', 'Project Manager', 'Legal Advisor',
  'Data Analyst', 'Network Administrator', 'Business Analyst'
];

const departments = [
  'Human Resources', 'Information Technology', 'Operations', 'Security', 
  'Finance', 'Marketing', 'Sales', 'Administration', 'Legal', 'R&D'
];

const firstNames = [
  'Ahmed', 'Fatima', 'Mohammed', 'Aisha', 'Omar', 'Zainab', 'Ali', 'Maryam', 
  'Hassan', 'Khadija', 'Ibrahim', 'Nour', 'Yusuf', 'Layla', 'Khalid', 'Amina'
];

const lastNames = [
  'Al-Rashid', 'Al-Mahmoud', 'Al-Hassan', 'Al-Zahra', 'Al-Nouri', 'Al-Farouk',
  'Al-Sabah', 'Al-Majid', 'Al-Sharif', 'Al-Karim', 'Al-Saeed', 'Al-Mansour'
];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function seedInterviewsAndFeedback() {
  console.log('🎤 Creating interview requests and feedback...');
  
  try {
    // Create interview requests
    console.log('📝 Creating interview requests...');
    const interviewEntries = [];
    
    for (let i = 0; i < 120; i++) {
      const candidateFirstName = getRandomElement(firstNames);
      const candidateLastName = getRandomElement(lastNames);
      const position = getRandomElement(interviewPositions);
      const department = getRandomElement(departments);
      const status = getRandomElement(['pending', 'approved', 'rejected']);
      
      const entry = {
        candidateName: `${candidateFirstName} ${candidateLastName}`,
        candidateEmail: `${candidateFirstName.toLowerCase()}.${candidateLastName.toLowerCase().replace('al-', '')}@email.com`,
        position,
        department,
        requestedById: Math.floor(Math.random() * 68) + 1, // Manager/admin users (first 68 are likely managers/admins)
        managerId: Math.floor(Math.random() * 38) + 30, // Manager users
        status,
        description: `Interview request for ${position} position in ${department} department. Candidate has relevant experience and strong qualifications for the role.`,
        proposedDateTime: getRandomDate(new Date(), new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)),
        duration: Math.floor(Math.random() * 60) + 30 // 30-90 minutes
      };
      
      interviewEntries.push(entry);
    }
    
    // Insert interviews in batches
    for (let i = 0; i < interviewEntries.length; i += 30) {
      const batch = interviewEntries.slice(i, i + 30);
      await db.insert(interviewRequests).values(batch);
    }
    
    console.log(`✅ Created ${interviewEntries.length} interview requests`);
    
    // Create feedback types
    console.log('💭 Creating feedback types...');
    const feedbackTypeData = [
      { name: 'interview_feedback', displayName: 'Interview Feedback', description: 'Feedback from interview processes' },
      { name: 'general_feedback', displayName: 'General Feedback', description: 'General employee feedback' },
      { name: 'system_improvement', displayName: 'System Improvement', description: 'Suggestions for system improvements' },
      { name: 'user_experience', displayName: 'User Experience', description: 'User experience feedback' },
      { name: 'performance_review', displayName: 'Performance Review', description: 'Employee performance feedback' },
      { name: 'training_feedback', displayName: 'Training Feedback', description: 'Training session feedback' }
    ];
    
    for (const typeData of feedbackTypeData) {
      const existingType = await db.select().from(feedbackTypes).where(eq(feedbackTypes.name, typeData.name)).limit(1);
      
      if (existingType.length === 0) {
        await db.insert(feedbackTypes).values({
          ...typeData,
          createdById: Math.floor(Math.random() * 30) + 1 // Admin users
        });
      }
    }
    
    // Create feedback entries
    console.log('🗨️ Creating feedback entries...');
    const feedbackEntries = [];
    
    for (let i = 0; i < 200; i++) {
      const type = getRandomElement(feedbackTypeData).name;
      const rating = getRandomElement(['1', '2', '3', '4', '5']);
      const submitterId = Math.floor(Math.random() * 211) + 1;
      
      const entry = {
        type,
        title: `${type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} - Entry ${i + 1}`,
        description: `Detailed feedback about ${type.replace('_', ' ')} submitted by user. This feedback provides valuable insights for improving our processes and systems.`,
        rating,
        submittedById: submitterId,
        relatedInterviewId: type === 'interview_feedback' && Math.random() > 0.5 ? Math.floor(Math.random() * 120) + 1 : null
      };
      
      feedbackEntries.push(entry);
    }
    
    // Insert feedback in batches
    for (let i = 0; i < feedbackEntries.length; i += 40) {
      const batch = feedbackEntries.slice(i, i + 40);
      await db.insert(feedback).values(batch);
    }
    
    console.log(`✅ Created ${feedbackEntries.length} feedback entries`);
    console.log('🎉 Interview and feedback seeding completed!');
    
  } catch (error) {
    console.error('❌ Error creating interviews/feedback:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seedInterviewsAndFeedback();