import { db } from "./server/db";
import { operationalData } from "./shared/schema";
import { sql } from "drizzle-orm";

async function updateDatesToToday() {
  try {
    console.log("Updating all operational data to today's date...");
    
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Also get current time for reference
    const now = new Date();
    
    // Update all entries to have today's date
    // Keep the time part but change the date
    const result = await db
      .update(operationalData)
      .set({
        createdAt: now,
      })
      .returning();
    
    console.log(`Updated ${result.length} entries to ${now.toLocaleString()}`);
    console.log("Sample entries:");
    result.slice(0, 3).forEach((entry, idx) => {
      console.log(`  ${idx + 1}. Type: ${entry.type}, CreatedAt: ${entry.createdAt}`);
    });
    
  } catch (error) {
    console.error("Error updating data:", error);
  }

  process.exit(0);
}

updateDatesToToday();
