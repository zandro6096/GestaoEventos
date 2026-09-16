const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

function run(args) {
  return spawnSync(process.execPath, ['scripts/validate-environment.mjs', ...args], { encoding: 'utf8', env: process.env });
}

test('dev aceita API local explicita', () => {
  const result = run(['--lane=development', '--api-url=http://localhost:8084']);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /lane=development/);
  assert.match(result.stdout, /localhost/);
});

test('preview exige API HTTPS publica', () => {
  const missing = run(['--lane=preview', '--api-url=']);
  assert.notEqual(missing.status, 0);
  assert.match(missing.stderr, /exige EXPO_PUBLIC_API_URL/);

  const local = run(['--lane=preview', '--api-url=http://localhost:8084']);
  assert.notEqual(local.status, 0);
  assert.match(local.stderr, /nao pode apontar para localhost/);
});

test('prod aceita somente base HTTPS sem /api', () => {
  const valid = run(['--lane=prod', '--api-url=https://api.example.com']);
  assert.equal(valid.status, 0, valid.stderr);

  const invalid = run(['--lane=prod', '--api-url=https://api.example.com/api']);
  assert.notEqual(invalid.status, 0);
  assert.match(invalid.stderr, /sem \/api/);
});
