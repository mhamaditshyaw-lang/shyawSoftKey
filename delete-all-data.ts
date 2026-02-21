import { db } from "./server/db";
import { operationalData } from "./shared/schema";

async function deleteAllData() {
  try {
    console.log("Deleting all operational data...");
    
    const result = await db.delete(operationalData).returning();
    
    console.log(`✅ Successfully deleted ${result.length} entries`);
    console.log("All operational data has been cleared.");
    
  } catch (error) {
    console.error("❌ Error deleting data:", error);
  }

  process.exit(0);
}

deleteAllData();
