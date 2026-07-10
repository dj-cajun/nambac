import { requireAdmin } from '../adminAuth.js';
import { listAllQuizzes, createQuiz, insertQuestions, insertResults } from '../quizDb.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Key, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (!requireAdmin(req, res)) return;

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

  try {
    if (req.method === 'GET') {
      const quizzes = await listAllQuizzes();
      return res.status(200).json({ quizzes });
    }

    if (req.method === 'POST') {
      const quiz = await createQuiz(body);
      if (body.questions?.length) await insertQuestions(quiz.id, body.questions);
      if (body.results?.length) await insertResults(quiz.id, body.results);
      return res.status(201).json(quiz);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('GET/POST /api/admin/quizzes', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
