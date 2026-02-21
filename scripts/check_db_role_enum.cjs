require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const { Client } = require('pg');
(async ()=>{
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try{
    await client.connect();
    const res = await client.query("SELECT e.enumlabel FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'role' ORDER BY e.enumsortorder;");
    if(res.rows.length===0){
      console.log('DB role enum does not exist or has no labels');
    }else{
      console.log('db_role_enum=', res.rows.map(r=>r.enumlabel));
    }
    await client.end();
  }catch(err){
    console.error('ERR', err.message || err);
    process.exit(1);
  }
})();
