require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

(async ()=>{
  const sqlPath = path.resolve(__dirname, '..', 'migrations', '0004_users_role_enum_safe.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try{
    await client.connect();
    console.log('Applying migration 0004...');
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('Migration applied successfully');
    await client.end();
  }catch(err){
    console.error('Migration error:', err.message || err);
    try{ await client.query('ROLLBACK'); }catch(e){}
    process.exit(1);
  }
})();
