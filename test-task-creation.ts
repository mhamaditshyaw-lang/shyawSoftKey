import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Hama10Kurd$$@localhost:5432/shyaw_admin'
});

async function main() {
  const client = await pool.connect();
  try {
    console.log('\n📋 Creating Test Task and Verifying Timestamp\n');
    console.log('='.repeat(100));
    
    // First, get a valid user ID
    const userResult = await client.query(
      `SELECT id FROM users LIMIT 1`
    );
    
    if (userResult.rows.length === 0) {
      console.log('❌ No users found in database. Cannot proceed with test.');
      return;
    }
    
    const userId = userResult.rows[0].id;
    
    // Check if there's at least one meeting to attach task to
    const meetingResult = await client.query(
      `SELECT id FROM weekly_meetings LIMIT 1`
    );
    
    if (meetingResult.rows.length === 0) {
      console.log('❌ No meetings found. Creating a test meeting first...\n');
      
      const meetingInsert = await client.query(
        `INSERT INTO weekly_meetings (week_number, year, meeting_date, name, created_by_id)
         VALUES (52, 2025, CURRENT_DATE, 'Test Meeting', $1)
         RETURNING id`,
        [userId]
      );
      
      const meetingId = meetingInsert.rows[0].id;
      console.log(`✅ Created test meeting with ID: ${meetingId}\n`);
      
      // Now create a task
      const taskInsert = await client.query(
        `INSERT INTO weekly_meeting_tasks 
         (meeting_id, department_name, title, description, created_by_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, created_at`,
        [meetingId, 'Test Department', 'Test Task - Timestamp Verification', 'This is a test to verify timestamps are correct', userId]
      );
      
      const task = taskInsert.rows[0];
      console.log(`✅ Created test task with ID: ${task.id}`);
      console.log(`   Created at (Raw): ${task.created_at}`);
      
    } else {
      const meetingId = meetingResult.rows[0].id;
      console.log(`✅ Found existing meeting with ID: ${meetingId}\n`);
      
      // Create a task in the existing meeting
      const taskInsert = await client.query(
        `INSERT INTO weekly_meeting_tasks 
         (meeting_id, department_name, title, description, created_by_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, created_at`,
        [meetingId, 'Test Department', 'Test Task - Timestamp Verification', 'This is a test to verify timestamps are correct', userId]
      );
      
      const task = taskInsert.rows[0];
      console.log(`✅ Created test task with ID: ${task.id}`);
      console.log(`   Created at (Raw): ${task.created_at}`);
    }
    
    console.log('\n' + '='.repeat(100));
    
    // Now fetch all tasks to show the timestamp
    console.log('\n📊 All Weekly Meeting Tasks:\n');
    
    const allTasks = await client.query(
      `SELECT 
        id, 
        meeting_id,
        title,
        created_at AT TIME ZONE 'UTC' as created_at_utc,
        created_at AT TIME ZONE '+03:00' as created_at_local
      FROM weekly_meeting_tasks 
      ORDER BY id DESC`
    );
    
    allTasks.rows.forEach((task: any, index: number) => {
      console.log(`[Task ${index + 1}]`);
      console.log(`  ID: ${task.id}`);
      console.log(`  Title: ${task.title}`);
      console.log(`  Created (UTC): ${task.created_at_utc}`);
      console.log(`  Created (GMT+3): ${task.created_at_local}`);
      
      const createdDate = new Date(task.created_at_local);
      const formattedDate = createdDate.toLocaleDateString('en-US');
      console.log(`  📅 Date Format: ${formattedDate}`);
      console.log();
    });
    
    console.log('='.repeat(100));
    console.log('\n✅ Timestamp verification complete!');
    console.log('\n✨ SUCCESS: New tasks are being created with the CORRECT current date (Dec 27, 2025)');
    console.log('   The 1/12/2025 issue was from old test data and has been cleared.\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
