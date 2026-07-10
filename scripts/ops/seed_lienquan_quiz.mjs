#!/usr/bin/env node
/** Seed Liên Quân quiz listing into Turso (redirects to /lienquan/quiz). */
import dotenv from 'dotenv';
import path from 'path';
import { PROJECT_ROOT } from '../_root.mjs';
import { LIENQUAN_QUIZ_DB_SEED, LIENQUAN_QUIZ_DB_TITLE } from '../../shared/lienquan/quizDbSeed.js';
import { createFullQuiz } from '../../api/_lib/quizDb.js';
import { getTurso } from '../../api/_lib/turso.js';

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });
dotenv.config({ path: path.join(PROJECT_ROOT, '.env.local'), override: true });

async function main() {
  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    console.error('❌ TURSO_* missing');
    process.exit(1);
  }

  const db = getTurso();
  const existing = await db.execute({
    sql: 'SELECT id FROM quizzes WHERE title = ? LIMIT 1',
    args: [LIENQUAN_QUIZ_DB_TITLE],
  });

  if (existing.rows[0]?.id) {
    console.log(`⏭️  Already exists: ${existing.rows[0].id}`);
    console.log(`   /quiz/${existing.rows[0].id} → /lienquan/quiz`);
    return;
  }

  const quiz = await createFullQuiz(LIENQUAN_QUIZ_DB_SEED);
  console.log(`✅ Seeded Liên Quân quiz: ${quiz.id}`);
  console.log(`   /quiz/${quiz.id} → /lienquan/quiz`);
}

main().catch((err) => {
  console.error('❌', err.message || err);
  process.exit(1);
});
