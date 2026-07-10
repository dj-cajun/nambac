#!/usr/bin/env node
/** Sync Liên Quân Explore quiz (5Q binary) questions + results in Turso. */
import dotenv from 'dotenv';
import path from 'path';
import { PROJECT_ROOT } from '../_root.mjs';
import { LIENQUAN_QUIZ_DB_SEED, LIENQUAN_QUIZ_DB_TITLE } from '../../shared/lienquan/quizDbSeed.js';
import { getTurso } from '../../api/_lib/turso.js';

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });
dotenv.config({ path: path.join(PROJECT_ROOT, '.env.local'), override: true });

async function syncQuestions(quizId, questions) {
  const db = getTurso();
  const rs = await db.execute({
    sql: 'SELECT id, order_number FROM questions WHERE quiz_id = ? ORDER BY order_number ASC',
    args: [quizId],
  });

  if (rs.rows.length === 0) {
    console.log('   No questions — run seed:lienquan-quiz first');
    return false;
  }

  for (const row of rs.rows) {
    const q = questions[row.order_number - 1];
    if (!q) continue;
    await db.execute({
      sql: `UPDATE questions
            SET question_text = ?, option_a = ?, option_b = ?, score_a = ?, score_b = ?
            WHERE id = ?`,
      args: [q.question_text, q.option_a, q.option_b, q.score_a, q.score_b, row.id],
    });
    console.log(`   Q${row.order_number} A: ${q.option_a.slice(0, 40)}… | B: ${q.option_b.slice(0, 40)}…`);
  }
  return true;
}

async function syncResults(quizId, results) {
  const db = getTurso();
  for (const r of results) {
    await db.execute({
      sql: `UPDATE results
            SET title = ?, type_name = ?, description = ?, traits = ?
            WHERE quiz_id = ? AND result_code = ?`,
      args: [
        r.title,
        r.type_name,
        r.description,
        JSON.stringify(r.traits || []),
        quizId,
        r.result_code,
      ],
    });
  }
  console.log(`   Updated ${results.length} results`);
}

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
  const quizId = existing.rows[0]?.id;
  if (!quizId) {
    console.error('❌ Liên Quân quiz not found — run npm run seed:lienquan-quiz');
    process.exit(1);
  }

  console.log(`🔧 Fixing Liên Quân quiz ${quizId}\n`);
  const ok = await syncQuestions(quizId, LIENQUAN_QUIZ_DB_SEED.questions);
  if (ok) await syncResults(quizId, LIENQUAN_QUIZ_DB_SEED.results);
  console.log('\n✅ Done');
}

main().catch((err) => {
  console.error('❌', err.message || err);
  process.exit(1);
});
