/**
 * Pre-generate "Trong đầu bạn có gì?" brain scene images (one per result id).
 *
 * Run: npm run images:brain
 * Options: --id=brain_03   --force
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

const { BRAIN_RESULTS } = await import('../../shared/brainData.js');
const { ensureBrainSceneImage, getBrainImageLocalPath } = await import(
  '../../api/_lib/brainImageService.js'
);

if (!process.env.OPENROUTER_API_KEY && !process.env.GEMINI_API_KEY && !process.env.VITE_GEMINI_API_KEY) {
  console.error('❌ OPENROUTER_API_KEY or GEMINI_API_KEY required');
  process.exit(1);
}

const targets = onlyId
  ? BRAIN_RESULTS.filter((r) => r.id === onlyId)
  : BRAIN_RESULTS;

if (!targets.length) {
  console.error(`❌ No brain result matched: ${onlyId}`);
  process.exit(1);
}

console.log(`\n🧠 Brain image backfill — ${targets.length} result(s)${force ? ' [FORCE]' : ''}\n`);

let ok = 0;
let skipped = 0;

for (const [i, r] of targets.entries()) {
  const localPath = getBrainImageLocalPath(r.id);
  if (!force && localPath && fs.existsSync(localPath)) {
    console.log(`  ⏭️  ${r.id} — already exists`);
    skipped += 1;
    continue;
  }

  process.stdout.write(`  🖼️  ${r.id} generating… `);
  try {
    const result = await ensureBrainSceneImage({ id: r.id, indexHint: i });
    console.log(result.cached ? `cached (${result.source})` : `saved ${result.image_url}`);
    ok += 1;
  } catch (err) {
    console.log(`FAILED — ${err.message}`);
  }

  await new Promise((res) => setTimeout(res, 2500));
}

console.log(`\n✅ Done: ${ok} generated, ${skipped} skipped\n`);
