#!/usr/bin/env node

/**
 * Script to reset database (clear all data except users) for development
 */

import { config } from 'dotenv';
import { db } from '../server/db.js';
import { 
  todoItems, 
  todoLists, 
  interviewRequests,
  deviceNotifications,
  operationalData
} from '../shared/schema.js';
import { feedback, archivedItems } from '../shared/feedback-schema.js';

// Load environment variables
config();

async function resetDatabase() {
  try {
    console.log('🧹 Starting database reset...');
    console.log('⚠️  This will delete all data except users!');
    
    // Delete in correct order to respect foreign key constraints
    console.log('🗑️  Deleting todo items...');
    await db.delete(todoItems);
    
    console.log('🗑️  Deleting todo lists...');
    await db.delete(todoLists);
    
    console.log('🗑️  Deleting interview requests...');
    await db.delete(interviewRequests);
    
    console.log('🗑️  Deleting feedback...');
    await db.delete(feedback);
    
    console.log('🗑️  Deleting archived items...');
    await db.delete(archivedItems);
    
    console.log('🗑️  Deleting device notifications...');
    await db.delete(deviceNotifications);
    
    console.log('🗑️  Deleting operational data...');
    await db.delete(operationalData);
    
    console.log('✅ Database reset completed successfully!');
    console.log('👥 User accounts have been preserved');
    
  } catch (error) {
    console.error('❌ Error resetting database:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

resetDatabase();