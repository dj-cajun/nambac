#!/usr/bin/env node
/**
 * Daily quiz: Gemini → Turso → (optional) push → image backfill.
 * Used locally (`npm run daily:quiz`) and in GitHub Actions.
 *
 * Usage:
 *   npm run daily:quiz
 *   npm run daily:quiz -- --category=Trendy
 *   npm run daily:quiz -- --with-images   # optional cover+results (costly)
 *   npm run daily:quiz -- --no-push
 *   npm run daily:quiz -- --dry-run       # generate + v5.2 validate only (no DB)
 */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { spawn } from 'node:child_process';
import { PROJECT_ROOT } from '../_root.mjs';
import { generateQuizContent, formatQuizForDb, pickDailyCategory, validateQuizPayload } from '../../api/_lib/geminiQuiz.js';
import { createFullQuiz } from '../../api/_lib/quizDb.js';
import { sendPushToAll } from '../../api/_lib/pushService.js';
import { buildSiteUrl } from '../../api/_lib/siteUrl.js';

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });
dotenv.config({ path: path.join(PROJECT_ROOT, '.env.local'), override: true });

const argv = process.argv.slice(2);

function hasFlag(name) {
  return argv.includes(name);
}

function getArg(name) {
  const eq = argv.find((a) => a.startsWith(`${name}=`));
  if (eq) return eq.split('=').slice(1).join('=');
  const idx = argv.indexOf(name);
  if (idx >= 0 && argv[idx + 1] && !argv[idx + 1].startsWith('--')) return argv[idx + 1];
  return '';
}

function runNodeScript(scriptPath, scriptArgs) {
  return new Promise((resolve, reject) => {
    const proc = spawn(process.execPath, [scriptPath, ...scriptArgs], {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
      env: process.env,
    });
    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${path.basename(scriptPath)} exited with code ${code}`));
    });
  });
}

async function main() {
  const category = getArg('--category') || pickDailyCategory();
  const topic = getArg('--topic');
  const skipPush = hasFlag('--no-push');
  const skipImages = !hasFlag('--with-images');
  const dryRun = hasFlag('--dry-run');

  if (!dryRun) {
    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
      console.error('❌ TURSO_DATABASE_URL / TURSO_AUTH_TOKEN missing');
      process.exit(1);
    }
  }
  if (!process.env.GEMINI_API_KEY && !process.env.VITE_GEMINI_API_KEY && !process.env.OPENROUTER_API_KEY) {
    console.error('❌ GEMINI_API_KEY or OPENROUTER_API_KEY required');
    process.exit(1);
  }

  console.log(`📅 Daily quiz — category: ${category}${dryRun ? ' [DRY-RUN]' : ''}`);

  const generated = await generateQuizContent(category, topic);
  const payload = formatQuizForDb(generated);
  const aiValidateOpts = { enforceMax: true, enforceVi: true };
  const validationErrors = validateQuizPayload(payload, aiValidateOpts);
  if (validationErrors.length) {
    throw new Error(`Invalid quiz from Gemini: ${validationErrors.join('; ')}`);
  }

  if (dryRun) {
    const resultDescLens = payload.results.map((r) => (r.description || '').length);
    console.log('\n✅ Dry-run passed (v5.2 MZ limits + VI check)');
    console.log(`   title: ${payload.title}`);
    console.log(`   category: ${payload.category}`);
    console.log(`   result desc lengths: ${resultDescLens.join(', ')} (min ${Math.min(...resultDescLens)}, max ${Math.max(...resultDescLens)})`);
    console.log('   (not saved to Turso)\n');
    return;
  }

  const quiz = await createFullQuiz(payload);
  console.log('✅ Quiz saved:', payload.title);
  console.log('   ID:', quiz.id);

  if (!skipPush) {
    try {
      const site = buildSiteUrl();
      const push = await sendPushToAll({
        title: '🆕 Quiz mới trên nambac!',
        body: payload.title,
        url: `${site}/quiz/${quiz.id}`,
        tag: `quiz-${quiz.id}`,
      });
      console.log('📣 Push:', push?.sent != null ? `${push.sent} sent` : push);
    } catch (err) {
      console.warn('⚠️ Push skipped:', err.message);
    }
  }

  if (!skipImages) {
    console.log('🖼️  Backfilling images…');
    await runNodeScript('scripts/images/backfill_images.mjs', [
      `--quiz-id=${quiz.id}`,
      '--max-quizzes=1',
      '--delay=4000',
      '--skip-questions',
    ]);
    console.log('✅ Images backfilled');
  }

  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `quiz_id=${quiz.id}\n`);
  }
  console.log(`QUIZ_ID=${quiz.id}`);
}

main().catch((err) => {
  console.error('❌ Daily quiz failed:', err.message || err);
  process.exit(1);
});
