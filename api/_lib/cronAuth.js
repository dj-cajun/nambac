import { anyTimingSafeMatch } from './secureCompare.js';

/** Vercel Cron + manual trigger auth */
export function requireCron(req, res) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    res.status(503).json({ error: 'CRON_SECRET not configured' });
    return false;
  }

  const auth = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  const querySecret = req.query?.secret;

  if (anyTimingSafeMatch([auth, querySecret], secret)) return true;

  res.status(401).json({ error: 'Unauthorized' });
  return false;
}
