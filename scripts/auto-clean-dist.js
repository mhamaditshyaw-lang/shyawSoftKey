#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const assetsPath = path.join(root, 'dist', 'public', 'assets');
const publicPath = path.join(root, 'dist', 'public');

function log(...args) { console.log('[clean-dist]', ...args); }

try {
  if (!fs.existsSync(assetsPath)) {
    log('No assets folder to remove:', assetsPath);
    process.exit(0);
  }

  // Try to remove recursively
  try {
    fs.rmSync(assetsPath, { recursive: true, force: true });
    log('Removed assets folder successfully.');
    process.exit(0);
  } catch (err) {
    log('Initial removal failed:', err && err.code ? err.code : err.message || err);
  }

  // Try renaming public folder as a fallback
  const backup = publicPath + '.bak-' + Date.now();
  try {
    fs.renameSync(publicPath, backup);
    log(`Renamed ${publicPath} -> ${backup}`);
    process.exit(0);
  } catch (err) {
    log('Rename fallback failed:', err && err.code ? err.code : err.message || err);
  }

  // If we reach here, we couldn't remove/rename. Provide guidance.
  console.error('\n[clean-dist] Failed to clean dist/public/assets automatically.');
  console.error('[clean-dist] This is commonly caused by another process holding a handle to the folder (Explorer, editor, antivirus, or a running dev server).');
  console.error('[clean-dist] Recommended manual steps:');
  console.error('  1) Close any Explorer/VSCode windows showing the dist folder.');
  console.error('  2) Run PowerShell as Administrator and execute:');
  console.error("       takeown /F \"%CD%\\dist\\public\\assets\" /R /D Y");
  console.error('       icacls "%CD%\\dist\\public\\assets" /grant %USERNAME%:F /T');
  console.error('       rmdir /s /q "%CD%\\dist\\public\\assets"');
  console.error('  3) Or use Process Explorer (Sysinternals) to find and close handles to the folder.');
  process.exit(2);
} catch (err) {
  console.error('[clean-dist] Unexpected error:', err);
  process.exit(3);
}
