import { requireAdmin } from '../adminAuth.js';
import { listUsers, updateUserRole } from '../userDb.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Key');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (!requireAdmin(req, res)) return;

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const userId = req.query?.id || body.id;

  try {
    if (req.method === 'GET') {
      const data = await listUsers({
        limit: req.query?.limit,
        offset: req.query?.offset,
      });
      return res.status(200).json(data);
    }

    if (req.method === 'PATCH') {
      if (!userId) return res.status(400).json({ error: 'User id required' });
      if (!body.role) return res.status(400).json({ error: 'role required' });
      const user = await updateUserRole(userId, body.role);
      return res.status(200).json({ user });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('/api/admin/users', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
