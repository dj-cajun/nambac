import crypto from 'crypto';
import { getTurso } from './turso.js';

const ICT_TODAY = "date(datetime('now', '+7 hours'))";

function hashVisitorId(id) {
  return crypto.createHash('sha256').update(String(id)).digest('hex').slice(0, 32);
}

async function ensureSchema(db) {
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS site_daily_visitors (
      visit_date TEXT NOT NULL,
      visitor_key TEXT NOT NULL,
      is_logged_in INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (visit_date, visitor_key)
    )`,
  });
  await db.execute({
    sql: 'CREATE INDEX IF NOT EXISTS idx_site_visitors_date ON site_daily_visitors(visit_date)',
  });
}

export async function recordSiteVisit({ userId = null, visitorId = null } = {}) {
  const db = getTurso();
  await ensureSchema(db);

  if (!userId && !visitorId) return { ok: false };

  const visitorKey = userId ? `u:${userId}` : `g:${hashVisitorId(visitorId)}`;
  const isLoggedIn = userId ? 1 : 0;

  await db.execute({
    sql: `INSERT OR IGNORE INTO site_daily_visitors (visit_date, visitor_key, is_logged_in)
          VALUES (${ICT_TODAY}, ?, ?)`,
    args: [visitorKey, isLoggedIn],
  });

  return { ok: true };
}

export async function getTodayVisitorStats() {
  const db = getTurso();
  await ensureSchema(db);

  const result = await db.execute({
    sql: `SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN is_logged_in = 1 THEN 1 ELSE 0 END) AS logged_in,
            SUM(CASE WHEN is_logged_in = 0 THEN 1 ELSE 0 END) AS guest
          FROM site_daily_visitors
          WHERE visit_date = ${ICT_TODAY}`,
  });

  const row = result.rows[0] || {};
  return {
    total: Number(row.total) || 0,
    loggedIn: Number(row.logged_in) || 0,
    guest: Number(row.guest) || 0,
  };
}
