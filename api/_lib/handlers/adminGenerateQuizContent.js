import { requireAdmin } from '../adminAuth.js';
import { generateQuizContent } from '../geminiQuiz.js';

/** POST /api/admin/generate-quiz-content — Gemini quiz text (server-side keys only) */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Key, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAdmin(req, res)) return;

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

  try {
    const categoryId = body.categoryId || body.category;
    if (!categoryId) return res.status(400).json({ error: 'categoryId required' });

    const data = await generateQuizContent(categoryId, body.customTopic || body.topic || '');
    return res.status(200).json(data);
  } catch (err) {
    console.error('POST /api/admin/generate-quiz-content', err);
    return res.status(500).json({ error: err.message || 'Quiz generation failed' });
  }
}
