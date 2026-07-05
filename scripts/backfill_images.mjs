/**
 * Backfill missing quiz cover + result images via OpenRouter
 * Run: npm run images:backfill
 * Options: --dry-run  --limit=50  --max-quizzes=1  --quiz-id=xxx  --delay=3500
 */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

dotenv.config({ path: path.join(root, '.env') });
dotenv.config({ path: path.join(root, '.env.local'), override: true });

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const limitArg = args.find((a) => a.startsWith('--limit='));
const maxQuizzesArg = args.find((a) => a.startsWith('--max-quizzes='));
const quizIdArg = args.find((a) => a.startsWith('--quiz-id='));
const delayArg = args.find((a) => a.startsWith('--delay='));
const imageLimit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 9999;
const maxQuizzes = maxQuizzesArg ? parseInt(maxQuizzesArg.split('=')[1], 10) : 999;
const filterQuizId = quizIdArg ? quizIdArg.split('=')[1] : null;
const delayMs = delayArg ? parseInt(delayArg.split('=')[1], 10) : 3500;

const PLACEHOLDER_PATTERNS = [
  'default_cover',
  'grandma_roast',
  'placeholder',
  'img_1770', // old generated batch without real content — optional skip
];

function isPlaceholder(url) {
  if (!url) return true;
  const lower = url.toLowerCase();
  return PLACEHOLDER_PATTERNS.some((p) => lower.includes(p));
}

function imagePathFromUrl(url) {
  if (!url) return null;
  const filename = url.split('/').pop()?.split('?')[0];
  if (!filename) return null;
  return path.join(root, 'public', 'images', filename);
}

function fileMissing(url) {
  const fp = imagePathFromUrl(url);
  if (!fp) return true;
  return !fs.existsSync(fp);
}

function needsImage(url) {
  return isPlaceholder(url) || fileMissing(url);
}

function saveImage(b64, prefix) {
  const filename = `${prefix}_${Date.now()}.png`;
  const fp = path.join(root, 'public', 'images', filename);
  fs.writeFileSync(fp, Buffer.from(b64, 'base64'));
  return `/images/${filename}`;
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('❌ OPENROUTER_API_KEY required (.env.local)');
    process.exit(1);
  }
  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    console.error('❌ TURSO_* required');
    process.exit(1);
  }

  const { getTurso, rowToQuiz, rowToResult } = await import('../api/_lib/turso.js');
  const { generateOpenRouterImage } = await import('../api/_lib/openrouterImage.js');

  const db = getTurso();
  let sql = `SELECT * FROM quizzes WHERE is_active = 1 ORDER BY datetime(created_at) DESC`;
  const queryArgs = [];
  if (filterQuizId) {
    sql = 'SELECT * FROM quizzes WHERE id = ? LIMIT 1';
    queryArgs.push(filterQuizId);
  }
  const quizzesRs = await db.execute({ sql, args: queryArgs });
  const quizzes = quizzesRs.rows.map(rowToQuiz);

  let generated = 0;
  let skipped = 0;
  let quizzesTouched = 0;

  console.log(`\n🖼️  Image backfill ${dryRun ? '(DRY RUN)' : ''} — ${quizzes.length} quiz(es), max ${maxQuizzes} quiz/run, delay ${delayMs}ms\n`);

  for (const quiz of quizzes) {
    if (quizzesTouched >= maxQuizzes) break;

    const resultsRs = await db.execute({
      sql: 'SELECT * FROM results WHERE quiz_id = ? ORDER BY result_code ASC',
      args: [quiz.id],
    });
    const results = resultsRs.rows.map(rowToResult);

    const coverNeeded = needsImage(quiz.image_url);
    const resultsNeeded = results.filter((r) => needsImage(r.image_url));

    if (!coverNeeded && resultsNeeded.length === 0) {
      skipped++;
      continue;
    }

    quizzesTouched++;
    console.log(`📦 [${quizzesTouched}/${maxQuizzes}] ${quiz.title?.slice(0, 50)} (${quiz.id.slice(0, 8)})`);
    if (coverNeeded) console.log('   → cover needed');
    if (resultsNeeded.length) console.log(`   → ${resultsNeeded.length} result(s) needed`);

    if (dryRun) continue;

    if (coverNeeded && generated < imageLimit) {
      try {
        const prompt = `Quiz cover. Title: ${quiz.title}. Theme: ${quiz.description || quiz.category}. Korean webtoon style, no text.`;
        const { b64, cost } = await generateOpenRouterImage(
          `Korean webtoon manhwa style cover. ${prompt} Professional cover, vibrant, no letters.`,
        );
        const imageUrl = saveImage(b64, `backfill_cover_${quiz.id.slice(0, 8)}`);
        await db.execute({
          sql: 'UPDATE quizzes SET image_url = ? WHERE id = ?',
          args: [imageUrl, quiz.id],
        });
        console.log(`   ✅ cover → ${imageUrl} ($${cost ?? '?'})`);
        generated++;
        await sleep(delayMs);
      } catch (e) {
        console.error(`   ❌ cover: ${e.message}`);
      }
    }

    for (const r of resultsNeeded) {
      if (generated >= imageLimit) break;
      try {
        const title = r.type_name || r.title || `Result ${r.result_code}`;
        const prompt = `Character portrait left side. ${title}. ${r.description || ''}. Korean webtoon, no text.`;
        const { b64, cost } = await generateOpenRouterImage(
          `Korean webtoon manhwa style. ${prompt} No letters, no numbers.`,
        );
        const imageUrl = saveImage(b64, `backfill_r${r.result_code}_${quiz.id.slice(0, 8)}`);
        await db.execute({
          sql: 'UPDATE results SET image_url = ? WHERE id = ?',
          args: [imageUrl, r.id],
        });
        console.log(`   ✅ result ${r.result_code} → ${imageUrl} ($${cost ?? '?'})`);
        generated++;
        await sleep(delayMs);
      } catch (e) {
        console.error(`   ❌ result ${r.result_code}: ${e.message}`);
      }
    }
  }

  console.log(`\n📊 Done: ${generated} images, ${quizzesTouched} quiz(es) processed, ${skipped} already OK\n`);
  if (dryRun) console.log('Re-run without --dry-run to apply.\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
