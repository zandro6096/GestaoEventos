const { spawnSync } = require('node:child_process');
const path = require('node:path');

const tests = [
  'offline-policy.smoke.cjs',
  'context.smoke.cjs',
  'jornada.smoke.cjs',
  'acompanhamento.smoke.cjs',
  'presenca.smoke.cjs',
  'admin.smoke.cjs',
];

for (const test of tests) {
  console.log(`[core-smoke] executando ${test}`);
  const result = spawnSync(process.execPath, [path.resolve('tests', test)], { stdio: 'inherit', env: process.env });
  if (result.error || result.status !== 0) {
    console.error(`[core-smoke] falhou em ${test}`);
    process.exit(result.status ?? 1);
  }
}

console.log('[core-smoke] OK');
