import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Hama10Kurd$$@localhost:5432/shyaw_admin'
});

async function main() {
  const client = await pool.connect();
  try {
    console.log('\n🔐 Restoring admin user...\n');
    console.log('='.repeat(80));

    // Insert admin user with ID 1
    const result = await client.query(`
      INSERT INTO users (id, username, email, password, first_name, last_name, role, status, created_at)
      VALUES (
        1,
        'admin',
        'admin@shyaw.com',
        '$2b$10$K1.vWpDD9dJSZvDRIklI8OPST9/PgBkqquzi.Ee136WQgGiKm2He6',
        'Admin',
        'User',
        'admin',
        'active',
        NOW()
      )
      RETURNING id, username, email, role
    `);

    const admin = result.rows[0];
    console.log('✅ Admin user created:');
    console.log(`   ID: ${admin.id}`);
    console.log(`   Username: ${admin.username}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`\n📝 Default Password: admin123\n`);

    console.log('='.repeat(80));
    console.log('\n✨ Admin user restored successfully!');
    console.log('   You can now login with:');
    console.log('   - Username: admin');
    console.log('   - Password: admin123\n');

  } catch (error: any) {
    if (error.code === '23505') {
      console.log('ℹ️  Admin user already exists');
    } else {
      console.error('❌ Error:', error);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main();
