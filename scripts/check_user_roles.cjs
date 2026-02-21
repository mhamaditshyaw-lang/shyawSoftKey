require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const { Client } = require('pg');
(async () => {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not found in environment');
    process.exit(1);
  }
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    const res = await client.query("SELECT DISTINCT role FROM users ORDER BY role;");
    console.log('roles=', JSON.stringify(res.rows.map(r=>r.role), null, 2));
    await client.end();
  } catch (e) {
    console.error('ERROR', e.message || e);
    try { await client.end(); } catch(_){}
    process.exit(1);
  }
})();
