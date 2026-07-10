import { requireAdmin } from '../adminAuth.js';
import {
  getQuizBundle,
  updateQuiz,
  updateQuizStatus,
  deleteQuiz,
  upsertQuestions,
  upsertResults,
  deleteQuestion,
} from '../quizDb.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Key');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (!requireAdmin(req, res)) return;

  const quizId = req.query?.id;

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

    if (req.method === 'GET') {
      if (!quizId) return res.status(400).json({ error: 'Quiz id required' });
      const bundle = await getQuizBundle(quizId);
      if (!bundle) return res.status(404).json({ error: 'Quiz not found' });
      return res.status(200).json(bundle);
    }

    if (req.method === 'PATCH') {
      if (!quizId) return res.status(400).json({ error: 'Quiz id required' });

      if (body.action === 'status') {
        await updateQuizStatus(quizId, body);
        return res.status(200).json({ ok: true });
      }

      if (body.deleteQuestionId) {
        await deleteQuestion(body.deleteQuestionId);
        return res.status(200).json({ ok: true });
      }

      if (body.quiz) await updateQuiz(quizId, body.quiz);
      if (body.questions) await upsertQuestions(quizId, body.questions);
      if (body.results) await upsertResults(quizId, body.results);

      return res.status(200).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      if (!quizId) return res.status(400).json({ error: 'Quiz id required' });
      await deleteQuiz(quizId);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(`/api/admin/quizzes/${quizId || ''}`, err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
