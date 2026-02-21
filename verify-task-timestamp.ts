import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const queryClient = postgres(
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/task_master'
);
const db = drizzle(queryClient);

async function main() {
  try {
    console.log('Fetching recent weekly meeting tasks...\n');
    
    // Raw query to get all tasks with timestamps
    const tasks = await queryClient`
      SELECT 
        id,
        meeting_id,
        title,
        created_at,
        updated_at,
        completed_at
      FROM weekly_meeting_tasks
      ORDER BY created_at DESC
      LIMIT 10
    `;
    
    console.log('Recent Tasks:');
    console.log('='.repeat(80));
    
    if (tasks.length === 0) {
      console.log('No tasks found in database');
    } else {
      tasks.forEach((task: any) => {
        console.log(`\nTask ID: ${task.id}`);
        console.log(`Title: ${task.title}`);
        console.log(`Meeting ID: ${task.meeting_id}`);
        console.log(`Created At: ${task.created_at}`);
        console.log(`Updated At: ${task.updated_at}`);
        console.log(`Completed At: ${task.completed_at}`);
        
        // Check date value
        const createdDate = new Date(task.created_at);
        console.log(`Created Date (ISO): ${createdDate.toISOString()}`);
        console.log(`Created Date (Local): ${createdDate.toLocaleString()}`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ Task timestamp verification complete');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await queryClient.end();
  }
}

main();
