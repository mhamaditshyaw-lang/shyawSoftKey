
const { db } = require("../server/db");
const { todoLists, todoItems, users } = require("../shared/schema");
const { eq } = require("drizzle-orm");

async function seedOfficeTodoData() {
  console.log("🏢 Seeding office team todo data...");

  try {
    // Get office team users
    const officeUsers = await db.select().from(users).where(eq(users.role, 'office_team'));
    const adminUsers = await db.select().from(users).where(eq(users.role, 'admin'));
    
    if (officeUsers.length === 0) {
      console.log("No office team users found. Creating sample office team user...");
      
      // Create a sample office team user
      const [newOfficeUser] = await db.insert(users).values({
        username: "office_manager",
        email: "office@company.com",
        password: "$2b$12$9xqZ8mKfX5bQ4nP2yE7dUe8wR6vT3sG9mL4jH1cA5xF2dS8pK7qN0", // password123
        firstName: "Office",
        lastName: "Manager",
        role: "office_team",
        status: "active",
        department: "Administration",
        position: "Office Manager"
      }).returning();
      
      officeUsers.push(newOfficeUser);
    }

    const officeUser = officeUsers[0];
    const adminUser = adminUsers.length > 0 ? adminUsers[0] : officeUser;

    // Office Administrative Tasks
    const [adminTodoList] = await db.insert(todoLists).values({
      title: "Daily Administrative Tasks",
      description: "Essential daily operations for office management",
      createdById: adminUser.id,
      assignedToId: officeUser.id,
      priority: "high"
    }).returning();

    await db.insert(todoItems).values([
      {
        todoListId: adminTodoList.id,
        title: "Review and process incoming mail",
        description: "Sort, distribute, and handle all incoming correspondence",
        priority: "high",
        isCompleted: false
      },
      {
        todoListId: adminTodoList.id,
        title: "Update employee attendance records",
        description: "Verify and update daily attendance in the system",
        priority: "medium",
        isCompleted: true
      },
      {
        todoListId: adminTodoList.id,
        title: "Prepare daily operational reports",
        description: "Compile and distribute daily status reports to management",
        priority: "high",
        isCompleted: false
      },
      {
        todoListId: adminTodoList.id,
        title: "Coordinate with department heads",
        description: "Schedule and conduct brief check-ins with all department managers",
        priority: "medium",
        isCompleted: false
      },
      {
        todoListId: adminTodoList.id,
        title: "Manage office supplies inventory",
        description: "Check stock levels and place orders for office supplies",
        priority: "low",
        isCompleted: true
      }
    ]);

    // Weekly Planning Tasks
    const [weeklyTodoList] = await db.insert(todoLists).values({
      title: "Weekly Planning & Coordination",
      description: "Strategic planning and coordination tasks for the week",
      createdById: officeUser.id,
      assignedToId: officeUser.id,
      priority: "medium"
    }).returning();

    await db.insert(todoItems).values([
      {
        todoListId: weeklyTodoList.id,
        title: "Schedule team meetings for next week",
        description: "Coordinate availability and book meeting rooms for all departments",
        priority: "high",
        isCompleted: false
      },
      {
        todoListId: weeklyTodoList.id,
        title: "Review and update project timelines",
        description: "Work with project managers to assess progress and adjust schedules",
        priority: "medium",
        isCompleted: false
      },
      {
        todoListId: weeklyTodoList.id,
        title: "Prepare weekly budget reports",
        description: "Compile departmental expenses and budget utilization reports",
        priority: "high",
        isCompleted: false
      },
      {
        todoListId: weeklyTodoList.id,
        title: "Conduct facility maintenance checks",
        description: "Inspect office equipment and coordinate any necessary repairs",
        priority: "medium",
        isCompleted: true
      },
      {
        todoListId: weeklyTodoList.id,
        title: "Update company policies documentation",
        description: "Review and revise employee handbook and policy documents",
        priority: "low",
        isCompleted: false
      },
      {
        todoListId: weeklyTodoList.id,
        title: "Organize vendor contract renewals",
        description: "Review expiring contracts and initiate renewal processes",
        priority: "medium",
        isCompleted: false
      }
    ]);

    // HR Support Tasks
    const [hrTodoList] = await db.insert(todoLists).values({
      title: "HR Support & Employee Relations",
      description: "Human resources support and employee management tasks",
      createdById: officeUser.id,
      assignedToId: officeUser.id,
      priority: "high"
    }).returning();

    await db.insert(todoItems).values([
      {
        todoListId: hrTodoList.id,
        title: "Process new employee onboarding",
        description: "Prepare documentation and schedule orientation for new hires",
        priority: "high",
        isCompleted: false
      },
      {
        todoListId: hrTodoList.id,
        title: "Update employee benefits information",
        description: "Distribute updated benefits packages and enrollment forms",
        priority: "medium",
        isCompleted: false
      },
      {
        todoListId: hrTodoList.id,
        title: "Conduct employee satisfaction surveys",
        description: "Prepare and distribute quarterly satisfaction questionnaires",
        priority: "medium",
        isCompleted: true
      },
      {
        todoListId: hrTodoList.id,
        title: "Coordinate performance review meetings",
        description: "Schedule and prepare materials for quarterly performance reviews",
        priority: "high",
        isCompleted: false
      },
      {
        todoListId: hrTodoList.id,
        title: "Maintain employee records database",
        description: "Update and organize digital and physical employee files",
        priority: "medium",
        isCompleted: true
      }
    ]);

    // Financial Administration
    const [financeTodoList] = await db.insert(todoLists).values({
      title: "Financial Administration & Records",
      description: "Financial oversight and administrative record keeping",
      createdById: adminUser.id,
      assignedToId: officeUser.id,
      priority: "high"
    }).returning();

    await db.insert(todoItems).values([
      {
        todoListId: financeTodoList.id,
        title: "Process invoice approvals",
        description: "Review and approve pending vendor invoices and expense reports",
        priority: "high",
        isCompleted: false
      },
      {
        todoListId: financeTodoList.id,
        title: "Reconcile monthly departmental budgets",
        description: "Compare actual spending against budget allocations for each department",
        priority: "high",
        isCompleted: false
      },
      {
        todoListId: financeTodoList.id,
        title: "Prepare tax documentation",
        description: "Organize and prepare quarterly tax filings and supporting documents",
        priority: "medium",
        isCompleted: true
      },
      {
        todoListId: financeTodoList.id,
        title: "Update financial reporting dashboards",
        description: "Refresh financial KPIs and performance metrics in reporting systems",
        priority: "medium",
        isCompleted: false
      },
      {
        todoListId: financeTodoList.id,
        title: "Audit expense reimbursements",
        description: "Review and process employee expense reimbursement requests",
        priority: "low",
        isCompleted: true
      }
    ]);

    // Technology & Systems Management
    const [techTodoList] = await db.insert(todoLists).values({
      title: "Technology & Systems Support",
      description: "IT coordination and office technology management",
      createdById: officeUser.id,
      assignedToId: officeUser.id,
      priority: "medium"
    }).returning();

    await db.insert(todoItems).values([
      {
        todoListId: techTodoList.id,
        title: "Coordinate software license renewals",
        description: "Track expiring software licenses and arrange renewals",
        priority: "medium",
        isCompleted: false
      },
      {
        todoListId: techTodoList.id,
        title: "Schedule IT equipment maintenance",
        description: "Arrange routine maintenance for servers, printers, and office equipment",
        priority: "medium",
        isCompleted: false
      },
      {
        todoListId: techTodoList.id,
        title: "Update cybersecurity protocols",
        description: "Review and implement latest cybersecurity best practices",
        priority: "high",
        isCompleted: true
      },
      {
        todoListId: techTodoList.id,
        title: "Manage user access permissions",
        description: "Review and update employee system access based on role changes",
        priority: "high",
        isCompleted: false
      },
      {
        todoListId: techTodoList.id,
        title: "Organize digital file archives",
        description: "Implement file organization system and backup procedures",
        priority: "low",
        isCompleted: false
      }
    ]);

    // Client Relations & Communication
    const [clientTodoList] = await db.insert(todoLists).values({
      title: "Client Relations & External Communication",
      description: "Managing client relationships and external communications",
      createdById: officeUser.id,
      assignedToId: officeUser.id,
      priority: "high"
    }).returning();

    await db.insert(todoItems).values([
      {
        todoListId: clientTodoList.id,
        title: "Prepare client meeting materials",
        description: "Compile presentations, reports, and documentation for client meetings",
        priority: "high",
        isCompleted: false
      },
      {
        todoListId: clientTodoList.id,
        title: "Update client contact database",
        description: "Verify and update client contact information and communication preferences",
        priority: "medium",
        isCompleted: true
      },
      {
        todoListId: clientTodoList.id,
        title: "Coordinate marketing material distribution",
        description: "Organize and distribute promotional materials to clients and prospects",
        priority: "medium",
        isCompleted: false
      },
      {
        todoListId: clientTodoList.id,
        title: "Schedule client satisfaction calls",
        description: "Arrange follow-up calls with recent clients to gather feedback",
        priority: "medium",
        isCompleted: false
      },
      {
        todoListId: clientTodoList.id,
        title: "Manage social media communications",
        description: "Update company social media profiles and respond to inquiries",
        priority: "low",
        isCompleted: true
      }
    ]);

    console.log("✅ Office team todo data seeded successfully!");
    console.log(`Created ${6} todo lists with comprehensive tasks for office team operations`);
    
  } catch (error) {
    console.error("❌ Error seeding office todo data:", error);
  }
}

if (require.main === module) {
  seedOfficeTodoData().then(() => {
    console.log("Seeding complete!");
    process.exit(0);
  }).catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
}

module.exports = { seedOfficeTodoData };
