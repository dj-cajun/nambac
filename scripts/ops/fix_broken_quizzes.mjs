#!/usr/bin/env node
/**
 * Regenerate broken quizzes (empty / placeholder A/B) via Gemini.
 * Run: npm run fix:quizzes
 */
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { PROJECT_ROOT } from '../_root.mjs';

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });
dotenv.config({ path: path.join(PROJECT_ROOT, '.env.local'), override: true });

const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  console.error('❌ GEMINI_API_KEY required');
  process.exit(1);
}

const {
  generateQuizContent,
  formatQuizForDb,
  validateQuizPayload,
} = await import('../../shared/quizPrompts.js');

const { getTurso, rowToQuiz } = await import('../../api/_lib/turso.js');
const {
  deleteQuiz,
  updateQuiz,
} = await import('../../api/_lib/quizDb.js');

const PLANS = [
  { prefix: '63c1dba1', action: 'delete', label: 'Quiz mới nambac (empty)' },
  {
    prefix: '979c85fe',
    action: 'regenerate',
    category: 'Lookalike',
    topic: 'Xem tướng mặt bạn giống ai ở Sài Gòn — quizz tướng mặt hài hước',
  },
  {
    prefix: 'dd8131c1',
    action: 'regenerate',
    category: 'Trendy',
    topic: 'Trà sữa Sài Gòn — bạn sành đến đâu?',
  },
];

async function findQuizByPrefix(prefix) {
  const db = getTurso();
  const rs = await db.execute({
    sql: 'SELECT * FROM quizzes WHERE id LIKE ? LIMIT 1',
    args: [`${prefix}%`],
  });
  return rs.rows[0] ? rowToQuiz(rs.rows[0]) : null;
}

async function replaceQuestionsAndResults(quizId, questions, results) {
  const db = getTurso();
  await db.execute({ sql: 'DELETE FROM questions WHERE quiz_id = ?', args: [quizId] });
  await db.execute({ sql: 'DELETE FROM results WHERE quiz_id = ?', args: [quizId] });

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    await db.execute({
      sql: `INSERT INTO questions
        (id, quiz_id, order_number, question_text, option_a, option_b, score_a, score_b)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        randomUUID(),
        quizId,
        i + 1,
        q.question_text,
        q.option_a,
        q.option_b,
        q.score_a,
        q.score_b,
      ],
    });
  }

  for (const r of results) {
    await db.execute({
      sql: `INSERT INTO results
        (id, quiz_id, result_code, title, type_name, description, traits, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        randomUUID(),
        quizId,
        r.result_code,
        r.title,
        r.type_name,
        r.description,
        JSON.stringify(r.traits || []),
        '/images/default_cover.png',
      ],
    });
  }
}

async function quizNeedsFix(quizId) {
  const db = getTurso();
  const qRs = await db.execute({
    sql: 'SELECT option_a, option_b FROM questions WHERE quiz_id = ?',
    args: [quizId],
  });
  if (qRs.rows.length === 0) return true;
  return qRs.rows.some((r) => {
    const a = r.option_a?.trim();
    const b = r.option_b?.trim();
    return !a || !b || (/^[ABab]$/.test(a) && /^[ABab]$/.test(b));
  });
}

async function regenerateQuiz(quiz, category, topic) {
  const maxAttempts = 3;
  let lastErr;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`   Gemini (${category}) attempt ${attempt}/${maxAttempts}...`);
      const raw = await generateQuizContent({ apiKey, categoryId: category, customTopic: topic });
      const payload = formatQuizForDb(raw);
      const errors = validateQuizPayload(payload);
      if (errors.length) throw new Error(`Validation: ${errors.join('; ')}`);

      await replaceQuestionsAndResults(quiz.id, payload.questions, payload.results);

      if (payload.title && payload.title !== 'Quiz mới nambac') {
        await updateQuiz(quiz.id, {
          title: payload.title,
          description: payload.description || quiz.description,
          category: payload.category,
          image_url: quiz.image_url || '/images/default_cover.png',
        });
      }

      console.log(`   ✅ ${payload.questions.length}Q + ${payload.results.length}R — "${payload.title}"`);
      payload.questions.forEach((q, i) => {
        console.log(`      Q${i + 1} A: ${q.option_a.slice(0, 35)}… | B: ${q.option_b.slice(0, 35)}…`);
      });
      return;
    } catch (e) {
      lastErr = e;
      console.log(`   ⚠ attempt ${attempt}: ${e.message}`);
    }
  }

  throw lastErr;
}

async function main() {
  console.log('\n🔧 Fix broken quizzes\n');

  for (const plan of PLANS) {
    const quiz = await findQuizByPrefix(plan.prefix);
    if (!quiz) {
      console.log(`⏭  [${plan.prefix}] not found — skip`);
      continue;
    }

    console.log(`📋 [${quiz.id.slice(0, 8)}] ${quiz.title}`);

    if (plan.action === 'delete') {
      await deleteQuiz(quiz.id);
      console.log('   🗑  deleted\n');
      continue;
    }

    if (!(await quizNeedsFix(quiz.id))) {
      console.log('   ✓ already OK — skip\n');
      continue;
    }

    try {
      await regenerateQuiz(quiz, plan.category, plan.topic);
      console.log('');
    } catch (e) {
      console.error(`   ❌ ${e.message}\n`);
    }
  }

  console.log('Done.\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
