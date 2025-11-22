import { db } from "./server/db";
import { users, todoLists, todoItems, interviewRequests } from "./shared/complete-schema";
import bcrypt from "bcrypt";

async function seedDatabase() {
  console.log("🌱 Starting database seeding...\n");

  try {
    // Create users
    console.log("👥 Creating users...");
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    const createdUsers = await db
      .insert(users)
      .values([
        {
          username: "admin",
          email: "admin@shyaw.com",
          password: await bcrypt.hash("admin123", 10),
          firstName: "System",
          lastName: "Administrator",
          role: "admin",
          status: "active",
          department: "Management",
          position: "System Admin",
        },
        {
          username: "manager1",
          email: "manager1@shyaw.com",
          password: hashedPassword,
          firstName: "Ahmed",
          lastName: "Hassan",
          role: "manager",
          status: "active",
          department: "HR",
          position: "HR Manager",
        },
        {
          username: "employee1",
          email: "employee1@shyaw.com",
          password: hashedPassword,
          firstName: "Fatima",
          lastName: "Ali",
          role: "employee",
          status: "active",
          department: "HR",
          position: "HR Officer",
          managerId: 2,
        },
        {
          username: "employee2",
          email: "employee2@shyaw.com",
          password: hashedPassword,
          firstName: "Omar",
          lastName: "Mohammed",
          role: "employee",
          status: "active",
          department: "HR",
          position: "Recruiter",
          managerId: 2,
        },
        {
          username: "security1",
          email: "security1@shyaw.com",
          password: hashedPassword,
          firstName: "Jamal",
          lastName: "Ibrahim",
          role: "security",
          status: "active",
          department: "Security",
          position: "Security Officer",
        },
        {
          username: "office1",
          email: "office1@shyaw.com",
          password: hashedPassword,
          firstName: "Layla",
          lastName: "Mustafa",
          role: "office",
          status: "active",
          department: "Administration",
          position: "Office Manager",
        },
      ])
      .returning();

    console.log(`✅ Created ${createdUsers.length} users\n`);

    // Create todo lists
    console.log("📋 Creating todo lists...");
    const createdTodoLists = await db
      .insert(todoLists)
      .values([
        {
          title: "Onboarding New Employees",
          description: "Process for onboarding new staff members",
          createdById: createdUsers[1].id, // manager1
          assignedToId: createdUsers[2].id, // employee1
          priority: "high",
        },
        {
          title: "Performance Reviews Q4",
          description: "Conduct performance reviews for all team members",
          createdById: createdUsers[1].id, // manager1
          assignedToId: createdUsers[3].id, // employee2
          priority: "high",
        },
        {
          title: "Document System Updates",
          description: "Update documentation for recent system changes",
          createdById: createdUsers[0].id, // admin
          assignedToId: createdUsers[5].id, // office1
          priority: "medium",
        },
        {
          title: "Security Audit",
          description: "Conduct quarterly security audit",
          createdById: createdUsers[4].id, // security1
          priority: "urgent",
        },
      ])
      .returning();

    console.log(`✅ Created ${createdTodoLists.length} todo lists\n`);

    // Create todo items
    console.log("📝 Creating todo items...");
    const createdTodoItems = await db
      .insert(todoItems)
      .values([
        {
          todoListId: createdTodoLists[0].id,
          title: "Prepare onboarding materials",
          description: "Gather all required documents and training materials",
          priority: "high",
          isCompleted: false,
        },
        {
          todoListId: createdTodoLists[0].id,
          title: "Schedule orientation session",
          description: "Book meeting room and send invitations",
          priority: "high",
          isCompleted: true,
          completedAt: new Date(),
        },
        {
          todoListId: createdTodoLists[1].id,
          title: "Review performance metrics",
          description: "Analyze KPIs and achievements",
          priority: "high",
          isCompleted: false,
        },
        {
          todoListId: createdTodoLists[1].id,
          title: "Conduct one-on-one meetings",
          description: "Schedule and complete individual reviews",
          priority: "high",
          isCompleted: false,
        },
        {
          todoListId: createdTodoLists[2].id,
          title: "Update API documentation",
          description: "Document new endpoints and changes",
          priority: "medium",
          isCompleted: false,
        },
        {
          todoListId: createdTodoLists[3].id,
          title: "Check system vulnerabilities",
          description: "Run security scanning tools",
          priority: "urgent",
          isCompleted: false,
        },
        {
          todoListId: createdTodoLists[3].id,
          title: "Review access logs",
          description: "Audit user access and permissions",
          priority: "urgent",
          isCompleted: false,
        },
      ])
      .returning();

    console.log(`✅ Created ${createdTodoItems.length} todo items\n`);

    // Create interview requests
    console.log("🎤 Creating interview requests...");
    const createdInterviews = await db
      .insert(interviewRequests)
      .values([
        {
          position: "Senior HR Specialist",
          candidateName: "Sarah Johnson",
          candidateEmail: "sarah.johnson@email.com",
          requestedById: createdUsers[1].id, // manager1
          managerId: createdUsers[1].id,
          proposedDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          duration: 60,
          description: "Interview for Senior HR Specialist position",
          status: "pending",
        },
        {
          position: "IT Coordinator",
          candidateName: "Michael Chen",
          candidateEmail: "michael.chen@email.com",
          requestedById: createdUsers[0].id, // admin
          managerId: createdUsers[1].id,
          proposedDateTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          duration: 45,
          description: "Interview for IT Coordinator position",
          status: "pending",
        },
        {
          position: "Office Assistant",
          candidateName: "Amina Al-Rashid",
          candidateEmail: "amina.alrashid@email.com",
          requestedById: createdUsers[5].id, // office1
          managerId: createdUsers[1].id,
          proposedDateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
          duration: 30,
          description: "Interview for Office Assistant position",
          status: "approved",
        },
      ])
      .returning();

    console.log(`✅ Created ${createdInterviews.length} interview requests\n`);

    console.log("✨ Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   • Users: ${createdUsers.length}`);
    console.log(`   • Todo Lists: ${createdTodoLists.length}`);
    console.log(`   • Todo Items: ${createdTodoItems.length}`);
    console.log(`   • Interview Requests: ${createdInterviews.length}`);
    console.log("\n🔑 You can now login with:");
    console.log("   Admin: admin / admin123");
    console.log("   Manager: manager1 / password123");
    console.log("   Employee: employee1 / password123");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
