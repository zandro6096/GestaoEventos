import { existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(here, '..');
const platformRoot = join(appRoot, 'services', 'platform');

const requiredAdapters = ['index.android.ts', 'index.ios.ts', 'index.web.ts'];
const forbiddenNeutralEntries = [
  'index.ts',
  'index.tsx',
  'index.js',
  'index.jsx',
  'index.mjs',
  'index.cjs',
  'index.json',
  'index.native.ts',
  'index.native.tsx',
  'index.native.js',
];

const failures = [];

if (!existsSync(platformRoot)) {
  console.log(`[check-platform] Nothing to verify: ${relative(appRoot, platformRoot)} does not exist.`);
  process.exit(0);
}

const ports = readdirSync(platformRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

for (const port of ports) {
  const portDir = join(platformRoot, port);
  const files = readdirSync(portDir).filter((name) => statSync(join(portDir, name)).isFile());

  const missing = requiredAdapters.filter((adapter) => !files.includes(adapter));
  if (missing.length > 0) {
    failures.push(`services/platform/${port}/ missing adapters: ${missing.join(', ')}`);
  }

  const neutral = forbiddenNeutralEntries.filter((name) => files.includes(name));
  if (neutral.length > 0) {
    failures.push(`services/platform/${port}/ has forbidden neutral entry: ${neutral.join(', ')}`);
  }
}

if (failures.length > 0) {
  console.error('[check-platform] FAILED');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`[check-platform] OK - ${ports.length} platform adapter port(s) verified.`);
