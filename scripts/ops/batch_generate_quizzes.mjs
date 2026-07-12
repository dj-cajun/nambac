#!/usr/bin/env node
/**
 * Batch quiz generator — create N quizzes across rotating categories.
 * Gemini/OpenRouter → Turso. Images backfilled after (cover by default).
 *
 * Usage:
 *   npm run gen:quizzes                     # 20 quizzes, cover images
 *   npm run gen:quizzes -- --count=10
 *   npm run gen:quizzes -- --images=full    # cover + 8 results each
 *   npm run gen:quizzes -- --images=none    # text only
 *   npm run gen:quizzes -- --category=Trendy # lock a single category (Tier B — manual only)
 */
import dotenv from 'dotenv';
import path from 'path';
import { spawn } from 'node:child_process';
import { PROJECT_ROOT } from '../_root.mjs';

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });
dotenv.config({ path: path.join(PROJECT_ROOT, '.env.local'), override: true });

// geminiQuiz.getApiKey reads GEMINI_API_KEY only — bridge the VITE_ key for CLI runs.
if (!process.env.GEMINI_API_KEY && process.env.VITE_GEMINI_API_KEY) {
  process.env.GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;
}

const { generateQuizContent, formatQuizForDb, validateQuizPayload, QUIZ_AI_VALIDATE_OPTS } = await import('../../api/_lib/geminiQuiz.js');
const { createFullQuiz } = await import('../../api/_lib/quizDb.js');
const { QUIZ_CATEGORY_IDS } = await import('../../shared/categories.js');
const { DAILY_CATEGORY_IDS } = await import('../../shared/categoryTiers.js');

const argv = process.argv.slice(2);
function getArg(name, fallback = '') {
  const eq = argv.find((a) => a.startsWith(`${name}=`));
  return eq ? eq.split('=').slice(1).join('=') : fallback;
}

const count = parseInt(getArg('--count', '20'), 10) || 20;
const imagesMode = getArg('--images', 'cover'); // cover | full | none
const lockedCategory = getArg('--category', '');
const genDelay = parseInt(getArg('--delay', '2500'), 10) || 2500;

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  console.error('❌ TURSO_DATABASE_URL / TURSO_AUTH_TOKEN missing');
  process.exit(1);
}
if (!process.env.GEMINI_API_KEY && !process.env.OPENROUTER_API_KEY) {
  console.error('❌ GEMINI_API_KEY or OPENROUTER_API_KEY required');
  process.exit(1);
}

function runNodeScript(scriptPath, scriptArgs) {
  return new Promise((resolve, reject) => {
    const proc = spawn(process.execPath, [scriptPath, ...scriptArgs], {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
      env: process.env,
    });
    proc.on('error', reject);
    proc.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`exit ${code}`))));
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  console.log(`\n🎯 Batch quiz generation — target ${count}, images: ${imagesMode}\n`);

  const created = [];
  let failures = 0;

  for (let i = 0; i < count; i += 1) {
    const category = lockedCategory || DAILY_CATEGORY_IDS[i % DAILY_CATEGORY_IDS.length];
    process.stdout.write(`  [${i + 1}/${count}] ${category} … `);
    try {
      const generated = await generateQuizContent(category);
      const payload = formatQuizForDb(generated);
      const errors = validateQuizPayload(payload, QUIZ_AI_VALIDATE_OPTS);
      if (errors.length) throw new Error(errors.join('; '));

      const quiz = await createFullQuiz(payload);
      created.push({ id: quiz.id, title: payload.title, category });
      console.log(`✅ ${payload.title?.slice(0, 48)} (${quiz.id.slice(0, 8)})`);
    } catch (err) {
      failures += 1;
      console.log(`❌ ${err.message}`);
    }
    if (i < count - 1) await sleep(genDelay);
  }

  console.log(`\n📝 Text done: ${created.length} created, ${failures} failed\n`);

  if (imagesMode !== 'none' && created.length) {
    const coverOnly = imagesMode !== 'full';
    console.log(`🖼️  Backfilling images (${coverOnly ? 'cover only' : 'cover + results'})…\n`);
    for (const [i, q] of created.entries()) {
      console.log(`  🎨 [${i + 1}/${created.length}] ${q.title?.slice(0, 40)}`);
      const imgArgs = [
        'scripts/images/backfill_images.mjs',
        `--quiz-id=${q.id}`,
        '--max-quizzes=1',
        '--delay=4000',
        '--skip-questions',
      ];
      if (coverOnly) imgArgs.push('--cover-only');
      try {
        await runNodeScript(imgArgs[0], imgArgs.slice(1));
      } catch (err) {
        console.warn(`  ⚠️  image backfill failed for ${q.id.slice(0, 8)}: ${err.message}`);
      }
    }
  }

  console.log('\n✅ Batch complete.');
  console.log(`   Created ${created.length} quiz(es):`);
  for (const q of created) console.log(`   · [${q.category}] ${q.title} → /quiz/${q.id}`);
  console.log('');
}

main().catch((err) => {
  console.error('❌ Batch generation failed:', err.message || err);
  process.exit(1);
});
