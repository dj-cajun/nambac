/**
 * Pre-generate SBTI result mascot images (one per type code).
 *
 * Run: npm run images:sbti
 * Options: --code=CTRL   --force
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
const codeArg = args.find((a) => a.startsWith('--code='));
const force = args.includes('--force');
const onlyCode = codeArg ? codeArg.split('=')[1] : null;

const types = JSON.parse(
  fs.readFileSync(path.join(PROJECT_ROOT, 'shared/vbti/types.vi.json'), 'utf8'),
);
const { ensureSbtiSceneImage, getSbtiImageLocalPath } = await import(
  '../../api/_lib/sbtiImageService.js'
);

if (!process.env.OPENROUTER_API_KEY && !process.env.GEMINI_API_KEY && !process.env.VITE_GEMINI_API_KEY) {
  console.error('❌ OPENROUTER_API_KEY or GEMINI_API_KEY required');
  process.exit(1);
}

const targets = onlyCode
  ? [onlyCode] // allow non-type codes like HUB (hub hero image)
  : Object.keys(types);

if (!targets.length) {
  console.error(`❌ No SBTI type matched: ${onlyCode}`);
  process.exit(1);
}

console.log(`\n🎭 SBTI mascot image backfill — ${targets.length} type(s)${force ? ' [FORCE]' : ''}\n`);

let ok = 0;
let skipped = 0;

for (const [i, code] of targets.entries()) {
  const localPath = getSbtiImageLocalPath(code);
  if (!force && localPath && fs.existsSync(localPath)) {
    console.log(`  ⏭️  ${code} — already exists`);
    skipped += 1;
    continue;
  }

  if (force && localPath && fs.existsSync(localPath)) {
    fs.unlinkSync(localPath);
  }

  process.stdout.write(`  🖼️  ${code} generating… `);
  try {
    const result = await ensureSbtiSceneImage({ code, indexHint: i, force });
    console.log(result.cached ? `cached (${result.source})` : `saved ${result.image_url}`);
    ok += 1;
  } catch (err) {
    console.log(`FAILED — ${err.message}`);
  }

  await new Promise((r) => setTimeout(r, 2500));
}

console.log(`\n✅ Done: ${ok} generated, ${skipped} skipped\n`);
