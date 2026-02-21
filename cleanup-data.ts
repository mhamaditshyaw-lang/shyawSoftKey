import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Hama10Kurd$$@localhost:5432/shyaw_admin'
});

async function main() {
  const client = await pool.connect();
  try {
    console.log('\n🧹 Starting cleanup process...\n');
    console.log('='.repeat(80));

    // Step 1: Delete interview comments
    console.log('1️⃣  Deleting interview comments...');
    const commentResult = await client.query('DELETE FROM interview_comments');
    console.log(`   ✅ Deleted ${commentResult.rowCount} interview comments\n`);

    // Step 2: Delete interview requests
    console.log('2️⃣  Deleting interview requests...');
    const interviewResult = await client.query('DELETE FROM interview_requests');
    console.log(`   ✅ Deleted ${interviewResult.rowCount} interview requests\n`);

    // Step 3: Delete device notifications for non-admin users
    console.log('3️⃣  Deleting device notifications for non-admin users...');
    const notifyResult = await client.query('DELETE FROM device_notifications WHERE user_id != 1');
    console.log(`   ✅ Deleted ${notifyResult.rowCount} device notifications\n`);

    // Step 4: Delete feedback for non-admin users
    console.log('4️⃣  Deleting feedback from non-admin users...');
    const feedbackResult = await client.query('DELETE FROM feedback WHERE submitted_by_id != 1');
    console.log(`   ✅ Deleted ${feedbackResult.rowCount} feedback entries\n`);

    // Step 5: Delete archived items for non-admin users
    console.log('5️⃣  Deleting archived items from non-admin users...');
    const archivedResult = await client.query('DELETE FROM archived_items WHERE archived_by_id != 1');
    console.log(`   ✅ Deleted ${archivedResult.rowCount} archived items\n`);

    // Step 6: Delete reminders created by non-admin users
    console.log('6️⃣  Deleting reminders from non-admin users...');
    const remindersResult = await client.query('DELETE FROM reminders WHERE created_by_id != 1');
    console.log(`   ✅ Deleted ${remindersResult.rowCount} reminders\n`);

    // Step 7: Delete todo items
    console.log('7️⃣  Deleting todo items...');
    const todoItemsResult = await client.query('DELETE FROM todo_items');
    console.log(`   ✅ Deleted ${todoItemsResult.rowCount} todo items\n`);

    // Step 8: Delete todo lists for non-admin users
    console.log('8️⃣  Deleting todo lists from non-admin users...');
    const todoListResult = await client.query('DELETE FROM todo_lists WHERE created_by_id != 1');
    console.log(`   ✅ Deleted ${todoListResult.rowCount} todo lists\n`);

    // Step 9: Delete task comments
    console.log('9️⃣  Deleting task comments...');
    const taskCommentsResult = await client.query('DELETE FROM task_comments');
    console.log(`   ✅ Deleted ${taskCommentsResult.rowCount} task comments\n`);

    // Step 10: Delete weekly meeting tasks
    console.log('🔟 Deleting weekly meeting tasks...');
    const weeklyTasksResult = await client.query('DELETE FROM weekly_meeting_tasks');
    console.log(`   ✅ Deleted ${weeklyTasksResult.rowCount} weekly meeting tasks\n`);

    // Step 11: Delete department task progress
    console.log('1️⃣1️⃣  Deleting department task progress...');
    const deptProgressResult = await client.query('DELETE FROM department_task_progress');
    console.log(`   ✅ Deleted ${deptProgressResult.rowCount} department task progress entries\n`);

    // Step 12: Delete weekly meetings
    console.log('1️⃣2️⃣  Deleting weekly meetings...');
    const weeklyMeetingsResult = await client.query('DELETE FROM weekly_meetings');
    console.log(`   ✅ Deleted ${weeklyMeetingsResult.rowCount} weekly meetings\n`);

    // Step 13: Delete interview comments (again to be sure)
    console.log('1️⃣3️⃣  Deleting any remaining interview comments...');
    const remainingComments = await client.query('DELETE FROM interview_comments');
    console.log(`   ✅ Deleted ${remainingComments.rowCount} remaining interview comments\n`);

    // Step 14: Delete all users except admin (id = 1)
    console.log('1️⃣4️⃣  Deleting all users except admin...');
    const deleteResult = await client.query('DELETE FROM users WHERE id != 1');
    console.log(`   ✅ Deleted ${deleteResult.rowCount} users (kept admin)\n`);

    // Step 15: Verify admin still exists
    console.log('1️⃣5️⃣  Verifying admin user still exists...');
    const adminCheck = await client.query('SELECT id, username, email, role FROM users WHERE id = 1');
    
    if (adminCheck.rows.length > 0) {
      const admin = adminCheck.rows[0];
      console.log(`   ✅ Admin user verified:`);
      console.log(`      ID: ${admin.id}`);
      console.log(`      Username: ${admin.username}`);
      console.log(`      Email: ${admin.email}`);
      console.log(`      Role: ${admin.role}\n`);
    }

    // Step 16: Count remaining data
    console.log('1️⃣6️⃣  Final data summary:');
    const usersCount = await client.query('SELECT COUNT(*) FROM users');
    const interviewCount = await client.query('SELECT COUNT(*) FROM interview_requests');
    const commentCount = await client.query('SELECT COUNT(*) FROM interview_comments');
    const notifCount = await client.query('SELECT COUNT(*) FROM device_notifications');
    const todoCount = await client.query('SELECT COUNT(*) FROM todo_lists');
    
    console.log(`   Users remaining: ${usersCount.rows[0].count}`);
    console.log(`   Interview requests remaining: ${interviewCount.rows[0].count}`);
    console.log(`   Interview comments remaining: ${commentCount.rows[0].count}`);
    console.log(`   Device notifications: ${notifCount.rows[0].count}`);
    console.log(`   Todo lists: ${todoCount.rows[0].count}\n`);

    console.log('='.repeat(80));
    console.log('\n✨ Cleanup completed successfully!');
    console.log('   - All interview data deleted');
    console.log('   - All notifications and feedback deleted');
    console.log('   - All non-admin users deleted');
    console.log('   - Admin account preserved for login\n');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
