import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

// Generate random data for 5 years (2019-2024)
const startDate = new Date('2019-01-01');
const endDate = new Date('2024-12-31');

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

const priorities = ['low', 'medium', 'high', 'urgent'];
const statuses = ['pending', 'in_progress', 'completed', 'cancelled'];

async function generateAdditionalData() {
  console.log('🚀 Generating additional test data for existing users...');
  
  try {
    // Get existing user IDs
    const users = await sql`SELECT id FROM users`;
    const userIds = users.map(u => u.id);
    console.log(`📊 Working with ${userIds.length} existing users`);

    // 1. Generate Todo Lists (2000 lists)
    console.log('📝 Generating 2000 todo lists...');
    const todoTitles = [
      'Weekly Team Meeting', 'Project Review', 'Budget Planning', 'Security Audit',
      'Employee Training', 'System Maintenance', 'Client Presentation', 'Report Generation',
      'Performance Review', 'Strategic Planning', 'Risk Assessment', 'Compliance Check',
      'Data Analysis', 'Process Improvement', 'Quality Assurance', 'Team Building'
    ];
    
    const descriptions = [
      'Regular operational tasks and activities',
      'Important project milestone deliverables',
      'Critical business process requirements',
      'Routine administrative procedures'
    ];

    for (let i = 1; i <= 2000; i++) {
      const title = `${randomChoice(todoTitles)} - ${randomDate(startDate, endDate).getFullYear()}`;
      const description = randomChoice(descriptions);
      const priority = randomChoice(priorities);
      const createdBy = userIds[Math.floor(Math.random() * userIds.length)];
      const assignedTo = userIds[Math.floor(Math.random() * userIds.length)];
      const createdAt = randomDate(startDate, endDate);
      
      await sql`
        INSERT INTO todo_lists (title, description, created_by_id, assigned_to_id, priority, created_at)
        VALUES (${title}, ${description}, ${createdBy}, ${assignedTo}, ${priority}, ${createdAt.toISOString()})
      `;
      
      if (i % 200 === 0) console.log(`   Generated ${i}/2000 todo lists`);
    }
    console.log('✅ Todo lists generated successfully');

    // 2. Generate Todo Items (8000 items)
    console.log('📋 Generating 8000 todo items...');
    const allLists = await sql`SELECT id FROM todo_lists`;
    const listIds = allLists.map(l => l.id);
    
    const taskItems = [
      'Review documentation', 'Update database', 'Send email notifications',
      'Prepare presentation slides', 'Conduct interviews', 'Analyze data',
      'Write reports', 'Schedule meetings', 'Update project status',
      'Review budget allocation', 'Check system performance', 'Backup data'
    ];

    for (let i = 1; i <= 8000; i++) {
      const listId = listIds[Math.floor(Math.random() * listIds.length)];
      const title = randomChoice(taskItems);
      const description = `Detailed task description for ${title.toLowerCase()}`;
      const isCompleted = Math.random() > 0.3; // 70% completion rate
      const priority = randomChoice(priorities);
      const createdAt = randomDate(startDate, endDate);
      
      await sql`
        INSERT INTO todo_items (todo_list_id, title, description, is_completed, priority, created_at)
        VALUES (${listId}, ${title}, ${description}, ${isCompleted}, ${priority}, ${createdAt.toISOString()})
      `;
      
      if (i % 1000 === 0) console.log(`   Generated ${i}/8000 todo items`);
    }
    console.log('✅ Todo items generated successfully');

    // 3. Generate Interview Requests (1500 requests)
    console.log('🎯 Generating 1500 interview requests...');
    const interviewTypes = [
      'Performance Review', 'Disciplinary Meeting', 'Promotion Interview',
      'Exit Interview', 'Skill Assessment', 'Training Evaluation'
    ];

    for (let i = 1; i <= 1500; i++) {
      const requestedBy = userIds[Math.floor(Math.random() * userIds.length)];
      const managerId = userIds[Math.floor(Math.random() * userIds.length)];
      const position = randomChoice(interviewTypes);
      const candidateName = `Test Candidate ${i}`;
      const candidateEmail = `candidate${i}@test.com`;
      const description = `${position} scheduled for employee evaluation and development`;
      const status = randomChoice(['pending', 'scheduled', 'completed', 'cancelled']);
      const createdAt = randomDate(startDate, endDate);
      const proposedDateTime = new Date(createdAt.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000);
      
      await sql`
        INSERT INTO interview_requests (position, candidate_name, candidate_email, requested_by_id, manager_id, proposed_date_time, description, status, created_at)
        VALUES (${position}, ${candidateName}, ${candidateEmail}, ${requestedBy}, ${managerId}, ${proposedDateTime.toISOString()}, ${description}, ${status}, ${createdAt.toISOString()})
      `;
      
      if (i % 200 === 0) console.log(`   Generated ${i}/1500 interview requests`);
    }
    console.log('✅ Interview requests generated successfully');

    // 4. Generate Device Notifications (5000 notifications)
    console.log('🔔 Generating 5000 device notifications...');
    const notificationTypes = ['user_activity', 'system_alert', 'task_reminder', 'general', 'security', 'update'];
    const notificationTitles = [
      'System Maintenance Scheduled', 'New Task Assigned', 'Meeting Reminder',
      'Security Alert', 'Data Backup Complete', 'Performance Report Ready',
      'User Login Detected', 'Password Expiry Warning', 'System Update Available'
    ];

    for (let i = 1; i <= 5000; i++) {
      const userId = userIds[Math.floor(Math.random() * userIds.length)];
      const type = randomChoice(notificationTypes);
      const title = randomChoice(notificationTitles);
      const message = `System notification: ${title.toLowerCase()}`;
      const priority = randomChoice(['low', 'normal', 'high']);
      const isRead = Math.random() > 0.4; // 60% read rate
      const createdAt = randomDate(startDate, endDate);
      
      await sql`
        INSERT INTO device_notifications (user_id, type, title, message, priority, is_read, created_at)
        VALUES (${userId}, ${type}, ${title}, ${message}, ${priority}, ${isRead}, ${createdAt.toISOString()})
      `;
      
      if (i % 500 === 0) console.log(`   Generated ${i}/5000 notifications`);
    }
    console.log('✅ Device notifications generated successfully');

    // Generate final statistics
    console.log('\n📈 Generating final statistics...');
    const stats = await sql`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE status = 'active') as active_users,
        (SELECT COUNT(*) FROM todo_lists) as total_todo_lists,
        (SELECT COUNT(*) FROM todo_items) as total_todo_items,
        (SELECT COUNT(*) FROM todo_items WHERE is_completed = true) as completed_items,
        (SELECT COUNT(*) FROM interview_requests) as total_interviews,
        (SELECT COUNT(*) FROM device_notifications) as total_notifications,
        (SELECT COUNT(*) FROM device_notifications WHERE is_read = true) as read_notifications
    `;

    console.log('\n🎉 TEST DATA GENERATION COMPLETE!');
    console.log('═══════════════════════════════════');
    console.log(`👥 Users: ${stats[0].total_users} (${stats[0].active_users} active)`);
    console.log(`📝 Todo Lists: ${stats[0].total_todo_lists}`);
    console.log(`📋 Todo Items: ${stats[0].total_todo_items} (${stats[0].completed_items} completed)`);
    console.log(`🎯 Interview Requests: ${stats[0].total_interviews}`);
    console.log(`🔔 Notifications: ${stats[0].total_notifications} (${stats[0].read_notifications} read)`);
    console.log('═══════════════════════════════════');
    console.log('🚀 Ready for performance testing!');

  } catch (error) {
    console.error('❌ Error generating test data:', error);
    throw error;
  }
}

// Run the data generation
generateAdditionalData()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });