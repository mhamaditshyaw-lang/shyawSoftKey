import pkg from 'pg';
const { Pool } = pkg;
import 'dotenv/config';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
    try {
        const today = new Date('2026-01-18');
        const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
        const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

        const res = await pool.query(
            'SELECT COUNT(*) FROM operational_data WHERE created_at >= $1 AND created_at <= $2',
            [startOfDay, endOfDay]
        );
        console.log(`Entries for today (2026-01-18): ${res.rows[0].count}`);

        const all = await pool.query('SELECT COUNT(*) FROM operational_data');
        console.log('Total entries in operational_data:', all.rows[0].count);

        if (parseInt(res.rows[0].count) > 0) {
            const samples = await pool.query(
                'SELECT * FROM operational_data WHERE created_at >= $1 AND created_at <= $2 LIMIT 1',
                [startOfDay, endOfDay]
            );
            console.log('Sample for today:', JSON.stringify(samples.rows[0], null, 2));
        }
    } catch (err) {
        console.error('Error executing query', err);
    } finally {
        await pool.end();
    }
}

testConnection();
