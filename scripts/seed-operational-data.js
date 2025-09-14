#!/usr/bin/env node

/**
 * Script to add operational data in bulk
 */

import { config } from 'dotenv';
import { db } from '../server/db.ts';
import { operationalData } from '../shared/complete-schema.ts';

// Load environment variables
config();

async function seedOperationalData() {
  console.log('📊 Creating substantial operational data...');
  
  try {
    const operationalTypes = [
      'employee', 'operations', 'staffCount', 'yesterdayProduction', 
      'yesterdayLoading', 'monthlyMetrics', 'weeklyReports', 'dailyStats',
      'performanceMetrics', 'resourceUtilization', 'systemHealth'
    ];
    
    const operationalEntries = [];
    
    for (let i = 0; i < 300; i++) {
      const type = operationalTypes[Math.floor(Math.random() * operationalTypes.length)];
      
      const entry = {
        type,
        data: generateOperationalData(type),
        stats: generateOperationalStats(),
        createdById: Math.floor(Math.random() * 211) + 1 // Random user ID from created users
      };
      
      operationalEntries.push(entry);
    }
    
    // Insert in batches of 50
    for (let i = 0; i < operationalEntries.length; i += 50) {
      const batch = operationalEntries.slice(i, i + 50);
      await db.insert(operationalData).values(batch);
    }
    
    console.log(`✅ Created ${operationalEntries.length} operational data entries`);
    
  } catch (error) {
    console.error('❌ Error creating operational data:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

function generateOperationalData(type) {
  switch (type) {
    case 'employee':
      return {
        totalEmployees: Math.floor(Math.random() * 500) + 100,
        activeEmployees: Math.floor(Math.random() * 450) + 90,
        departmentBreakdown: {
          'IT': Math.floor(Math.random() * 50) + 10,
          'HR': Math.floor(Math.random() * 30) + 5,
          'Operations': Math.floor(Math.random() * 80) + 20,
          'Security': Math.floor(Math.random() * 40) + 10
        }
      };
    
    case 'operations':
      return {
        dailyTransactions: Math.floor(Math.random() * 1000) + 200,
        systemUptime: (Math.random() * 10 + 90).toFixed(2),
        activeProcesses: Math.floor(Math.random() * 50) + 10,
        errorRate: (Math.random() * 5).toFixed(3)
      };
    
    case 'staffCount':
      return {
        morning: Math.floor(Math.random() * 200) + 50,
        afternoon: Math.floor(Math.random() * 180) + 45,
        evening: Math.floor(Math.random() * 100) + 20,
        night: Math.floor(Math.random() * 30) + 5
      };
    
    case 'yesterdayProduction':
      return {
        totalUnits: Math.floor(Math.random() * 5000) + 1000,
        qualityScore: (Math.random() * 20 + 80).toFixed(2),
        efficiency: (Math.random() * 30 + 70).toFixed(2),
        defectRate: (Math.random() * 3).toFixed(2)
      };
    
    case 'yesterdayLoading':
      return {
        trucksLoaded: Math.floor(Math.random() * 50) + 10,
        totalWeight: Math.floor(Math.random() * 100000) + 20000,
        averageTime: Math.floor(Math.random() * 60) + 30,
        efficiency: (Math.random() * 30 + 70).toFixed(2)
      };
    
    case 'performanceMetrics':
      return {
        responseTime: (Math.random() * 500 + 100).toFixed(2),
        throughput: Math.floor(Math.random() * 1000) + 500,
        availability: (Math.random() * 5 + 95).toFixed(2)
      };
    
    default:
      return {
        value: Math.floor(Math.random() * 1000),
        timestamp: new Date().toISOString(),
        category: type,
        status: Math.random() > 0.8 ? 'warning' : 'normal'
      };
  }
}

function generateOperationalStats() {
  return {
    total: Math.floor(Math.random() * 10000) + 1000,
    average: (Math.random() * 100 + 50).toFixed(2),
    max: Math.floor(Math.random() * 500) + 100,
    min: Math.floor(Math.random() * 50) + 1,
    variance: (Math.random() * 20).toFixed(2)
  };
}

seedOperationalData();