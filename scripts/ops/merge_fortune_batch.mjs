#!/usr/bin/env node
/**
 * Merge fortune axis-batch JSON files into shared/fortune-pools/*.pool.json
 *
 * Usage:
 *   npm run fortune:merge-batch -- --axis=money
 *   npm run fortune:merge-batch -- --axis=health --input=data/fortune-batch/health-2026-07-12.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '../..');
const BATCH_DIR = path.join(PROJECT_ROOT, 'data', 'fortune-batch');
const POOL_DIR = path.join(PROJECT_ROOT, 'shared', 'fortune-pools');

const args = process.argv.slice(2);
const axis = args.find((a) => a.startsWith('--axis='))?.split('=')[1] || 'money';
const inputArg = args.find((a) => a.startsWith('--input='))?.split('=').slice(1).join('=');

const POOL_FILES = {
  money: 'fortune-money.pool.json',
  health: 'fortune-health.pool.json',
};

if (!POOL_FILES[axis]) {
  console.error(`❌ Unknown axis: ${axis} (money|health)`);
  process.exit(1);
}

function normalizeTitleKey(title) {
  return String(title || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function normalizeBatchItem(raw, id, axisId) {
  const title = String(raw.title || '').trim();
  const desc = String(raw.desc || raw.description || '').trim();
  const remedy = String(raw.remedy || '').trim();
  let cuuTinh = String(raw.cuuTinh || '').trim();
  let baoThu = String(raw.baoThu || '').trim();

  if (!/Chỉ số\s*\d+/i.test(cuuTinh)) {
    cuuTinh = `Chỉ số ${(id + 3) % 20} (${cuuTinh.replace(/^\d+%\s*/, '') || 'Quý nhân'})`;
  }
  if (!/Chỉ số\s*\d+/i.test(baoThu)) {
    baoThu = `Chỉ số ${(id + 7) % 20} (${baoThu.replace(/^\d+%\s*/, '') || 'Hố đen'})`;
  }

  return { id, title, desc, remedy, cuuTinh, baoThu, _axis: axisId };
}

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function collectBatchFiles() {
  if (inputArg) {
    const p = path.isAbsolute(inputArg) ? inputArg : path.join(PROJECT_ROOT, inputArg);
    return [p];
  }
  if (!fs.existsSync(BATCH_DIR)) return [];
  return fs
    .readdirSync(BATCH_DIR)
    .filter((f) => f.startsWith(`${axis}-`) && f.endsWith('.json'))
    .map((f) => path.join(BATCH_DIR, f));
}

const poolPath = path.join(POOL_DIR, POOL_FILES[axis]);
const existing = fs.existsSync(poolPath) ? loadJson(poolPath) : [];
const batchFiles = collectBatchFiles();

if (!batchFiles.length) {
  console.error(`❌ No batch files for axis=${axis} in ${BATCH_DIR}`);
  process.exit(1);
}

const seen = new Set(existing.map((e) => normalizeTitleKey(e.title)));
const merged = [...existing];

for (const file of batchFiles) {
  const items = loadJson(file);
  const list = Array.isArray(items) ? items : items.items || items.archetypes || [];
  for (const raw of list) {
    const key = normalizeTitleKey(raw.title);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push(normalizeBatchItem(raw, merged.length, axis));
  }
  console.log(`  + ${path.basename(file)} (${list.length} items)`);
}

const output = merged.map(({ _axis, ...rest }, i) => ({ ...rest, id: i }));

fs.mkdirSync(POOL_DIR, { recursive: true });
fs.writeFileSync(poolPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');

console.log(`\n✅ ${axis} pool: ${existing.length} → ${output.length} items`);
console.log(`   ${path.relative(PROJECT_ROOT, poolPath)}\n`);
