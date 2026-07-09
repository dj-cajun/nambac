import {
  getFeatureStats,
  getManyFeatureStats,
  incrementFeatureStat,
  FEATURE_KINDS,
} from '../featureStatsDb.js';
import { isTrustedSiteRequest } from '../requestOrigin.js';
import { setNoStore, setPublicGetCache } from '../cdnCache.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      setPublicGetCache(res);
      const kind = (req.query?.kind || '').trim();
      if (!kind || kind === 'all') {
        const stats = await getManyFeatureStats(FEATURE_KINDS);
        return res.status(200).json(stats);
      }
      const stats = await getFeatureStats(kind);
      return res.status(200).json(stats);
    }

    if (req.method === 'POST') {
      setNoStore(res);
      if (!isTrustedSiteRequest(req)) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const field = body.field;
      const kind = (body.kind || '').trim();

      if (!field) return res.status(400).json({ error: 'Missing field' });
      if (!kind) return res.status(400).json({ error: 'Missing kind' });

      const stats = await incrementFeatureStat(kind, field);
      return res.status(200).json({ ok: true, ...stats });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    if (err.message?.startsWith('Invalid')) {
      return res.status(400).json({ error: err.message });
    }
    console.error('feature/stats', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
