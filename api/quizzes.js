import { listActiveQuizzes } from './_lib/quizDb.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const quizzes = await listActiveQuizzes();
    return res.status(200).json({ quizzes });
  } catch (err) {
    console.error('GET /api/quizzes', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
