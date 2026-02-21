#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const defaultOut = path.join(repoRoot, 'dist', 'public');
const fallbackOut = path.join(repoRoot, 'dist', 'public-fallback');

function run(cmd, env = {}) {
  console.log('[build-wrapper] running:', cmd);
  execSync(cmd, { stdio: 'inherit', env: { ...process.env, ...env } });
}

try {
  try {
    fs.mkdirSync(defaultOut, { recursive: true });
    console.log('[build-wrapper] ensured outDir exists:', defaultOut);
    // run vite with default settings (vite.config.ts controls outDir)
    run('npx vite build');
  } catch (err) {
    console.warn('[build-wrapper] failed to ensure default outDir:', err && err.code ? err.code : err.message || err);
    // If it's an EPERM or similar, fall back to alternate outDir
    try {
      fs.mkdirSync(fallbackOut, { recursive: true });
      console.log('[build-wrapper] created fallback outDir:', fallbackOut);
      // pass override to vite CLI
      run(`npx vite build --outDir "${fallbackOut.replace(/\\/g, '\\\\')}"`);
      // create a marker so server can auto-detect fallback
      fs.writeFileSync(path.join(repoRoot, 'dist', 'USE_FALLBACK_OUTDIR'), fallbackOut, 'utf8');
    } catch (err2) {
      console.error('[build-wrapper] fallback build also failed:', err2 && err2.code ? err2.code : err2.message || err2);
      process.exit(2);
    }
  }
  process.exit(0);
} catch (err) {
  console.error('[build-wrapper] unexpected error:', err);
  process.exit(3);
}
