import { requireAdmin } from '../adminAuth.js';
import { sendPushToAll } from '../pushService.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Key, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAdmin(req, res)) return;

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

  try {
    const result = await sendPushToAll({
      title: body.title || 'nambac.xyz',
      body: body.body || 'Quiz mới đang chờ bạn!',
      url: body.url || '/',
      tag: body.tag || 'nambac-broadcast',
    });
    return res.status(200).json(result);
  } catch (err) {
    console.error('POST /api/push/notify', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
