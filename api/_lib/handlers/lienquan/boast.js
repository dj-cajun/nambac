import { getSession } from '../../session.js';
import { isTrustedSiteRequest } from '../../requestOrigin.js';
import {
  buildLqPlayerKey,
  listBoasts,
  createBoast,
  likeBoast,
} from '../../lienquanDb.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const session = getSession(req);
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const visitorId = String(req.query?.visitorId || body.visitorId || '').trim().slice(0, 64);
    const visitorKey = buildLqPlayerKey({
      userId: session?.userId || null,
      visitorId: visitorId || null,
    });

    if (req.method === 'GET') {
      if (!session?.userId) {
        return res.status(401).json({ error: 'Đăng nhập Google để xem Góc Khoe' });
      }
      const data = await listBoasts({
        limit: req.query?.limit,
        offset: req.query?.offset,
        visitorKey,
      });
      return res.status(200).json(data);
    }

    if (!isTrustedSiteRequest(req)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (req.method === 'POST') {
      if (!session?.userId) {
        return res.status(401).json({ error: 'Đăng nhập Google để đăng bài' });
      }
      const boast = await createBoast({
        userId: session.userId,
        displayName: body.displayName || session.email || 'Player',
        caption: body.caption,
        heroId: body.heroId,
        imageUrl: body.imageUrl,
        tiktokUrl: body.tiktokUrl,
      });
      return res.status(201).json({ boast });
    }

    if (req.method === 'PATCH') {
      if (!session?.userId) {
        return res.status(401).json({ error: 'Đăng nhập Google để thích bài' });
      }
      if (body.action !== 'like') {
        return res.status(400).json({ error: 'Unknown action' });
      }
      const likeKey = buildLqPlayerKey({ userId: session.userId });
      if (!likeKey) return res.status(400).json({ error: 'Login required' });
      const result = await likeBoast(body.id, likeKey);
      return res.status(200).json(result);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('/api/lienquan/boast', err);
    const status = /login|Login|Đăng nhập/i.test(err.message) ? 401 : 500;
    return res.status(status).json({ error: err.message || 'Internal server error' });
  }
}
