import { getFortuneStats, incrementFortuneStat } from '../fortuneDb.js';
import { isTrustedSiteRequest } from '../requestOrigin.js';
import { setNoStore, setPublicGetCache } from '../cdnCache.js';
import { FORTUNE_KIND } from '../../../shared/fortuneMeta.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      setPublicGetCache(res);
      const kind = req.query?.kind || FORTUNE_KIND;
      const stats = await getFortuneStats(kind);
      return res.status(200).json(stats);
    }

    if (req.method === 'POST') {
      setNoStore(res);
      if (!isTrustedSiteRequest(req)) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const field = body.field;
      const kind = body.kind || FORTUNE_KIND;

      if (!field) return res.status(400).json({ error: 'Missing field' });

      const stats = await incrementFortuneStat(kind, field);
      return res.status(200).json({ ok: true, ...stats });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    if (err.message?.startsWith('Invalid')) {
      return res.status(400).json({ error: err.message });
    }
    console.error('fortune/stats', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
