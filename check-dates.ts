import { db } from "./server/db";

async function checkDates() {
  try {
    const entries = await db.query.operationalData.findMany({
      with: { createdBy: true },
      limit: 10,
    });

    console.log("Total entries check:");
    const allEntries = await db.query.operationalData.findMany();
    console.log(`Total entries in DB: ${allEntries.length}`);

    console.log("\nFirst 10 entries dates:");
    entries.forEach((entry, idx) => {
      const date = new Date(entry.createdAt);
      console.log(`${idx + 1}. createdAt: ${entry.createdAt}`);
      console.log(`   Parsed: ${date.toLocaleString()}`);
      console.log(`   Date string (YYYY-MM-DD): ${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`);
      console.log(`   Today would be: ${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`);
      console.log("");
    });

    // Check if any entries match today
    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const todayMatches = allEntries.filter(e => {
      const d = new Date(e.createdAt);
      const dString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return dString === todayString;
    });

    console.log(`\nEntries matching today (${todayString}): ${todayMatches.length}`);
    if (todayMatches.length > 0) {
      console.log("Today's entries:");
      todayMatches.forEach((e, idx) => {
        console.log(`${idx + 1}. Type: ${e.type}, CreatedAt: ${e.createdAt}`);
      });
    }

  } catch (error) {
    console.error("Error:", error);
  }

  process.exit(0);
}

checkDates();
