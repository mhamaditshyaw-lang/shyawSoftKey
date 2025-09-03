import { db } from '../server/db.ts';
import { sql } from 'drizzle-orm';
import { config } from 'dotenv';

// Load environment variables
config();

async function testConnection() {
  console.log('Testing database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
  
  try {
    const result = await db.execute(sql`SELECT 1 as test`);
    console.log('✅ Database connection successful!', result.rows);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

testConnection().then((success) => {
  process.exit(success ? 0 : 1);
}).catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});