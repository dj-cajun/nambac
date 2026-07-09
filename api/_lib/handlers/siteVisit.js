import { getSession } from '../session.js';
import { isTrustedSiteRequest } from '../requestOrigin.js';
import { recordSiteVisit } from '../visitDb.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!isTrustedSiteRequest(req)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const session = getSession(req);

    if (session?.userId) {
      await recordSiteVisit({ userId: session.userId });
      return res.status(200).json({ ok: true, kind: 'logged_in' });
    }

    const visitorId = String(body.visitorId || '').trim();
    if (!visitorId || visitorId.length > 64) {
      return res.status(400).json({ error: 'Missing visitorId' });
    }

    await recordSiteVisit({ visitorId });
    return res.status(200).json({ ok: true, kind: 'guest' });
  } catch (err) {
    console.error('POST /api/visit', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
