/**
 * Backfill quiz images: Gemini prompts + Imagen (multi-key) → Flux fallback → WebP.
 * Cover + 8 results = 9 images per quiz (question images off by default).
 *
 * Run: npm run images:backfill
 * Options: --dry-run  --limit=50  --max-quizzes=1  --quiz-id=xxx  --delay=3500  --force
 *          --with-questions  --results-only  --cover-only
 */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PROJECT_ROOT } from '../_root.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });
dotenv.config({ path: path.join(PROJECT_ROOT, '.env.local'), override: true });

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const force = args.includes('--force');
const skipQuestions = args.includes('--skip-questions') || !args.includes('--with-questions');
const resultsOnly = args.includes('--results-only');
const coverOnly = args.includes('--cover-only');
const limitArg = args.find((a) => a.startsWith('--limit='));
const maxQuizzesArg = args.find((a) => a.startsWith('--max-quizzes='));
const quizIdArg = args.find((a) => a.startsWith('--quiz-id='));
const delayArg = args.find((a) => a.startsWith('--delay='));
const imageLimit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 9999;
const maxQuizzes = maxQuizzesArg ? parseInt(maxQuizzesArg.split('=')[1], 10) : 999;
const filterQuizId = quizIdArg ? quizIdArg.split('=')[1] : null;
const delayMs = delayArg ? parseInt(delayArg.split('=')[1], 10) : 3500;
const clearForceProgress = args.includes('--clear-force-progress');

const PROGRESS_FILE = path.join(PROJECT_ROOT, '.backfill-force-progress.json');

const PLACEHOLDER_PATTERNS = ['default_cover', 'grandma_roast', 'placeholder', 'img_177'];

function isPlaceholder(url) {
  if (!url) return true;
  const lower = url.toLowerCase();
  return PLACEHOLDER_PATTERNS.some((p) => lower.includes(p));
}

function imagePathFromUrl(url) {
  if (!url) return null;
  const filename = url.split('/').pop()?.split('?')[0];
  if (!filename) return null;
  return path.join(PROJECT_ROOT, 'public', 'images', filename);
}

function fileMissing(url) {
  const fp = imagePathFromUrl(url);
  if (!fp) return true;
  return !fs.existsSync(fp);
}

function loadForceDoneSet() {
  try {
    const data = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    return new Set(data.quizIds || []);
  } catch {
    return new Set();
  }
}

function markForceDone(quizId, forceDoneSet) {
  forceDoneSet.add(quizId);
  fs.writeFileSync(
    PROGRESS_FILE,
    JSON.stringify({ quizIds: [...forceDoneSet], updatedAt: new Date().toISOString() }, null, 2),
  );
}

