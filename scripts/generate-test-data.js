import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcrypt';

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

// Sample data arrays
const firstNames = ['Ahmad', 'Sara', 'Omar', 'Fatima', 'Ali', 'Zara', 'Hassan', 'Layla', 'Karim', 'Noor', 'Yasmin', 'Tariq', 'Amina', 'Khalid', 'Rania'];
const lastNames = ['Abdullah', 'Hassan', 'Ahmed', 'Mohammad', 'Ali', 'Ibrahim', 'Mahmoud', 'Yusuf', 'Saleh', 'Omar', 'Farid', 'Nasser', 'Said', 'Rashid', 'Qasim'];
const departments = ['HR', 'IT', 'Finance', 'Operations', 'Security', 'Administration', 'Marketing', 'Sales', 'Development', 'Support'];
const positions = ['Manager', 'Analyst', 'Specialist', 'Coordinator', 'Assistant', 'Lead', 'Senior', 'Junior', 'Executive', 'Director'];
const roles = ['admin', 'manager', 'security'];
const priorities = ['low', 'medium', 'high', 'urgent'];
const statuses = ['pending', 'in_progress', 'completed', 'cancelled'];

async function generateTestData() {
  console.log('🚀 Starting test data generation for 5 years...');
  
  try {
    // Get existing user IDs first
    const existingUsers = await sql`SELECT id FROM users ORDER BY id`;
    const startingUserId = existingUsers.length > 0 ? Math.max(...existingUsers.map(u => u.id)) + 1 : 1;
    console.log(`Starting user generation from ID: ${startingUserId}`);
    
    // 1. Generate Users (500 users over 5 years)
    console.log('📊 Generating 500 users...');
    const users = [];
    for (let i = 1; i <= 500; i++) {
      const firstName = randomChoice(firstNames);
      const lastName = randomChoice(lastNames);
      const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${i}`;
      const email = `${username}@shyaw.com`;
      const role = randomChoice(roles);
      const department = randomChoice(departments);
      const position = randomChoice(positions);
      const createdAt = randomDate(startDate, endDate);
      
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      users.push({
        username,
        email,
        password: hashedPassword,
        role,
        firstName,
        lastName,
        department,
        position,
        isActive: Math.random() > 0.1, // 90% active
        createdAt
      });
    }
    
    // Insert users in batches
    for (let i = 0; i < users.length; i += 50) {
      const batch = users.slice(i, i + 50);
      for (const user of batch) {
        await sql`
          INSERT INTO users (username, email, password, role, first_name, last_name, status, created_at)
          VALUES (${user.username}, ${user.email}, ${user.password}, ${user.role}, ${user.firstName}, ${user.lastName}, ${user.isActive ? 'active' : 'inactive'}, ${user.createdAt.toISOString()})
        `;
      }
    }
    console.log('✅ Users generated successfully');

    // 2. Generate Todo Lists (2000 lists over 5 years)
    console.log('📝 Generating 2000 todo lists...');
    const todoTitles = [
      'Weekly Team Meeting', 'Project Review', 'Budget Planning', 'Security Audit',
      'Employee Training', 'System Maintenance', 'Client Presentation', 'Report Generation',
      'Performance Review', 'Strategic Planning', 'Risk Assessment', 'Compliance Check',
      'Data Analysis', 'Process Improvement', 'Quality Assurance', 'Team Building',
      'Resource Allocation', 'Timeline Review', 'Cost Analysis', 'Market Research'
    ];
    
    const descriptions = [
      'Regular operational tasks and activities',
      'Important project milestone deliverables',
      'Critical business process requirements',
      'Routine administrative procedures',
      'Strategic planning and development activities',
      'Quality control and assurance measures',
      'Team coordination and communication tasks',
      'Performance monitoring and evaluation'
    ];

    for (let i = 1; i <= 2000; i++) {
      const title = `${randomChoice(todoTitles)} - ${randomDate(startDate, endDate).getFullYear()}`;
      const description = randomChoice(descriptions);
      const priority = randomChoice(priorities);
      const status = randomChoice(statuses);
      const createdAt = randomDate(startDate, endDate);
      const dueDate = new Date(createdAt.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000); // Within 30 days
      
      // Get valid user IDs for foreign key constraints
      const allUsers = await sql`SELECT id FROM users`;
      const userIds = allUsers.map(u => u.id);
      const createdBy = userIds[Math.floor(Math.random() * userIds.length)];
      const assignedTo = userIds[Math.floor(Math.random() * userIds.length)];
      
      await sql`
        INSERT INTO todo_lists (title, description, created_by_id, assigned_to_id, priority, created_at)
        VALUES (${title}, ${description}, ${createdBy}, ${assignedTo}, ${priority}, ${createdAt.toISOString()})
      `;
      
      if (i % 100 === 0) console.log(`   Generated ${i}/2000 todo lists`);
    }
    console.log('✅ Todo lists generated successfully');

    // 3. Generate Todo Items (8000 items for the lists)
    console.log('📋 Generating 8000 todo items...');
    const taskItems = [
      'Review documentation', 'Update database', 'Send email notifications',
      'Prepare presentation slides', 'Conduct interviews', 'Analyze data',
      'Write reports', 'Schedule meetings', 'Update project status',
      'Review budget allocation', 'Check system performance', 'Backup data',
      'Test new features', 'Deploy updates', 'Monitor security',
      'Train new employees', 'Update procedures', 'Review contracts',
      'Coordinate with vendors', 'Evaluate performance metrics'
    ];

    for (let i = 1; i <= 8000; i++) {
      // Get valid todo list IDs
      const allLists = await sql`SELECT id FROM todo_lists`;
      if (allLists.length === 0) continue; // Skip if no lists exist yet
      const listIds = allLists.map(l => l.id);
      const listId = listIds[Math.floor(Math.random() * listIds.length)];
      const title = randomChoice(taskItems);
      const description = `Detailed task description for ${title.toLowerCase()}`;
      const completed = Math.random() > 0.3; // 70% completion rate
      const createdAt = randomDate(startDate, endDate);
      
      await sql`
        INSERT INTO todo_items (todo_list_id, title, description, is_completed, priority, created_at)
        VALUES (${listId}, ${title}, ${description}, ${completed}, ${randomChoice(priorities)}, ${createdAt.toISOString()})
      `;
      
      if (i % 500 === 0) console.log(`   Generated ${i}/8000 todo items`);
    }
    console.log('✅ Todo items generated successfully');

    // 4. Generate Interview Requests (1500 requests over 5 years)
    console.log('🎯 Generating 1500 interview requests...');
    const interviewTypes = [
      'Performance Review', 'Disciplinary Meeting', 'Promotion Interview',
      'Exit Interview', 'Skill Assessment', 'Training Evaluation',
      'Project Feedback', 'Career Development', 'Complaint Investigation',
      'Recognition Meeting', 'Goal Setting', 'Progress Review'
    ];

    for (let i = 1; i <= 1500; i++) {
      // Get valid user IDs for foreign key constraints
      const allUsers = await sql`SELECT id FROM users`;
      const userIds = allUsers.map(u => u.id);
      const requestedBy = userIds[Math.floor(Math.random() * userIds.length)];
      const managerId = userIds[Math.floor(Math.random() * userIds.length)];
      const type = randomChoice(interviewTypes);
      const description = `${type} scheduled for employee evaluation and development`;
      const status = randomChoice(['pending', 'scheduled', 'completed', 'cancelled']);
      const priority = randomChoice(priorities);
      const createdAt = randomDate(startDate, endDate);
      const scheduledAt = new Date(createdAt.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000);
      
      await sql`
        INSERT INTO interview_requests (position, candidate_name, candidate_email, requested_by_id, manager_id, proposed_date_time, description, status, created_at)
        VALUES (${type}, 'Test Candidate ${i}', 'candidate${i}@test.com', ${requestedBy}, ${managerId}, ${scheduledAt.toISOString()}, ${description}, ${status}, ${createdAt.toISOString()})
      `;
      
      if (i % 200 === 0) console.log(`   Generated ${i}/1500 interview requests`);
    }
    console.log('✅ Interview requests generated successfully');

    // 5. Generate Device Notifications (5000 notifications over 5 years)
    console.log('🔔 Generating 5000 device notifications...');
    const notificationTypes = ['user_activity', 'system_alert', 'task_reminder', 'general', 'security', 'update'];
    const notificationTitles = [
      'System Maintenance Scheduled', 'New Task Assigned', 'Meeting Reminder',
      'Security Alert', 'Data Backup Complete', 'Performance Report Ready',
      'User Login Detected', 'Password Expiry Warning', 'System Update Available',
      'Project Deadline Approaching', 'New Employee Added', 'Budget Alert'
    ];

    for (let i = 1; i <= 5000; i++) {
      // Get valid user IDs for foreign key constraints
      const allUsers = await sql`SELECT id FROM users`;
      const userIds = allUsers.map(u => u.id);
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

    // Generate summary statistics
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
generateTestData()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });