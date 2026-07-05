import { createBrandInquiry } from '../quizDb.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const result = await createBrandInquiry(body);
    return res.status(201).json(result);
  } catch (err) {
    console.error('POST /api/brand-inquiries', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
