export function requireWebhook(req, res) {
  const expected = process.env.N8N_WEBHOOK_SECRET || process.env.CRON_SECRET || '';
  if (!expected) {
    res.status(503).json({ error: 'Webhook secret not configured' });
    return false;
  }

  const header = req.headers['x-webhook-secret'] || req.headers['X-Webhook-Secret'];
  const query = req.query?.secret;
  const auth = req.headers.authorization?.replace(/^Bearer\s+/i, '');

  if (header === expected || query === expected || auth === expected) return true;

  res.status(401).json({ error: 'Unauthorized' });
  return false;
}
