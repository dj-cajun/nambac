import { getQuizBundle } from '../quizDb.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing quiz id' });

  try {
    const bundle = await getQuizBundle(id);
    if (!bundle) return res.status(404).json({ error: 'Quiz not found' });
    return res.status(200).json(bundle);
  } catch (err) {
    console.error(`GET /api/quizzes/${id}`, err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
