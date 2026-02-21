#!/usr/bin/env node
import { spawnSync } from 'child_process';
import { existsSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const outDir = fileURLToPath(new URL('./backups', import.meta.url));
const { DATABASE_URL } = process.env;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set in environment (.env)');
  process.exit(1);
}

function runPgDump() {
  console.log('Attempting to use pg_dump for a complete export (fast).');
  const schemaFile = `${outDir}/schema.sql`;
  const dataFile = `${outDir}/data.sql`;
  try {
    // Ensure directory exists
    if (!existsSync(outDir)) {
      // mkdir sync fallback
      import('fs').then(fs => fs.mkdirSync(outDir, { recursive: true }));
    }
    const s1 = spawnSync('pg_dump', ['--schema-only', DATABASE_URL], { encoding: 'utf-8' });
    if (s1.error) throw s1.error;
    writeFileSync(schemaFile, s1.stdout);
    const s2 = spawnSync('pg_dump', ['--data-only', '--inserts', DATABASE_URL], { encoding: 'utf-8' });
    if (s2.error) throw s2.error;
    writeFileSync(dataFile, s2.stdout);
    console.log(`Export completed: ${schemaFile}, ${dataFile}`);
    return true;
  } catch (err) {
    console.warn('pg_dump not available or failed, falling back to JS export.', err.message || err);
    return false;
  }
}

async function fallbackExport() {
  console.log('Doing fallback export using pg client (schema + data for key tables).');
  const pool = new Pool({ connectionString: DATABASE_URL });
  try {
    const client = await pool.connect();
    const res = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';`);
    const tables = res.rows.map(r => r.table_name).filter(t => t !== 'pg_stat_statements');
    let out = '';
    for (const t of tables) {
      // schema via pg_get_tabledef isn't standard; get columns and fabricate simple CREATE TABLE is risky.
      // We'll export data only as INSERTs to be safe.
      out += `-- Data for table ${t}\n`;
      const rows = await client.query(`SELECT * FROM ${t}`);
      if (rows.rows.length === 0) continue;
      for (const row of rows.rows) {
        const cols = Object.keys(row).map(c => '"' + c + '"').join(',');
        const vals = Object.values(row).map(v => v === null ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`).join(',');
        out += `INSERT INTO "${t}"(${cols}) VALUES(${vals});\n`;
      }
      out += '\n';
    }
    if (!existsSync(outDir)) await import('fs').then(fs => fs.mkdirSync(outDir, { recursive: true }));
    const file = `${outDir}/data-inserts.sql`;
    writeFileSync(file, out);
    console.log(`Fallback export written to ${file}`);
    client.release();
  } catch (err) {
    console.error('Fallback export failed:', err.message || err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

(async () => {
  const usedPgDump = runPgDump();
  if (!usedPgDump) {
    await fallbackExport();
  }
})();
