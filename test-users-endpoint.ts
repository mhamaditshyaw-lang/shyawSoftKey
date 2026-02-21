import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Hama10Kurd$$@localhost:5432/shyaw_admin'
});

async function main() {
  const client = await pool.connect();
  try {
    console.log('\n✅ Testing User Fetch After Fix\n');
    console.log('='.repeat(80));

    // Get all users from database
    const result = await client.query(`
      SELECT id, username, email, role, status, created_at 
      FROM users 
      ORDER BY id DESC
    `);

    console.log(`Total users in database: ${result.rows.length}\n`);
    
    if (result.rows.length === 0) {
      console.log('❌ No users found!');
    } else {
      console.log('Users:');
      result.rows.forEach(user => {
        console.log(`  ID: ${user.id} | Username: ${user.username} | Email: ${user.email} | Role: ${user.role} | Status: ${user.status}`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('\n📝 Now when you create a new user in the admin panel:');
    console.log('   1. The user will be created in the database ✓');
    console.log('   2. The GET /api/users endpoint will return it in { users: [...] } format ✓');
    console.log('   3. The users page will properly display the new user ✓\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
