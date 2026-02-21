import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL
});

async function fixWeeklyMeetingsTasks() {
  try {
    await client.connect();
    console.log('Connected to database\n');
    
    // Check if columns exist
    const checkResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'weekly_meeting_tasks' AND column_name = 'completed_by_id'
      ) as exists
    `);
    
    if (checkResult.rows[0].exists) {
      console.log('✓ completed_by_id column already exists');
    } else {
      console.log('Adding completed_by_id column...');
      await client.query(`ALTER TABLE weekly_meeting_tasks ADD COLUMN completed_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL`);
      console.log('✓ completed_by_id column added');
    }
    
    const checkResult2 = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'weekly_meeting_tasks' AND column_name = 'created_by_id'
      ) as exists
    `);
    
    if (checkResult2.rows[0].exists) {
      console.log('✓ created_by_id column already exists');
    } else {
      console.log('Adding created_by_id column...');
      await client.query(`ALTER TABLE weekly_meeting_tasks ADD COLUMN created_by_id INTEGER NOT NULL DEFAULT 1 REFERENCES users(id)`);
      console.log('✓ created_by_id column added');
      
      // Now set the default
      await client.query(`ALTER TABLE weekly_meeting_tasks ALTER COLUMN created_by_id DROP DEFAULT`);
      console.log('✓ removed default from created_by_id');
    }
    
    // Verify columns
    const verifyResult = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'weekly_meeting_tasks'
      ORDER BY ordinal_position
    `);
    
    console.log('\nweekly_meeting_tasks columns:');
    verifyResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
    console.log('\n✓ Schema update completed successfully!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

fixWeeklyMeetingsTasks();
