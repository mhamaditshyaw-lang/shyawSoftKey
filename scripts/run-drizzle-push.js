#!/usr/bin/env node
const { config } = require('dotenv');
const { spawnSync } = require('child_process');

config();
console.log('DATABASE_URL present:', !!process.env.DATABASE_URL);

const res = spawnSync('npx', ['drizzle-kit', 'push'], {
  stdio: 'inherit',
  env: process.env,
  shell: true,
});

if (res.error) {
  console.error('Spawn error:', res.error);
  process.exit(1);
}
process.exit(res.status || 0);
