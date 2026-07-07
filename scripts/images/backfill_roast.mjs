/**
 * Pre-generate Roast blacklist scene images (one per trait id).
 *
 * Run: npm run images:roast
 * Options: --id=trait_03   --force
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

const { ROAST_TRAITS } = await import('../../shared/roastData.js');
const { ensureRoastSceneImage, getRoastImageLocalPath } = await import(
  '../../api/_lib/roastImageService.js'
);

if (!process.env.OPENROUTER_API_KEY && !process.env.GEMINI_API_KEY && !process.env.VITE_GEMINI_API_KEY) {
  console.error('❌ OPENROUTER_API_KEY or GEMINI_API_KEY required');
  process.exit(1);
}

const targets = onlyId
  ? ROAST_TRAITS.filter((t) => t.id === onlyId)
  : ROAST_TRAITS;

if (!targets.length) {
  console.error(`❌ No roast trait matched: ${onlyId}`);
  process.exit(1);
}

console.log(`\n💳 Roast image backfill — ${targets.length} trait(s)${force ? ' [FORCE]' : ''}\n`);

let ok = 0;
let skipped = 0;

for (const [i, t] of targets.entries()) {
  const localPath = getRoastImageLocalPath(t.id);
  if (!force && localPath && fs.existsSync(localPath)) {
    console.log(`  ⏭️  ${t.id} — already exists`);
    skipped += 1;
    continue;
  }

  process.stdout.write(`  🖼️  ${t.id} generating… `);
  try {
    const result = await ensureRoastSceneImage({ id: t.id, indexHint: i });
    console.log(result.cached ? `cached (${result.source})` : `saved ${result.image_url}`);
    ok += 1;
  } catch (err) {
    console.log(`FAILED — ${err.message}`);
  }

  await new Promise((r) => setTimeout(r, 2500));
}

console.log(`\n✅ Done: ${ok} generated, ${skipped} skipped\n`);
