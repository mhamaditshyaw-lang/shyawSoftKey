import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL
});

async function checkDatabaseTime() {
  try {
    await client.connect();
    
    // Check server time
    const serverTimeResult = await client.query('SELECT NOW() as server_time, CURRENT_TIMESTAMP as current_timestamp, CURRENT_DATE as current_date');
    console.log('Database Server Time:');
    console.log(`  NOW(): ${serverTimeResult.rows[0].server_time}`);
    console.log(`  CURRENT_TIMESTAMP: ${serverTimeResult.rows[0].current_timestamp}`);
    console.log(`  CURRENT_DATE: ${serverTimeResult.rows[0].current_date}`);
    
    // Check recent weekly_meeting_tasks
    const tasksResult = await client.query(`
      SELECT id, title, created_at 
      FROM weekly_meeting_tasks 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    console.log('\nRecent Weekly Meeting Tasks:');
    if (tasksResult.rows.length > 0) {
      tasksResult.rows.forEach(row => {
        console.log(`  ID ${row.id}: "${row.title}" - Created: ${row.created_at}`);
      });
    } else {
      console.log('  No tasks found');
    }
    
    // Check local machine time
    const localTime = new Date();
    console.log(`\nLocal Machine Time: ${localTime.toISOString()}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkDatabaseTime();
