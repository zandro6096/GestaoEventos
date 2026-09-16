import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const env = { ...process.env };
const bundledPlaywright = resolve(process.cwd(), '..', '.codex-tmp', 'browser', 'node_modules', 'playwright');
if (!env.PLAYWRIGHT_MODULE && existsSync(bundledPlaywright)) env.PLAYWRIGHT_MODULE = bundledPlaywright;

const commands = [
  'build:web',
  'check:platform',
  'type-check',
  'lint',
  'check:architecture',
  'check:release-contract',
  'test:scaffold',
  'test:analytics',
  'test:offline-policy',
  'test:release-contract',
  'smoke:meus-eventos',
  'smoke:core',
];
for (const command of commands) {
  console.log(`[quality-gate] npm run ${command}`);
  const executable = process.platform === 'win32' ? (process.env.ComSpec || 'cmd.exe') : 'npm';
  const args = process.platform === 'win32' ? ['/d', '/s', '/c', `npm run ${command}`] : ['run', command];
  const result = spawnSync(executable, args, { stdio: 'inherit', env });
  if (result.error || result.status !== 0) {
    console.error(`[quality-gate] BLOQUEADO em npm run ${command}`);
    process.exit(result.status ?? 1);
  }
}

console.log('[quality-gate] PASS');
