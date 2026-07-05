import { getVapidPublicKey, savePushSubscription } from '../pushService.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method === 'GET') {
    return res.status(200).json({ publicKey: getVapidPublicKey() });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    if (!body.subscription?.endpoint) {
      return res.status(400).json({ error: 'subscription required' });
    }

    await savePushSubscription({
      endpoint: body.subscription.endpoint,
      keys: body.subscription.keys,
      locale: body.locale || 'vi',
    });

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error('POST /api/push/subscribe', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
