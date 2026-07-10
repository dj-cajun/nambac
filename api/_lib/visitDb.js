import crypto from 'crypto';
import { getTurso } from './turso.js';

const ICT_TODAY = "date(datetime('now', '+7 hours'))";
const ADMIN_PASSWORD_USER_ID = 'admin-password';

function hashVisitorId(id) {
  return crypto.createHash('sha256').update(String(id)).digest('hex').slice(0, 32);
}

function hashIp(ip) {
  if (!ip) return null;
  return `ip:${crypto.createHash('sha256').update(String(ip)).digest('hex').slice(0, 32)}`;
}

/** Client IP from Vercel / proxies */
export function getClientIp(req) {
  const headers = req?.headers || {};
  const forwarded = headers['x-forwarded-for'] || headers['X-Forwarded-For'] || '';
  const first = String(forwarded).split(',')[0].trim();
  if (first) return first;
  const real = headers['x-real-ip'] || headers['X-Real-Ip'] || '';
  if (real) return String(real).trim();
  return req?.socket?.remoteAddress || null;
}

export function buildVisitorKey({ userId = null, visitorId = null } = {}) {
  if (userId) return `u:${userId}`;
  if (visitorId) return `g:${hashVisitorId(visitorId)}`;
  return null;
}

let ipColumnReady = null;

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
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS site_visit_exclusions (
      visitor_key TEXT PRIMARY KEY,
      reason TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
  });

  if (!ipColumnReady) {
    ipColumnReady = (async () => {
      try {
        await db.execute({
          sql: 'ALTER TABLE site_daily_visitors ADD COLUMN ip_key TEXT',
        });
      } catch (err) {
        const msg = String(err.message || '').toLowerCase();
        if (!msg.includes('duplicate column') && !msg.includes('already exists')) {
          ipColumnReady = null;
          throw err;
        }
      }
      try {
        await db.execute({
          sql: 'CREATE INDEX IF NOT EXISTS idx_site_visitors_ip ON site_daily_visitors(visit_date, ip_key)',
        });
      } catch {
        /* index may already exist */
      }
    })();
  }
  await ipColumnReady;
}

/** Unique identity for counting: same IP = 1 (fallback to visitor_key if IP missing) */
const UNIQUE_ID = `COALESCE(NULLIF(ip_key, ''), visitor_key)`;

/** SQL fragment: exclude owner/admin keys from visitor counts */
const NOT_EXCLUDED = `visitor_key NOT IN (SELECT visitor_key FROM site_visit_exclusions)
  AND visitor_key NOT IN (
    SELECT 'u:' || id FROM users WHERE role = 'admin'
  )
  AND visitor_key != 'u:${ADMIN_PASSWORD_USER_ID}'
  AND (${UNIQUE_ID}) NOT IN (SELECT visitor_key FROM site_visit_exclusions)`;

const NOT_EXCLUDED_SIMPLE = `visitor_key NOT IN (SELECT visitor_key FROM site_visit_exclusions)
  AND visitor_key != 'u:${ADMIN_PASSWORD_USER_ID}'
  AND (${UNIQUE_ID}) NOT IN (SELECT visitor_key FROM site_visit_exclusions)`;

/**
 * Mark this browser (and admin account / IP) as owner — never count in analytics.
 */
export async function excludeOwnerDevice({ userId = null, visitorId = null, ip = null } = {}) {
  const db = getTurso();
  await ensureSchema(db);

  const keys = new Set([`u:${ADMIN_PASSWORD_USER_ID}`]);
  if (userId) keys.add(`u:${userId}`);
  if (visitorId) keys.add(`g:${hashVisitorId(visitorId)}`);
  const ipKey = hashIp(ip);
  if (ipKey) keys.add(ipKey);

  for (const key of keys) {
    await db.execute({
      sql: `INSERT OR IGNORE INTO site_visit_exclusions (visitor_key, reason)
            VALUES (?, 'owner')`,
      args: [key],
    });
    if (key.startsWith('ip:')) {
      await db.execute({
        sql: 'DELETE FROM site_daily_visitors WHERE ip_key = ?',
        args: [key],
      });
    } else {
      await db.execute({
        sql: 'DELETE FROM site_daily_visitors WHERE visitor_key = ?',
        args: [key],
      });
    }
  }

  return { ok: true, excluded: [...keys] };
}

export async function isVisitorExcluded(visitorKey) {
  if (!visitorKey) return false;
  if (visitorKey === `u:${ADMIN_PASSWORD_USER_ID}`) return true;

  const db = getTurso();
  await ensureSchema(db);

  const ex = await db.execute({
    sql: 'SELECT 1 AS ok FROM site_visit_exclusions WHERE visitor_key = ? LIMIT 1',
    args: [visitorKey],
  });
  if (ex.rows[0]) return true;

  if (visitorKey.startsWith('u:')) {
    const userId = visitorKey.slice(2);
    try {
      const admin = await db.execute({
        sql: "SELECT 1 AS ok FROM users WHERE id = ? AND role = 'admin' LIMIT 1",
        args: [userId],
      });
      if (admin.rows[0]) return true;
    } catch {
      /* users table may be missing on fresh DB */
    }
  }

  return false;
}

