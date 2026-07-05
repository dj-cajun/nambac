import webpush from 'web-push';
import { randomUUID } from 'crypto';
import { getTurso } from './turso.js';

function getVapid() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:nam@nambac.xyz';
  if (!publicKey || !privateKey) return null;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  return { publicKey, privateKey, subject };
}

export function getVapidPublicKey() {
  return process.env.VAPID_PUBLIC_KEY || '';
}

export async function savePushSubscription(sub) {
  const db = getTurso();
  const id = randomUUID();
  await db.execute({
    sql: `INSERT INTO push_subscriptions (id, endpoint, p256dh, auth, locale)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(endpoint) DO UPDATE SET p256dh = excluded.p256dh, auth = excluded.auth, locale = excluded.locale`,
    args: [id, sub.endpoint, sub.keys.p256dh, sub.keys.auth, sub.locale || 'vi'],
  });
  return { id };
}

export async function listPushSubscriptions() {
  const db = getTurso();
  const rs = await db.execute('SELECT endpoint, p256dh, auth FROM push_subscriptions');
  return rs.rows.map((row) => ({
    endpoint: row.endpoint,
    keys: { p256dh: row.p256dh, auth: row.auth },
  }));
}

export async function sendPushToAll(payload) {
  if (!getVapid()) throw new Error('VAPID keys not configured');

  const subs = await listPushSubscriptions();
  const body = JSON.stringify(payload);
  let sent = 0;
  let failed = 0;

  for (const sub of subs) {
    try {
      await webpush.sendNotification(sub, body);
      sent += 1;
    } catch (err) {
      failed += 1;
      if (err.statusCode === 410 || err.statusCode === 404) {
        const db = getTurso();
        await db.execute({ sql: 'DELETE FROM push_subscriptions WHERE endpoint = ?', args: [sub.endpoint] });
      }
    }
  }

  return { sent, failed, total: subs.length };
}
