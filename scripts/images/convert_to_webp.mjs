/**
 * Batch-convert quiz PNG/JPEG assets to WebP and update Turso image_url fields.
 * Covers, result cards, and question images are all handled.
 *
 * Run: npm run images:webp
 * Options: --dry-run  --keep-png  --skip-db
 */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { PROJECT_ROOT } from '../_root.mjs';
import { convertFileToWebp, IMAGES_DIR } from '../../api/_lib/saveQuizImage.js';

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });
dotenv.config({ path: path.join(PROJECT_ROOT, '.env.local'), override: true });

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const keepPng = args.includes('--keep-png');
const skipDb = args.includes('--skip-db');

/** Static site assets — do not convert. */
const SKIP_BASENAMES = new Set([
  'default_cover.png',
  'grandma_roast_standing.png',
  'logo.png',
]);

function formatBytes(n) {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)} GB`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)} MB`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)} KB`;
  return `${n} B`;
}

function listConvertibleImages() {
  if (!fs.existsSync(IMAGES_DIR)) return [];
  return fs
    .readdirSync(IMAGES_DIR)
    .filter((name) => /\.(png|jpe?g)$/i.test(name))
    .filter((name) => !SKIP_BASENAMES.has(name.toLowerCase()))
    .map((name) => path.join(IMAGES_DIR, name));
}

async function updateDbUrl(db, oldUrl, newUrl) {
  const tables = [
    { sql: 'UPDATE quizzes SET image_url = ? WHERE image_url = ?', label: 'quizzes' },
    { sql: 'UPDATE questions SET image_url = ? WHERE image_url = ?', label: 'questions' },
    { sql: 'UPDATE results SET image_url = ? WHERE image_url = ?', label: 'results' },
  ];
  let rows = 0;
  for (const { sql, label } of tables) {
    const rs = await db.execute({ sql, args: [newUrl, oldUrl] });
    const n = rs.rowsAffected ?? 0;
    if (n) console.log(`      DB ${label}: ${n} row(s) ${oldUrl} → ${newUrl}`);
    rows += n;
  }
  return rows;
}

async function main() {
  const files = listConvertibleImages();
  if (!files.length) {
    console.log('✅ No PNG/JPEG quiz images to convert.');
    return;
  }

  let db = null;
  if (!skipDb) {
    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
      console.error('❌ TURSO_* required (or pass --skip-db)');
      process.exit(1);
    }
    const { getTurso } = await import('../../api/_lib/turso.js');
    db = getTurso();
  }

  console.log(`\n🗜️  WebP batch convert ${dryRun ? '(DRY RUN)' : ''}`);
  console.log(`   ${files.length} file(s), quality 85, max ${1024}px\n`);

  let converted = 0;
  let dbRows = 0;
  let bytesBefore = 0;
  let bytesAfter = 0;
  let errors = 0;

  for (const srcPath of files) {
    const name = path.basename(srcPath);
    const oldUrl = `/images/${name}`;
    const newBasename = name.replace(/\.(png|jpe?g)$/i, '.webp');
    const newUrl = `/images/${newBasename}`;

    if (dryRun) {
      const size = fs.statSync(srcPath).size;
      bytesBefore += size;
      console.log(`   [dry] ${name} (${formatBytes(size)}) → ${newBasename}`);
      converted++;
      continue;
    }

    try {
      const result = await convertFileToWebp(srcPath);
      bytesBefore += result.bytesBefore;
      bytesAfter += result.bytesAfter;
      converted++;

      const pct = result.bytesBefore
        ? Math.round((1 - result.bytesAfter / result.bytesBefore) * 100)
        : 0;
      console.log(
        `   ✅ ${name} ${formatBytes(result.bytesBefore)} → ${formatBytes(result.bytesAfter)} (−${pct}%)`,
      );

      if (db) {
        dbRows += await updateDbUrl(db, oldUrl, newUrl);
      }

      if (!keepPng && result.webpPath !== srcPath) {
        fs.unlinkSync(srcPath);
      }
    } catch (err) {
      errors++;
      console.error(`   ❌ ${name}: ${err.message}`);
    }
  }

  const saved = bytesBefore - bytesAfter;
  const savedPct = bytesBefore ? Math.round((saved / bytesBefore) * 100) : 0;

  console.log('\n---');
  console.log(`   Converted: ${converted}/${files.length}`);
  if (!dryRun) {
    console.log(`   Before:    ${formatBytes(bytesBefore)}`);
    console.log(`   After:     ${formatBytes(bytesAfter)}`);
    console.log(`   Saved:     ${formatBytes(saved)} (−${savedPct}%)`);
    console.log(`   DB rows:   ${dbRows}`);
    if (!keepPng) console.log('   PNG/JPEG originals removed');
  }
  if (errors) {
    console.log(`   Errors:    ${errors}`);
    process.exit(1);
  }
  console.log('');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
