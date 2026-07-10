/**
 * Pre-generate Balance-game dilemma scene images (one per question id).
 *
 * Run: npm run images:balance
 * Options: --id=sc_003   --force
 */
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '../..');

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });
dotenv.config({ path: path.join(PROJECT_ROOT, '.env.local'), override: true });

const args = process.argv.slice(2);
const idArg = args.find((a) => a.startsWith('--id='));
const force = args.includes('--force');
const onlyId = idArg ? idArg.split('=')[1] : null;

const { BALANCE_QUESTIONS } = await import('../../shared/balanceData.js');
const { ensureBalanceSceneImage, getBalanceImageLocalPath } = await import(
  '../../api/_lib/balanceImageService.js'
);

if (!process.env.OPENROUTER_API_KEY && !process.env.GEMINI_API_KEY && !process.env.VITE_GEMINI_API_KEY) {
  console.error('❌ OPENROUTER_API_KEY or GEMINI_API_KEY required');
  process.exit(1);
}

const targets = onlyId
  ? BALANCE_QUESTIONS.filter((q) => q.id === onlyId)
  : BALANCE_QUESTIONS;

if (!targets.length) {
  console.error(`❌ No balance question matched: ${onlyId}`);
  process.exit(1);
}

console.log(`\n⚖️  Balance image backfill — ${targets.length} question(s)${force ? ' [FORCE]' : ''}\n`);

let ok = 0;
let skipped = 0;

for (const [i, q] of targets.entries()) {
  const localPath = getBalanceImageLocalPath(q.id);
  if (!force && localPath && fs.existsSync(localPath)) {
    console.log(`  ⏭️  ${q.id} — already exists`);
    skipped += 1;
    continue;
  }

  if (force && localPath && fs.existsSync(localPath)) {
    fs.unlinkSync(localPath);
  }

  process.stdout.write(`  🖼️  ${q.id} generating… `);
  try {
    const result = await ensureBalanceSceneImage({ id: q.id, indexHint: i, force });
    console.log(result.cached ? `cached (${result.source})` : `saved ${result.image_url}`);
    ok += 1;
  } catch (err) {
    console.log(`FAILED — ${err.message}`);
  }

  await new Promise((r) => setTimeout(r, 2500));
}

console.log(`\n✅ Done: ${ok} generated, ${skipped} skipped\n`);
