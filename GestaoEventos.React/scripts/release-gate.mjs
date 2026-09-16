import { spawnSync } from 'node:child_process';

const npm = process.platform === 'win32' ? (process.env.ComSpec || 'cmd.exe') : 'npm';
const args = process.platform === 'win32' ? ['/d', '/s', '/c', 'npm run quality-gate'] : ['run', 'quality-gate'];
const quality = spawnSync(npm, args, { stdio: 'inherit', env: process.env });
if (quality.error || quality.status !== 0) process.exit(quality.status ?? 1);

const gate = spawnSync(process.execPath, ['scripts/validate-go-live-gate.mjs'], { stdio: 'inherit', env: process.env });
process.exit(gate.status ?? 1);
