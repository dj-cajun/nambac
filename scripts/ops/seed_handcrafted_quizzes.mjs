#!/usr/bin/env node
/**
 * Insert handcrafted quizzes (no AI) into Turso.
 * Usage: npm run seed:quizzes
 *        npm run seed:quizzes -- --images=cover
 */
import dotenv from 'dotenv';
import path from 'path';
import { spawn } from 'node:child_process';
import { PROJECT_ROOT } from '../_root.mjs';
import { HANDCRAFTED_QUIZZES } from '../../shared/handcraftedQuizzes.js';
import { validateQuizPayload } from '../../shared/quizPrompts.js';
import { createFullQuiz } from '../../api/_lib/quizDb.js';
import { getTurso } from '../../api/_lib/turso.js';

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });
dotenv.config({ path: path.join(PROJECT_ROOT, '.env.local'), override: true });

const argv = process.argv.slice(2);
const imagesMode = argv.find((a) => a.startsWith('--images='))?.split('=')[1] || 'none';

function runNodeScript(scriptPath, scriptArgs) {
  return new Promise((resolve, reject) => {
    const proc = spawn(process.execPath, [scriptPath, ...scriptArgs], {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
      env: process.env,
    });
    proc.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`exit ${code}`))));
  });
}

async function main() {
  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    console.error('❌ TURSO_* missing');
    process.exit(1);
  }

  console.log(`\n✍️  Handcrafted quizzes — ${HANDCRAFTED_QUIZZES.length} to insert\n`);

  const db = getTurso();
  const existingRs = await db.execute({ sql: 'SELECT title FROM quizzes', args: [] });
  const existingTitles = new Set(existingRs.rows.map((r) => String(r.title || '').trim()));

  const created = [];
  let failed = 0;
  let skipped = 0;

  for (const [i, payload] of HANDCRAFTED_QUIZZES.entries()) {
    process.stdout.write(`  [${i + 1}/${HANDCRAFTED_QUIZZES.length}] ${payload.category} … `);
    if (existingTitles.has(payload.title.trim())) {
      skipped += 1;
      console.log('⏭️  already exists');
      continue;
    }
    const errors = validateQuizPayload(payload);
    if (errors.length) {
      failed += 1;
      console.log(`❌ validation: ${errors[0]}`);
      continue;
    }
    try {
      const quiz = await createFullQuiz(payload);
      created.push({ id: quiz.id, title: payload.title, category: payload.category });
      console.log(`✅ ${payload.title.slice(0, 42)} (${quiz.id.slice(0, 8)})`);
    } catch (err) {
      failed += 1;
      console.log(`❌ ${err.message}`);
    }
  }

  console.log(`\n📝 Done: ${created.length} inserted, ${skipped} skipped, ${failed} failed\n`);

  const coverTargets = created.length
    ? created
    : imagesMode !== 'none'
      ? await resolveHandcraftedQuizzesForCovers()
      : [];

  if (imagesMode !== 'none' && coverTargets.length) {
    console.log(`🖼️  Cover backfill (${coverTargets.length} quiz)…\n`);
    for (const [i, q] of coverTargets.entries()) {
      console.log(`  🎨 [${i + 1}/${coverTargets.length}] ${q.title?.slice(0, 40)}`);
      try {
        await runNodeScript('scripts/images/backfill_images.mjs', [
          `--quiz-id=${q.id}`,
          '--max-quizzes=1',
          '--delay=4000',
          '--skip-questions',
          '--cover-only',
        ]);
      } catch (err) {
        console.warn(`  ⚠️  cover failed ${q.id.slice(0, 8)}: ${err.message}`);
      }
    }
  }

  const listed = created.length ? created : coverTargets;
  for (const q of listed) console.log(`   · [${q.category}] /quiz/${q.id}`);
  console.log('');
}

async function resolveHandcraftedQuizzesForCovers() {
  const db = getTurso();
  const out = [];
  for (const payload of HANDCRAFTED_QUIZZES) {
    const rs = await db.execute({
      sql: 'SELECT id, title, category, image_url FROM quizzes WHERE title = ? AND is_active = 1 LIMIT 1',
      args: [payload.title.trim()],
    });
    if (!rs.rows[0]) continue;
    const row = rs.rows[0];
    const imageUrl = row.image_url;
    const needsCover = !imageUrl || String(imageUrl).includes('default_cover') || String(imageUrl).includes('placeholder');
    if (needsCover) {
      out.push({ id: row.id, title: row.title, category: row.category || payload.category });
    }
  }
  return out;
}

main().catch((err) => {
  console.error('❌', err.message || err);
  process.exit(1);
});
