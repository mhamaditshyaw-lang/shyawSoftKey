import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/complete-schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure pool with better settings for Neon
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 10, // Maximum number of connections
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 5000, // Connection timeout
  maxUses: 7500, // Close connection after this many uses
});

// Add connection error handling
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});

export const db = drizzle({ client: pool, schema });

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
        error.message?.includes('terminating connection') ||
        error.message?.includes('connection was closed');

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