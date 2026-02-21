import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL
});

async function fixDatabase() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Add missing columns to weekly_meeting_tasks
    const sql1 = `ALTER TABLE weekly_meeting_tasks ADD COLUMN IF NOT EXISTS completed_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL;`;
    const sql2 = `ALTER TABLE weekly_meeting_tasks ADD COLUMN IF NOT EXISTS created_by_id INTEGER REFERENCES users(id);`;
    
    console.log('Adding completed_by_id to weekly_meeting_tasks...');
    await client.query(sql1);
    console.log('✓ Column completed_by_id added');
    
    console.log('Adding created_by_id to weekly_meeting_tasks...');
    await client.query(sql2);
    console.log('✓ Column created_by_id added');
    
    // Set existing rows to have created_by_id = 1 (admin user)
    const updateSql = `UPDATE weekly_meeting_tasks SET created_by_id = 1 WHERE created_by_id IS NULL;`;
    console.log('Updating existing rows with default created_by_id...');
    const result = await client.query(updateSql);
    console.log(`✓ Updated ${result.rowCount} rows`);
    
    // Make created_by_id NOT NULL
    const notNullSql = `ALTER TABLE weekly_meeting_tasks ALTER COLUMN created_by_id SET NOT NULL;`;
    console.log('Setting created_by_id as NOT NULL...');
    await client.query(notNullSql);
    console.log('✓ created_by_id set as NOT NULL');
    
    console.log('\n✓ Database fix completed successfully!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

fixDatabase();
