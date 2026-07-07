/**
 * Pre-generate daily fortune AI scene images (FORTUNE_COUNT archetypes × date).
 *
 * Run: npm run images:fortune
 * Options: --date=2026-07-07  --idx=3  --force
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '../..');

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });
dotenv.config({ path: path.join(PROJECT_ROOT, '.env.local'), override: true });

const args = process.argv.slice(2);
const dateArg = args.find((a) => a.startsWith('--date='));
const idxArg = args.find((a) => a.startsWith('--idx='));
const force = args.includes('--force');
const dateStr = dateArg ? dateArg.split('=')[1] : new Date().toISOString().slice(0, 10);
const onlyIdx = idxArg !== undefined ? parseInt(idxArg.split('=')[1], 10) : null;

const { getDateStr } = await import('../../shared/fortuneEngine.js');
const { FORTUNE_COUNT } = await import('../../shared/fortuneData.js');
const { ensureFortuneSceneImage, getFortuneImageLocalPath } = await import(
  '../../api/_lib/fortuneImageService.js'
);

const targetDate = dateArg ? dateStr : getDateStr();
const indices = onlyIdx !== null && !Number.isNaN(onlyIdx)
  ? [((onlyIdx % FORTUNE_COUNT) + FORTUNE_COUNT) % FORTUNE_COUNT]
  : Array.from({ length: FORTUNE_COUNT }, (_, i) => i);

if (!process.env.OPENROUTER_API_KEY && !process.env.GEMINI_API_KEY && !process.env.VITE_GEMINI_API_KEY) {
  console.error('❌ OPENROUTER_API_KEY or GEMINI_API_KEY required');
  process.exit(1);
}

console.log(`\n🔮 Fortune image backfill — ${targetDate}${force ? ' [FORCE]' : ''}\n`);

let ok = 0;
let skipped = 0;

for (const idx of indices) {
  const localPath = getFortuneImageLocalPath(targetDate, idx);
  if (!force && localPath && (await import('fs')).default.existsSync(localPath)) {
    console.log(`  ⏭️  idx${idx} — already exists`);
    skipped += 1;
    continue;
  }

  process.stdout.write(`  🖼️  idx${idx} generating… `);
  try {
    const result = await ensureFortuneSceneImage({ fortuneIndex: idx, dateStr: targetDate });
    console.log(result.cached ? 'cached' : `saved ${result.image_url}`);
    ok += 1;
  } catch (err) {
    console.log(`FAILED — ${err.message}`);
  }

  await new Promise((r) => setTimeout(r, 2500));
}

console.log(`\n✅ Done: ${ok} generated, ${skipped} skipped\n`);
