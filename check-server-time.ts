import { db } from "./server/db";
import { sql } from "drizzle-orm";

async function checkServerTime() {
  try {
    // Get the server's current time
    const result = await db.execute(sql`SELECT NOW() as server_time`);
    console.log("Server time:", result);
    
    // Also get PC time
    console.log("PC time:", new Date());
  } catch (error) {
    console.error("Error:", error);
  }
  process.exit(0);
}

checkServerTime();
