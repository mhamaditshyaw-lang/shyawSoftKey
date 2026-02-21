import { db } from "./server/db";
import { operationalData, users } from "@shared/schema";

async function seedOperationalData() {
  try {
    console.log("🌱 Seeding operational data...");

    // Get admin user
    const adminUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.role, 'admin'),
    });

    if (!adminUser) {
      console.error("❌ Admin user not found!");
      process.exit(1);
    }

    console.log(`📝 Using admin user: ${adminUser.username} (ID: ${adminUser.id})`);

    // Create sample operational data entries
    const sampleEntries = [
      {
        type: "staffCount",
        data: {
          "Total employees today": 45,
          "Permanent employees": 35,
          "Non-permanent employees": 10,
        },
        stats: {
          total: 45,
          average: 45,
          max: 45,
          min: 45,
        },
        createdById: adminUser.id,
      },
      {
        type: "operations",
        data: {
          "Day - Start of work": 7,
          "Day - Giving up": 3,
          "Night - Start of work": 8,
          "Night - Giving up": 2,
        },
        stats: {
          total: 20,
          average: 5,
          max: 8,
          min: 2,
        },
        createdById: adminUser.id,
      },
      {
        type: "yesterdayProduction",
        data: {
          "Day - Ice cream": 150,
          "Night - Ice cream": 120,
          "Day - Albany": 80,
          "Night - Albany": 95,
          "Day - Do": 60,
          "Night - Do": 70,
        },
        stats: {
          total: 575,
          average: 95.8,
          max: 150,
          min: 60,
        },
        createdById: adminUser.id,
      },
      {
        type: "yesterdayLoading",
        data: {
          "Ice cream / Loading vehicles": 5,
          "Albany / Loading vehicles": 3,
          "Do / Loading vehicles": 2,
          "VEHICLE 1 (TONS)": 25,
          "VEHICLE 2 (TONS)": 30,
          "VEHICLE 3 (TONS)": 22,
        },
        stats: {
          total: 87,
          average: 14.5,
          max: 30,
          min: 2,
        },
        createdById: adminUser.id,
      },
      {
        type: "employee",
        data: {
          "HEAD INSERT NAME": "Ahmed Mohamed",
          "Total employees today": 45,
          "Permanent employees": 35,
        },
        stats: {
          total: 80,
          average: 40,
          max: 45,
          min: 35,
        },
        createdById: adminUser.id,
      },
    ];

    // Insert the data
    const result = await db.insert(operationalData).values(sampleEntries);
    console.log(`✅ Successfully inserted ${sampleEntries.length} operational data entries`);

    console.log("\n📊 Inserted entries:");
    sampleEntries.forEach((entry, index) => {
      console.log(`  ${index + 1}. ${entry.type} - ${Object.keys(entry.data).length} fields`);
    });

    console.log("\n✨ Data seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding operational data:", error);
    process.exit(1);
  }
}

seedOperationalData();
