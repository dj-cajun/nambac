import { getSession } from '../../session.js';
import { isTrustedSiteRequest } from '../../requestOrigin.js';
import {
  buildLqPlayerKey,
  getMasteryLevel,
  upsertMasteryLevel,
} from '../../lienquanDb.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (!['GET', 'POST'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = getSession(req);
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const visitorId = String(req.query?.visitorId || body.visitorId || '').trim().slice(0, 64);
    const playerKey = buildLqPlayerKey({
      userId: session?.userId || null,
      visitorId: visitorId || null,
    });

    if (req.method === 'GET') {
      const level = playerKey ? await getMasteryLevel(playerKey) : 0;
      return res.status(200).json({ level });
    }

    if (!isTrustedSiteRequest(req)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (!playerKey) return res.status(400).json({ error: 'visitorId or login required' });

    const level = await upsertMasteryLevel(playerKey, body.level);
    return res.status(200).json({ level });
  } catch (err) {
    console.error('/api/lienquan/mastery', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
