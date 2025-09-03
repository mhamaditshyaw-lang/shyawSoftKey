import pg from 'pg';

const { Pool } = pg;

async function testRawConnection() {
  console.log('🔧 Testing raw PostgreSQL connection...');
  
  const connectionString = process.env.DATABASE_URL;
  console.log('Connection string prefix:', connectionString?.substring(0, 30) + '...');
  
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false } // Neon requires SSL
  });
  
  try {
    console.log('📡 Attempting connection...');
    const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('✅ Connection successful!');
    console.log('Current time:', result.rows[0].current_time);
    console.log('PostgreSQL version:', result.rows[0].pg_version?.substring(0, 50) + '...');
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error code:', error.code);
    return false;
  } finally {
    await pool.end();
  }
}

testRawConnection().then(success => {
  process.exit(success ? 0 : 1);
});