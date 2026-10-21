// Runs every tests/*.test.js and the site build/audit. Usage: npm test
const { execFileSync } = require('child_process'), fs = require('fs'), path = require('path');
let failed = false;
fs.readdirSync(__dirname).filter(f => f.endsWith('.test.js')).forEach(f => {
  try { process.stdout.write(execFileSync('node', [path.join(__dirname, f)], { encoding: 'utf8' })); }
  catch (e) { failed = true; console.log(`FAIL ${f}\n${e.stdout || ''}${e.stderr || ''}`); }
});
// Browser tests need python3 + playwright; skipped (with a notice) if missing.
fs.readdirSync(__dirname).filter(f => /^browser-.*\.py$/.test(f)).forEach(f => {
  try { execFileSync('python3', ['-c', 'import playwright'], { stdio: 'ignore' }); }
  catch (e) { console.log(`SKIP ${f} (python3 playwright not installed)`); return; }
  try { process.stdout.write(execFileSync('python3', [path.join(__dirname, f)], { encoding: 'utf8' }).split('\n').filter(l => /FAIL|passed|FAILED/.test(l)).map(l => f + ': ' + l).join('\n') + '\n'); }
  catch (e) { failed = true; console.log(`FAIL ${f}\n${e.stdout || ''}`); }
});
try { process.stdout.write(execFileSync('node', [path.join(__dirname, '../scripts/build.js')], { encoding: 'utf8' })); }
catch (e) { failed = true; console.log(e.stdout || e.message); }
process.exit(failed ? 1 : 0);
