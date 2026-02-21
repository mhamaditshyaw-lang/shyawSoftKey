#!/usr/bin/env node
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL not set in environment (.env)');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: url });
  try {
    console.log('Connecting to database...');
    // simple query to validate connection
    await pool.query('SELECT 1');
    console.log('Running ALTER TABLE to ensure column exists...');
    const sql = `ALTER TABLE todo_items ADD COLUMN IF NOT EXISTS completed_by_note text;`;
    await pool.query(sql);
    console.log('ALTER TABLE executed successfully.');
  } catch (err) {
    console.error('Error running ALTER TABLE:', err.message || err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
