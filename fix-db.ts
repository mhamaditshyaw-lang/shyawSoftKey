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
    
    // Run the SQL commands
    const sql1 = `ALTER TABLE todo_items ADD COLUMN IF NOT EXISTS completed_by_note TEXT;`;
    const sql2 = `ALTER TABLE todo_items ADD COLUMN IF NOT EXISTS completed_by_id INTEGER REFERENCES users(id);`;
    
    console.log('Executing: ' + sql1);
    await client.query(sql1);
    console.log('✓ Column completed_by_note added');
    
    console.log('Executing: ' + sql2);
    await client.query(sql2);
    console.log('✓ Column completed_by_id added');
    
    console.log('\n✓ Database fix completed successfully!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

fixDatabase();
