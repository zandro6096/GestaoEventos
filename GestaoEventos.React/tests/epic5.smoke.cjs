const { spawnSync } = require('node:child_process');
const path = require('node:path');

for (const test of ['painel.smoke.cjs', 'cockpit.smoke.cjs', 'relatorios.smoke.cjs']) {
  const result = spawnSync(process.execPath, [path.resolve('tests', test)], { stdio: 'inherit', env: process.env });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
console.log('PASS Epic 5 smoke');
