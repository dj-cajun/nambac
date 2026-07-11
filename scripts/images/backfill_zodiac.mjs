/**
 * One-time backfill: 12 western zodiac + 12 con giáp fortune images (24 total).
 * NOT daily — run once, commit to public/images/.
 *
 * Run: npm run images:zodiac
 * Options: --kind=west|cn  --id=aries  --force  --dry-run
 */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { PROJECT_ROOT } from '../_root.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });
dotenv.config({ path: path.join(PROJECT_ROOT, '.env.local'), override: true });

const args = process.argv.slice(2);
const force = args.includes('--force');
const dryRun = args.includes('--dry-run');
const kindArg = args.find((a) => a.startsWith('--kind='));
const idArg = args.find((a) => a.startsWith('--id='));
const delayArg = args.find((a) => a.startsWith('--delay='));
const filterKind = kindArg ? kindArg.split('=')[1] : '';
const filterId = idArg ? idArg.split('=')[1] : '';
const delayMs = delayArg ? parseInt(delayArg.split('=')[1], 10) : 4000;

if (!process.env.OPENROUTER_API_KEY && !process.env.GEMINI_API_KEY && !process.env.VITE_GEMINI_API_KEY) {
  console.error('❌ OPENROUTER_API_KEY or GEMINI_API_KEY required');
  process.exit(1);
}

const { listAllZodiacImageJobs } = await import('../../shared/zodiacImagePrompts.js');
const { generateQuizImage } = await import('../../api/_lib/generateQuizImage.js');
const { IMAGES_DIR, WEBP_MAX_SIZE, WEBP_QUALITY } = await import('../../api/_lib/saveQuizImage.js');

let jobs = listAllZodiacImageJobs();
if (filterKind) jobs = jobs.filter((j) => j.kind === filterKind);
if (filterId) jobs = jobs.filter((j) => j.id === filterId);

if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

console.log(`\n♈ Zodiac fortune images — ${jobs.length} job(s)${force ? ' [FORCE]' : ''}${dryRun ? ' [DRY]' : ''}\n`);

let ok = 0;
let skipped = 0;

for (const job of jobs) {
  const outPath = path.join(IMAGES_DIR, job.filename);
  if (!force && fs.existsSync(outPath)) {
    console.log(`  ⏭️  ${job.filename} — exists`);
    skipped += 1;
    continue;
  }

  if (dryRun) {
    console.log(`  📝 ${job.filename} — ${job.label}`);
    ok += 1;
    continue;
  }

  process.stdout.write(`  🖼️  ${job.filename} (${job.label})… `);
  try {
    const { b64 } = await generateQuizImage(job.prompt);
    const buffer = await sharp(Buffer.from(b64, 'base64'))
      .rotate()
      .resize(WEBP_MAX_SIZE, WEBP_MAX_SIZE, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY, effort: 4 })
      .toBuffer();
    fs.writeFileSync(outPath, buffer);
    console.log('saved');
    ok += 1;
  } catch (err) {
    console.log(`FAILED — ${err.message}`);
  }

  await new Promise((r) => setTimeout(r, delayMs));
}

console.log(`\n✅ Done: ${ok} ok, ${skipped} skipped\n`);
