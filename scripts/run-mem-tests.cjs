const { execSync } = require('child_process');
const path = require('path');

function run(cmd) {
  console.log('> ' + cmd);
  execSync(cmd, { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });
}

try {
  // Add tests here as they are created
  run('npx tsx ./scripts/test-mem-storage-interview-delete.ts');
  console.log('\nAll mem-storage tests passed');
} catch (err) {
  console.error('\nOne or more mem-storage tests failed');
  process.exit(1);
}
