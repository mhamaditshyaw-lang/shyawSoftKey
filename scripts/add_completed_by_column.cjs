require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const { Client } = require('pg');
(async () => {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set in .env');
    process.exit(1);
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    console.log('Connected to DB, altering table if needed...');
    const sql = `BEGIN;
ALTER TABLE weekly_meeting_tasks ADD COLUMN IF NOT EXISTS completed_by_id integer;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'weekly_meeting_tasks_completed_by_id_users_id_fk') THEN
    ALTER TABLE weekly_meeting_tasks
      ADD CONSTRAINT weekly_meeting_tasks_completed_by_id_users_id_fk
      FOREIGN KEY (completed_by_id) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END
$$;
COMMIT;`;
    await client.query(sql);
    console.log('Alteration complete.');
    // show final columns
    const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'weekly_meeting_tasks' ORDER BY ordinal_position;");
    console.log('Columns now:', res.rows.map(r=>r.column_name));
  } catch (e) {
    console.error('Failed to alter table:', e.message || e);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
