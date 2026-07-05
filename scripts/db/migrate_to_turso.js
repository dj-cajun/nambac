import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';
import { getTurso } from '../../api/_lib/turso.js';
import { PROJECT_ROOT } from '../_root.mjs';

dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });
dotenv.config({ path: path.join(PROJECT_ROOT, '.env.local'), override: true });

const loadJson = (filename) => {
  const filePath = path.join(PROJECT_ROOT, 'legacy/backend/data', filename);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

function itemsForQuiz(data, quizId) {
  if (!data) return [];
  if (Array.isArray(data)) return data.filter((item) => item.quiz_id === quizId);
  return data[quizId] || [];
}

async function main() {
  console.log('🚀 Migrating JSON data → Turso...');
  const db = getTurso();

  const quizzes = loadJson('quizzes.json') || [];
  const questionsData = loadJson('questions.json') || {};
  const resultsData = loadJson('results.json') || {};

  console.log(`Found ${quizzes.length} quizzes`);

  for (const quiz of quizzes) {
    console.log(`→ ${quiz.title}`);

    await db.execute({
      sql: `INSERT OR REPLACE INTO quizzes
        (id, title, description, category, quiz_type, image_url, config, design, is_active, status, view_count, share_count, participant_count, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        quiz.id,
        quiz.title,
        quiz.description || null,
        quiz.category || null,
        quiz.quiz_type || 'binary_5q',
        quiz.image_url || null,
        quiz.config ? JSON.stringify(quiz.config) : null,
        quiz.design ? JSON.stringify(quiz.design) : null,
        quiz.is_active === false ? 0 : 1,
        quiz.status || 'active',
        quiz.view_count || 0,
        quiz.share_count || 0,
        quiz.participant_count || 0,
        quiz.created_at || new Date().toISOString(),
      ],
    });

    const questions = itemsForQuiz(questionsData, quiz.id);
    for (const q of questions) {
      await db.execute({
        sql: `INSERT OR REPLACE INTO questions
          (id, quiz_id, order_number, question_text, option_a, option_b, score_a, score_b, image_url, dimension, options)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          q.id || randomUUID(),
          quiz.id,
          q.order_number || 1,
          q.question_text || q.text || '',
          q.option_a || q.choice_a || 'A',
          q.option_b || q.choice_b || 'B',
          q.score_a ?? 0,
          q.score_b ?? 0,
          q.image_url || null,
          q.dimension || null,
          q.options ? JSON.stringify(q.options) : null,
        ],
      });
    }

    const results = itemsForQuiz(resultsData, quiz.id);
    for (const r of results) {
      await db.execute({
        sql: `INSERT OR REPLACE INTO results
          (id, quiz_id, result_code, title, type_name, description, traits, image_url)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          r.id || randomUUID(),
          quiz.id,
          parseInt(r.result_code ?? r.score ?? 0),
          r.title || r.type_name || 'Result',
          r.type_name || r.title || null,
          r.description || null,
          r.traits ? JSON.stringify(r.traits) : null,
          r.image_url || null,
        ],
      });
    }
  }

  console.log('✅ Migration complete');
}

main().catch((err) => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
