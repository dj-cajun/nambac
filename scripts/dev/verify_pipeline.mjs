#!/usr/bin/env node
/** Pre-deploy pipeline checks — build + fortune images + pool counts */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '../..');

function run(cmd, args) {
  const r = spawnSync(cmd, args, { cwd: ROOT, stdio: 'inherit', env: process.env });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function poolSize(rel) {
  const data = JSON.parse(readFileSync(path.join(ROOT, rel), 'utf8'));
  return Array.isArray(data) ? data.length : 0;
}

console.log('\n🔍 v5.2 pipeline verify\n');

run('npm', ['run', 'build']);
run('npm', ['run', 'verify:fortune-images']);

const money = poolSize('shared/fortune-pools/fortune-money.pool.json');
const health = poolSize('shared/fortune-pools/fortune-health.pool.json');
console.log(`✅ fortune pools — money: ${money}, health: ${health}`);

if (money < 5 || health < 5) {
  console.error('❌ axis pools too small (need ≥5 each)');
  process.exit(1);
}

console.log('\nPASS: ready for review/deploy\n');
