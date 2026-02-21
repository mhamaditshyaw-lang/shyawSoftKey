import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Hama10Kurd$$@localhost:5432/shyaw_admin'
});

async function main() {
  const client = await pool.connect();
  try {
    console.log('\n🔍 Checking admin user...\n');
    
    const result = await client.query('SELECT id, username, email, role, created_at FROM users ORDER BY id');
    
    console.log('All users in database:');
    console.log('='.repeat(80));
    
    if (result.rows.length === 0) {
      console.log('❌ NO USERS FOUND IN DATABASE!');
    } else {
      result.rows.forEach(user => {
        console.log(`ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Role: ${user.role}`);
      });
    }
    
    console.log('='.repeat(80));
    console.log();
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
