#!/usr/bin/env node
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const fs = require('fs');
const { Client } = require('pg');

async function main() {
  const sql = fs.readFileSync(require('path').resolve(__dirname, '../migrations/0005_create-it-support-tickets.sql'), 'utf8');
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    console.log('Applying migration 0005...');
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('Migration 0005 applied successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err.message || err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
