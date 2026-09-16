import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const validatorPath = path.resolve(root, 'scripts/validate-architecture.mjs');
const ignored = new Set(['node_modules', '.expo', 'dist', 'web-build']);
const files = [];

function visit(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) visit(full);
    else if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name)) files.push(full);
  }
}

for (const directory of ['app', 'features', 'services', 'shared', 'stores']) {
  visit(path.join(root, directory));
}
const forbidden = [
  new RegExp('/api/' + 'v1', 'i'),
  new RegExp('manager' + '-person', 'i'),
  new RegExp('stu' + 'dent', 'i'),
  new RegExp('tre' + 'ino', 'i'),
  new RegExp('nut' + 'rition', 'i'),
  new RegExp('work' + 'out', 'i'),
];
for (const file of files) {
  if (file === validatorPath) continue;
  const source = fs.readFileSync(file, 'utf8');
  for (const pattern of forbidden) {
    if (pattern.test(source)) throw new Error(`Referencia proibida ${pattern} em ${path.relative(root, file)}`);
  }
  if (file.includes(`${path.sep}features${path.sep}`) && source.includes('httpClient')) {
    throw new Error(`Feature acessa httpClient diretamente: ${path.relative(root, file)}`);
  }
}

const provider = path.join(root, 'services/platform/analytics-provider/index.web.ts');
const providerSource = fs.readFileSync(provider, 'utf8');
for (const file of files.filter((item) => item !== provider)) {
  if (fs.readFileSync(file, 'utf8').includes('window.dataLayer.push')) {
    throw new Error(`dataLayer acessado fora do adapter web: ${path.relative(root, file)}`);
  }
}
if (!providerSource.includes('window.dataLayer.push')) throw new Error('adapter web sem destino dataLayer');

console.log('[validate-architecture] OK');
