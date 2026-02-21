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
    console.log('Connected to DB, altering weekly_meeting_tasks for created_by_id...');

    const sql = `BEGIN;
-- Add column if missing (allow null initially)
ALTER TABLE weekly_meeting_tasks ADD COLUMN IF NOT EXISTS created_by_id integer;

-- For existing rows set a sane default (admin user id 1) where missing
UPDATE weekly_meeting_tasks SET created_by_id = 1 WHERE created_by_id IS NULL;

-- Make column NOT NULL
ALTER TABLE weekly_meeting_tasks ALTER COLUMN created_by_id SET NOT NULL;

-- Add FK constraint if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'weekly_meeting_tasks_created_by_id_users_id_fk') THEN
    ALTER TABLE weekly_meeting_tasks
      ADD CONSTRAINT weekly_meeting_tasks_created_by_id_users_id_fk
      FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END
$$;
COMMIT;`;

    await client.query(sql);
    console.log('Alteration complete.');
    const res = await client.query("SELECT column_name, is_nullable FROM information_schema.columns WHERE table_name = 'weekly_meeting_tasks' ORDER BY ordinal_position;");
    console.log('Columns now:', JSON.stringify(res.rows, null, 2));
  } catch (e) {
    console.error('Failed to alter table:', e.message || e);
    process.exit(1);
  } finally {
    await client.end();
  }
})();