function needsImage(url, forceRegen = false) {
  if (isPlaceholder(url) || fileMissing(url)) return true;
  if (forceRegen && url?.includes('backfill_')) return true;
  if (forceRegen && url?.includes('_q')) return true;
  if (forceRegen && url?.includes('_r')) return true;
  if (forceRegen && url?.includes('_cover')) return true;
  return false;
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const { getGeminiKeys } = await import('../../shared/geminiKeys.js');

  if (!process.env.OPENROUTER_API_KEY && getGeminiKeys().length === 0) {
    console.error('❌ OPENROUTER_API_KEY or GEMINI_API_KEY required for image generation');
    process.exit(1);
  }
  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    console.error('❌ TURSO_* required');
    process.exit(1);
  }

  const { getTurso, rowToQuiz, rowToQuestion, rowToResult } = await import('../../api/_lib/turso.js');
  const { generateQuizImagePrompts } = await import('../../shared/imagePromptEngine.js');
  const { getOpenRouterTextModel } = await import('../../shared/openrouterText.js');
  const { finalizeImagePrompt, finalizeQuestionImagePrompt, finalizeResultImagePrompt } = await import('../../shared/imagePrompts.js');
  const { generateQuizImage } = await import('../../api/_lib/generateQuizImage.js');
  const { saveImageB64AsWebp } = await import('../../api/_lib/saveQuizImage.js');

  const db = getTurso();
  let sql = `SELECT * FROM quizzes WHERE is_active = 1 ORDER BY datetime(created_at) DESC`;
  const queryArgs = [];
  if (filterQuizId) {
    sql = 'SELECT * FROM quizzes WHERE id = ? LIMIT 1';
    queryArgs.push(filterQuizId);
  }
  const quizzesRs = await db.execute({ sql, args: queryArgs });
  const quizzes = quizzesRs.rows.map(rowToQuiz);

  if (clearForceProgress && fs.existsSync(PROGRESS_FILE)) {
    fs.unlinkSync(PROGRESS_FILE);
    console.log('🗑️  Cleared force-progress file\n');
  }

  const forceDoneSet = force ? loadForceDoneSet() : new Set();
  let generated = 0;
  let skipped = 0;
  let quizzesTouched = 0;

  console.log(
    `\n🖼️  Image backfill (Gemini→OpenRouter prompts + manga) ${dryRun ? '(DRY RUN)' : ''}${force ? ' [FORCE]' : ''}`,
  );
  console.log(`   ${quizzes.length} quiz(es), max ${maxQuizzes}/run, delay ${delayMs}ms\n`);

  for (const quiz of quizzes) {
    if (quizzesTouched >= maxQuizzes) break;
    if (force && !resultsOnly && forceDoneSet.has(quiz.id)) {
      skipped++;
      continue;
    }

    const [questionsRs, resultsRs] = await Promise.all([
      db.execute({
        sql: 'SELECT * FROM questions WHERE quiz_id = ? ORDER BY order_number ASC',
        args: [quiz.id],
      }),
      db.execute({
        sql: 'SELECT * FROM results WHERE quiz_id = ? ORDER BY result_code ASC',
        args: [quiz.id],
      }),
    ]);
    const questions = questionsRs.rows.map(rowToQuestion);
    const results = resultsRs.rows.map(rowToResult);

    const coverNeeded = !resultsOnly && needsImage(quiz.image_url, force);
    const questionsNeeded = !resultsOnly && !coverOnly && !skipQuestions
      ? questions.filter((q) => needsImage(q.image_url, force))
      : [];
    const resultsNeeded = !coverOnly
      ? results.filter((r) => needsImage(r.image_url, force))
      : [];

    if (!coverNeeded && questionsNeeded.length === 0 && resultsNeeded.length === 0) {
      skipped++;
      continue;
    }

    quizzesTouched++;
    console.log(`📦 [${quizzesTouched}/${maxQuizzes}] ${quiz.title?.slice(0, 50)} (${quiz.id.slice(0, 8)})`);
    if (coverNeeded) console.log('   → cover');
    if (questionsNeeded.length) console.log(`   → ${questionsNeeded.length} question(s)`);
    if (resultsNeeded.length) console.log(`   → ${resultsNeeded.length} result(s)`);

    if (dryRun) continue;

    let prompts;
    try {
      const generated = await generateQuizImagePrompts({
        geminiKey: getGeminiKeys()[0],
        openrouterKey: process.env.OPENROUTER_API_KEY,
        quiz: { ...quiz, questions, results },
        skipQuestions,
      });
      prompts = {
        cover: finalizeImagePrompt(generated.cover),
        questions: skipQuestions ? [] : generated.questions.map(finalizeQuestionImagePrompt),
        results: generated.results.map((p, i) =>
          finalizeResultImagePrompt(p, {
            resultCode: i,
            quizTitle: quiz.title,
            category: quiz.category,
          }),
        ),
      };
      const promptCount = 1 + prompts.questions.length + prompts.results.length;
      const providerLabel = generated.provider === 'openrouter'
        ? `OpenRouter (${getOpenRouterTextModel()})`
        : 'Gemini';
      console.log(`   🧠 ${providerLabel} wrote ${promptCount} unique prompts`);
    } catch (e) {
      console.error(`   ❌ Image prompts: ${e.message}`);
      continue;
    }

    const prefix = `backfill_${quiz.id.slice(0, 8)}`;
    const saveImage = (b64, name) => saveImageB64AsWebp(b64, name);

    if (coverNeeded && generated < imageLimit) {
      try {
        const { b64, cost, provider } = await generateQuizImage(prompts.cover);
        const imageUrl = await saveImage(b64, `${prefix}_cover`);
        await db.execute({ sql: 'UPDATE quizzes SET image_url = ? WHERE id = ?', args: [imageUrl, quiz.id] });
        console.log(`   ✅ cover → ${imageUrl} (${provider}${cost != null ? ` $${cost}` : ''})`);
        generated++;
        await sleep(delayMs);
      } catch (e) {
        console.error(`   ❌ cover: ${e.message}`);
      }
    }

    for (const q of questionsNeeded) {
      if (generated >= imageLimit) break;
      const idx = (q.order_number || 1) - 1;
      if (idx < 0 || idx > 4) continue;
      try {
        const { b64, cost, provider } = await generateQuizImage(prompts.questions[idx]);
        const imageUrl = await saveImage(b64, `${prefix}_q${idx + 1}`);
        await db.execute({ sql: 'UPDATE questions SET image_url = ? WHERE id = ?', args: [imageUrl, q.id] });
        console.log(`   ✅ Q${idx + 1} → ${imageUrl} (${provider}${cost != null ? ` $${cost}` : ''})`);
        generated++;
        await sleep(delayMs);
      } catch (e) {
        console.error(`   ❌ Q${idx + 1}: ${e.message}`);
      }
    }

    for (const r of resultsNeeded) {
      if (generated >= imageLimit) break;
      const code = r.result_code ?? 0;
      if (code < 0 || code > 7) continue;
      try {
        const { b64, cost, provider } = await generateQuizImage(prompts.results[code]);
        const imageUrl = await saveImage(b64, `${prefix}_r${code}`);
        await db.execute({ sql: 'UPDATE results SET image_url = ? WHERE id = ?', args: [imageUrl, r.id] });
        console.log(`   ✅ result ${code} → ${imageUrl} (${provider}${cost != null ? ` $${cost}` : ''})`);
        generated++;
        await sleep(delayMs);
      } catch (e) {
        console.error(`   ❌ result ${code}: ${e.message}`);
      }
    }

    if (force && !resultsOnly) markForceDone(quiz.id, forceDoneSet);
  }

  console.log(`\n📊 Done: ${generated} images, ${quizzesTouched} quiz(es), ${skipped} skipped\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
