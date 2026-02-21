const { Client } = require('pg');
(async () => {
  try {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'weekly_meeting_tasks' ORDER BY ordinal_position;");
    console.log(JSON.stringify(res.rows, null, 2));
    await client.end();
  } catch (e) {
    console.error('ERROR', e.message || e);
    process.exit(1);
  }
})();
