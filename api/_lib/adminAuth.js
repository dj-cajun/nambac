import { getSessionFromRequest } from './session.js';
import { timingSafeEqualString } from './secureCompare.js';

/** Production requires ADMIN_API_KEY or Google admin session; local dev may run without it. */
export function requireAdmin(req, res) {
  const session = getSessionFromRequest(req);
  if (session?.role === 'admin') return true;

  const expected = process.env.ADMIN_API_KEY || '';
  const isProduction = Boolean(process.env.VERCEL);

  if (!expected) {
    if (isProduction) {
      res.status(503).json({ error: 'Admin API key not configured' });
      return false;
    }
    return true;
  }

  const key = req.headers?.['x-admin-key'] || req.headers?.['X-Admin-Key'];
  if (timingSafeEqualString(key, expected)) return true;

  res.status(401).json({ error: 'Unauthorized' });
  return false;
}

export function isAdminSession(req) {
  const session = getSessionFromRequest(req);
  return session?.role === 'admin';
}
