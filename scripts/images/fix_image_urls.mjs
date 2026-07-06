/**
 * Point quiz/result image_url at files that exist in public/images.
 * Use when DB was updated by remote backfill but local/git has older webp names.
 *
 * Run: node scripts/images/fix_image_urls.mjs
 *      node scripts/images/fix_image_urls.mjs --dry-run
 */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { PROJECT_ROOT } from '../_root.mjs';

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });
dotenv.config({ path: path.join(PROJECT_ROOT, '.env.local'), override: true });

const dryRun = process.argv.includes('--dry-run');
const imagesDir = path.join(PROJECT_ROOT, 'public/images');
const allFiles = fs.readdirSync(imagesDir);

function existsPublic(url) {
  if (!url) return false;
  const fn = url.split('/').pop();
  return fn && fs.existsSync(path.join(imagesDir, fn));
}

function findByQuizId(quizId, kind, resultCode = null) {
  const short = quizId.replace(/-/g, '').slice(0, 8);
  const pool = allFiles.filter((f) => {
    if (!f.includes(short)) return false;
    if (kind === 'cover') return /cover/i.test(f);
    if (kind === 'result') {
      return (
        f.includes(`_r${resultCode}_`)
        || f.includes(`_result_${resultCode}_`)
        || f.includes(`_r${resultCode}.`)
      );
    }
    if (kind === 'question') return /_q\d/i.test(f);
    return false;
  });
  return pool.length ? `/images/${pool.sort().pop()}` : null;
}

function findByUrlPrefix(currentUrl, kind, resultCode = null) {
  const prefix = currentUrl?.match(/backfill_([a-f0-9]+)_/)?.[1];
  if (!prefix) return null;
  const pool = allFiles.filter((f) => {
    if (!f.includes(prefix)) return false;
    if (kind === 'cover') return /cover/i.test(f);
    if (kind === 'result') {
      return f.includes(`_r${resultCode}_`) || f.includes(`_result_${resultCode}_`);
    }
    return false;
  });
  return pool.length ? `/images/${pool.sort().pop()}` : null;
}

function resolveUrl(quizId, currentUrl, kind, resultCode = null) {
  if (existsPublic(currentUrl)) return null;
  return findByQuizId(quizId, kind, resultCode) || findByUrlPrefix(currentUrl, kind, resultCode);
}

async function main() {
  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    console.error('❌ TURSO_* required');
    process.exit(1);
  }

  const { getTurso } = await import('../../api/_lib/turso.js');
  const db = getTurso();

  let coverFixed = 0;
  let resultFixed = 0;

  const quizzes = (await db.execute({ sql: 'SELECT id, image_url FROM quizzes WHERE is_active = 1' })).rows;
  for (const q of quizzes) {
    const fixed = resolveUrl(q.id, q.image_url, 'cover');
    if (!fixed) continue;
    console.log(`${dryRun ? '[dry] ' : ''}cover ${q.id.slice(0, 8)} → ${fixed.split('/').pop()}`);
    if (!dryRun) {
      await db.execute({ sql: 'UPDATE quizzes SET image_url = ? WHERE id = ?', args: [fixed, q.id] });
    }
    coverFixed += 1;
  }

  const results = (await db.execute({ sql: 'SELECT id, quiz_id, result_code, image_url FROM results' })).rows;
  for (const r of results) {
    const fixed = resolveUrl(r.quiz_id, r.image_url, 'result', r.result_code);
    if (!fixed) continue;
    if (!dryRun) {
      await db.execute({ sql: 'UPDATE results SET image_url = ? WHERE id = ?', args: [fixed, r.id] });
    }
    resultFixed += 1;
  }

  console.log(`\n${dryRun ? 'Would fix' : 'Fixed'}: ${coverFixed} covers, ${resultFixed} results`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
