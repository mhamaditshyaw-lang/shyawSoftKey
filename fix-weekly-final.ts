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
    
    // Check if columns exist
    const result = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'weekly_meeting_tasks'
      AND column_name IN ('completed_by_id', 'created_by_id');
    `);
    
    console.log('\nExisting columns:', result.rows.map(r => r.column_name));
    
    // Add missing columns
    const existingCols = result.rows.map(r => r.column_name);
    
    if (!existingCols.includes('completed_by_id')) {
      console.log('\nAdding completed_by_id...');
      await client.query(`
        ALTER TABLE weekly_meeting_tasks 
        ADD COLUMN completed_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
      `);
      console.log('✓ Added completed_by_id');
    }
    
    if (!existingCols.includes('created_by_id')) {
      console.log('Adding created_by_id...');
      await client.query(`
        ALTER TABLE weekly_meeting_tasks 
        ADD COLUMN created_by_id INTEGER;
      `);
      
      // Set defaults for existing rows
      await client.query(`
        UPDATE weekly_meeting_tasks SET created_by_id = 1 WHERE created_by_id IS NULL;
      `);
      
      // Add foreign key constraint
      await client.query(`
        ALTER TABLE weekly_meeting_tasks 
        ADD CONSTRAINT weekly_meeting_tasks_created_by_id_fk 
        FOREIGN KEY (created_by_id) REFERENCES users(id);
      `);
      
      // Make NOT NULL
      await client.query(`
        ALTER TABLE weekly_meeting_tasks 
        ALTER COLUMN created_by_id SET NOT NULL;
      `);
      console.log('✓ Added created_by_id');
    }
    
    // Verify
    const verify = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'weekly_meeting_tasks'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n=== Final weekly_meeting_tasks columns ===');
    verify.rows.forEach(row => {
      console.log(`✓ ${row.column_name}`);
    });
    
    console.log('\n✓ Database fix completed successfully!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

fixDatabase();
