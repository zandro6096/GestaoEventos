import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve('.');
const manifestPath = join(root, 'docs', 'parity-manifest.md');
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

assert(existsSync(manifestPath), 'Missing docs/parity-manifest.md');

const content = existsSync(manifestPath) ? readFileSync(manifestPath, 'utf8') : '';
const requiredHeaders = [
  'React route/flow',
  'Angular route/component',
  'Angular service/source',
  'Backend endpoint/class',
  'Context scope',
  'Permission checks',
  'Analytics events',
  'Tests',
  'Status',
  'Gaps',
];

for (const header of requiredHeaders) {
  assert(content.includes(header), `Parity manifest missing schema header: ${header}`);
}

for (const status of ['not-started', 'in-progress', 'blocked', 'verified', 'deferred']) {
  assert(content.includes(`\`${status}\``), `Parity manifest missing status value: ${status}`);
}

for (const row of ['`/` scaffold', '`analytics-foundation`', '`offline-foundation`']) {
  assert(content.includes(row), `Parity manifest missing initial row: ${row}`);
}

assert(content.includes('ge_event'), 'Parity manifest must record ge_event analytics contract');
assert(content.includes('visualization:screen_view'), 'Parity manifest must record scaffold visualization event');

if (failures.length > 0) {
  console.error('[validate-parity-ledger] FAILED');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('[validate-parity-ledger] OK');
