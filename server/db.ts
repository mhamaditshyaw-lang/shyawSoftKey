import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/complete-schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure pool with better settings for local PostgreSQL
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 10, // Maximum number of connections
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 30000, // Connection timeout (increased for Neon database wake-up)
});

// Add connection error handling
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});

export const db = drizzle(pool, { schema });

// Helper function to execute queries with retry logic
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      // Check if it's a connection error that we should retry
      const shouldRetry = 
        error.code === '57P01' || // admin command termination
        error.code === '08003' || // connection does not exist
        error.code === '08006' || // connection failure
        error.code === '08001' || // unable to connect
        error.code === '28P01' || // password authentication failed (can occur during Neon database wake-up)
        error.message?.includes('terminating connection') ||
        error.message?.includes('connection was closed') ||
        error.message?.includes('endpoint has been disabled');

      if (shouldRetry && attempt < maxRetries) {
        console.log(`Database operation failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
        continue;
      }
      
      console.error('Database operation failed:', error);
      throw error;
    }
  }
  
  throw new Error('Max retries exceeded');
}