import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/task_master'
});

async function main() {
  const client = await pool.connect();
  try {
    console.log('\n📋 Weekly Meeting Tasks - Recent Timestamps\n');
    console.log('='.repeat(100));
    
    const result = await client.query(
      `SELECT 
        id, 
        meeting_id,
        title,
        created_at AT TIME ZONE 'UTC' as created_at_utc,
        created_at AT TIME ZONE '+03:00' as created_at_local,
        completed_at
      FROM weekly_meeting_tasks 
      ORDER BY id DESC 
      LIMIT 10`
    );
    
    if (result.rows.length === 0) {
      console.log('❌ No tasks found in database');
    } else {
      result.rows.forEach((task: any, index: number) => {
        console.log(`\n[Task ${index + 1}]`);
        console.log(`  ID: ${task.id}`);
        console.log(`  Title: ${task.title || '(no title)'}`);
        console.log(`  Meeting ID: ${task.meeting_id}`);
        console.log(`  Created (UTC): ${task.created_at_utc}`);
        console.log(`  Created (GMT+3): ${task.created_at_local}`);
        console.log(`  Completed: ${task.completed_at || 'Not completed'}`);
        
        // Parse the date to show user-friendly format
        const createdDate = new Date(task.created_at_local);
        console.log(`  📅 Date: ${createdDate.toLocaleDateString()} at ${createdDate.toLocaleTimeString()}`);
      });
    }
    
    console.log('\n' + '='.repeat(100));
    console.log('\n✅ Timestamp verification complete!');
    console.log('\nNOTE: If you see 1/12/2025 dates, that indicates December 1, 2025');
    console.log('      If you see current dates (12/27/2025+), the issue is fixed!\n');
    
  } catch (error) {
    console.error('❌ Database Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
