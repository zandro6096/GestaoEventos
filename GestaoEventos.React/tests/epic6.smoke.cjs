const { spawnSync } = require('node:child_process');

const commands = ['smoke:configuracoes', 'smoke:admin', 'smoke:configuracoes-comerciais', 'smoke:auditoria-suporte'];
for (const script of commands) {
  const result = process.platform === 'win32'
    ? spawnSync(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', `npm run ${script}`], { stdio: 'inherit', env: process.env })
    : spawnSync('npm', ['run', script], { stdio: 'inherit', env: process.env });
  if (result.error || result.status !== 0) process.exit(result.status ?? 1);
}
console.log('[epic6-smoke] OK');