export async function recordSiteVisit({
  userId = null,
  visitorId = null,
  isAdmin = false,
  ip = null,
} = {}) {
  const db = getTurso();
  await ensureSchema(db);

  if (!userId && !visitorId) return { ok: false };

  const ipKey = hashIp(ip);

  // Admin / owner devices: register exclusion and do not count
  if (isAdmin || (userId && userId === ADMIN_PASSWORD_USER_ID)) {
    await excludeOwnerDevice({ userId, visitorId, ip });
    return { ok: true, skipped: 'owner' };
  }

  const visitorKey = buildVisitorKey({ userId, visitorId });
  if (!visitorKey) return { ok: false };

  if (await isVisitorExcluded(visitorKey)) {
    return { ok: true, skipped: 'excluded' };
  }
  if (ipKey && (await isVisitorExcluded(ipKey))) {
    return { ok: true, skipped: 'excluded' };
  }

  // Guest on a device that was previously used by admin (g: key excluded)
  if (visitorId) {
    const guestKey = `g:${hashVisitorId(visitorId)}`;
    if (guestKey !== visitorKey && (await isVisitorExcluded(guestKey))) {
      return { ok: true, skipped: 'excluded' };
    }
  }

  const isLoggedIn = userId ? 1 : 0;

  await db.execute({
    sql: `INSERT OR IGNORE INTO site_daily_visitors (visit_date, visitor_key, is_logged_in, ip_key)
          VALUES (${ICT_TODAY}, ?, ?, ?)`,
    args: [visitorKey, isLoggedIn, ipKey],
  });

  // Backfill IP / upgrade login flag on repeat hits same day
  await db.execute({
    sql: `UPDATE site_daily_visitors
          SET ip_key = COALESCE(NULLIF(ip_key, ''), ?),
              is_logged_in = CASE WHEN is_logged_in < ? THEN ? ELSE is_logged_in END
          WHERE visit_date = ${ICT_TODAY} AND visitor_key = ?`,
    args: [ipKey, isLoggedIn, isLoggedIn, visitorKey],
  });

  return { ok: true };
}

/** Aggregate: same IP counts as 1 per day */
const DAILY_UNIQUE_SQL = `
  SELECT
    visit_date,
    COUNT(*) AS total,
    SUM(CASE WHEN max_login = 1 THEN 1 ELSE 0 END) AS logged_in,
    SUM(CASE WHEN max_login = 0 THEN 1 ELSE 0 END) AS guest
  FROM (
    SELECT
      visit_date,
      ${UNIQUE_ID} AS uniq,
      MAX(is_logged_in) AS max_login
    FROM site_daily_visitors
    WHERE __WHERE__
    GROUP BY visit_date, ${UNIQUE_ID}
  )
  GROUP BY visit_date
`;

export async function getTodayVisitorStats() {
  const db = getTurso();
  await ensureSchema(db);

  const run = async (whereSql) => {
    const sql = `
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN max_login = 1 THEN 1 ELSE 0 END) AS logged_in,
        SUM(CASE WHEN max_login = 0 THEN 1 ELSE 0 END) AS guest
      FROM (
        SELECT
          ${UNIQUE_ID} AS uniq,
          MAX(is_logged_in) AS max_login
        FROM site_daily_visitors
        WHERE visit_date = ${ICT_TODAY}
          AND ${whereSql}
        GROUP BY ${UNIQUE_ID}
      )`;
    return db.execute({ sql });
  };

  let result;
  try {
    result = await run(NOT_EXCLUDED);
  } catch {
    result = await run(NOT_EXCLUDED_SIMPLE);
  }

  const row = result.rows[0] || {};
  return {
    total: Number(row.total) || 0,
    loggedIn: Number(row.logged_in) || 0,
    guest: Number(row.guest) || 0,
  };
}

/** ICT calendar date string YYYY-MM-DD */
function ictDateString(offsetDays = 0) {
  const ms = Date.now() + 7 * 60 * 60 * 1000 + offsetDays * 24 * 60 * 60 * 1000;
  return new Date(ms).toISOString().slice(0, 10);
}

/**
 * Daily unique visitor series — same IP = 1 per day (ICT).
 * @param {number} [days=30]
 */
export async function getDailyVisitorSeries(days = 30) {
  const db = getTurso();
  await ensureSchema(db);

  const safeDays = Math.min(Math.max(Number(days) || 30, 1), 90);
  const startDate = ictDateString(-(safeDays - 1));

  const run = async (whereSql) => {
    const sql = DAILY_UNIQUE_SQL.replace('__WHERE__', `visit_date >= ? AND ${whereSql}`);
    return db.execute({ sql, args: [startDate] });
  };

  let result;
  try {
    result = await run(NOT_EXCLUDED);
  } catch {
    result = await run(NOT_EXCLUDED_SIMPLE);
  }

  const byDate = new Map();
  for (const row of result.rows) {
    byDate.set(String(row.visit_date), {
      date: String(row.visit_date),
      total: Number(row.total) || 0,
      loggedIn: Number(row.logged_in) || 0,
      guest: Number(row.guest) || 0,
    });
  }

  const series = [];
  for (let i = safeDays - 1; i >= 0; i -= 1) {
    const date = ictDateString(-i);
    series.push(byDate.get(date) || { date, total: 0, loggedIn: 0, guest: 0 });
  }

  return series;
}
