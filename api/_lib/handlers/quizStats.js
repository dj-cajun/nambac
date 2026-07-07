import { incrementQuizStat } from '../quizDb.js';
import { isTrustedSiteRequest } from '../requestOrigin.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing quiz id' });

  if (!isTrustedSiteRequest(req)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const field = body.field;
    if (!field) return res.status(400).json({ error: 'Missing field' });

    const stats = await incrementQuizStat(id, field);
    return res.status(200).json(stats);
  } catch (err) {
    if (err.message === 'Quiz not available' || err.message?.startsWith('Invalid stat field')) {
      return res.status(400).json({ error: err.message });
    }
    console.error(`POST /api/quizzes/${id}/stats`, err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
