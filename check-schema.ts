import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL
});

async function checkSchema() {
  try {
    await client.connect();
    console.log('Connected to database\n');
    
    // Check todo_items table structure
    const todoItemsResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'todo_items'
      ORDER BY ordinal_position;
    `);
    
    console.log('=== todo_items columns ===');
    todoItemsResult.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    // Check weekly_meeting_tasks table structure
    const weeklyTasksResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'weekly_meeting_tasks'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n=== weekly_meeting_tasks columns ===');
    weeklyTasksResult.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkSchema();
