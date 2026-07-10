import { getSession } from '../session.js';
import { isTrustedSiteRequest } from '../requestOrigin.js';
import { recordSiteVisit, excludeOwnerDevice, getClientIp } from '../visitDb.js';

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
    const visitorId = String(body.visitorId || '').trim();
    const safeVisitorId = visitorId && visitorId.length <= 64 ? visitorId : null;
    const ip = getClientIp(req);

    // Admin session: register this phone/laptop/IP forever, never count
    if (session?.role === 'admin') {
      await excludeOwnerDevice({
        userId: session.userId || null,
        visitorId: safeVisitorId,
        ip,
      });
      return res.status(200).json({ ok: true, skipped: 'owner' });
    }

    if (session?.userId) {
      const result = await recordSiteVisit({
        userId: session.userId,
        visitorId: safeVisitorId,
        ip,
      });
      return res.status(200).json(result);
    }

    if (!safeVisitorId) {
      return res.status(400).json({ error: 'Missing visitorId' });
    }

    const result = await recordSiteVisit({ visitorId: safeVisitorId, ip });
    return res.status(200).json(result);
  } catch (err) {
    console.error('POST /api/visit', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
