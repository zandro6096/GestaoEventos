import fs from 'node:fs';
import path from 'node:path';

const manifest = fs.readFileSync(path.join(process.cwd(), 'docs', 'parity-manifest.md'), 'utf8');
const rows = manifest.split('\n').filter((line) => line.startsWith('|') && !line.startsWith('| ---'));
const pending = [];

for (const row of rows) {
  const flow = row.split('|')[1]?.trim();
  const status = row.match(/\|\s*(not-started|in-progress|blocked|verified|deferred)\s*\|/)?.[1];
  if (!flow || !status || flow === 'React route/flow' || flow === 'Status') continue;
  if (status !== 'verified') pending.push(`${flow} [${status || 'status ausente'}]`);
}

for (const required of ['quality-gate-e2e', 'release-environment-lanes']) {
  const row = rows.find((line) => line.includes(`\`${required}\``));
  if (!row?.includes('| verified |')) pending.push(`${required} [evidencia ausente]`);
}

if (pending.length > 0) {
  console.error('[go-live-gate] BLOCKED - paridade produtiva incompleta:');
  for (const item of pending) console.error(`- ${item}`);
  process.exit(1);
}

console.log('[go-live-gate] PASS - todas as linhas produtivas estao verified');
