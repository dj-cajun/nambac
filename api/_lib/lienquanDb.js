import { randomUUID } from 'crypto';
import crypto from 'crypto';
import { getTurso } from './turso.js';
import { KHOE_SEED } from '../../shared/lienquan/khoeSeed.js';

function hashVisitorId(id) {
  return crypto.createHash('sha256').update(String(id)).digest('hex').slice(0, 32);
}

export function buildLqPlayerKey({ userId = null, visitorId = null } = {}) {
  if (userId) return `u:${userId}`;
  if (visitorId) return `g:${hashVisitorId(visitorId)}`;
  return null;
}

async function ensureSchema(db) {
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS lienquan_mastery (
      player_key TEXT PRIMARY KEY,
      level INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
  });
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS lienquan_boasts (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      display_name TEXT NOT NULL,
      caption TEXT NOT NULL,
      hero_id TEXT,
      image_url TEXT,
      tiktok_url TEXT,
      like_count INTEGER NOT NULL DEFAULT 0,
      is_hidden INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
  });
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS lienquan_boast_likes (
      boast_id TEXT NOT NULL,
      visitor_key TEXT NOT NULL,
      PRIMARY KEY (boast_id, visitor_key)
    )`,
  });
  await db.execute({
    sql: 'CREATE INDEX IF NOT EXISTS idx_lq_boasts_created ON lienquan_boasts(datetime(created_at) DESC)',
  });
}

export async function getMasteryLevel(playerKey) {
  if (!playerKey) return 0;
  const db = getTurso();
  await ensureSchema(db);
  const rs = await db.execute({
    sql: 'SELECT level FROM lienquan_mastery WHERE player_key = ? LIMIT 1',
    args: [playerKey],
  });
  return Number(rs.rows[0]?.level) || 0;
}

/** Keep the highest level ever achieved */
export async function upsertMasteryLevel(playerKey, level) {
  if (!playerKey) return 0;
  const safe = Math.max(0, Math.min(7, Number(level) || 0));
  const db = getTurso();
  await ensureSchema(db);
  const current = await getMasteryLevel(playerKey);
  const next = Math.max(current, safe);
  await db.execute({
    sql: `INSERT INTO lienquan_mastery (player_key, level, updated_at)
          VALUES (?, ?, datetime('now'))
          ON CONFLICT(player_key) DO UPDATE SET
            level = excluded.level,
            updated_at = datetime('now')`,
    args: [playerKey, next],
  });
  return next;
}

function normalizeBoastImageUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (raw.startsWith('/api/lienquan/khoe-image?')) return raw.slice(0, 500);
  return normalizeHttpsUrl(raw);
}

function normalizeHttpsUrl(value, { allowTiktok = false } = {}) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  let url;
  try {
    url = new URL(raw);
  } catch {
    return '';
  }
  if (url.protocol !== 'https:') return '';
  if (allowTiktok) {
    const host = url.hostname.replace(/^www\./, '');
    if (!['tiktok.com', 'vm.tiktok.com', 'vt.tiktok.com'].includes(host) && !host.endsWith('.tiktok.com')) {
      return '';
    }
  }
  return url.toString().slice(0, 500);
}

export async function listBoasts({ limit = 30, offset = 0, visitorKey = null } = {}) {
  const db = getTurso();
  await ensureSchema(db);
  const safeLimit = Math.min(Math.max(Number(limit) || 30, 1), 50);
  const safeOffset = Math.max(Number(offset) || 0, 0);

  const rs = await db.execute({
    sql: `SELECT id, user_id, display_name, caption, hero_id, image_url, tiktok_url,
                 like_count, created_at
          FROM lienquan_boasts
          WHERE is_hidden = 0
          ORDER BY datetime(created_at) DESC
          LIMIT ? OFFSET ?`,
    args: [safeLimit, safeOffset],
  });

  let liked = new Set();
  if (visitorKey && rs.rows.length) {
    const ids = rs.rows.map((r) => r.id);
    const placeholders = ids.map(() => '?').join(',');
    const likeRs = await db.execute({
      sql: `SELECT boast_id FROM lienquan_boast_likes
            WHERE visitor_key = ? AND boast_id IN (${placeholders})`,
      args: [visitorKey, ...ids],
    });
    liked = new Set(likeRs.rows.map((r) => r.boast_id));
  }

  const boasts = rs.rows.map((row) => ({
    id: row.id,
    display_name: row.display_name,
    caption: row.caption,
    hero_id: row.hero_id || '',
    image_url: row.image_url || '',
    tiktok_url: row.tiktok_url || '',
    like_count: Number(row.like_count) || 0,
    created_at: row.created_at,
    liked: liked.has(row.id),
    seed: false,
  }));

  if (boasts.length === 0 && safeOffset === 0) {
    return {
      boasts: KHOE_SEED.map((b) => ({ ...b, liked: false, seed: true })),
      total: KHOE_SEED.length,
      seeded: true,
    };
  }

  return { boasts, total: boasts.length, seeded: false };
}

export async function createBoast({
  userId,
  displayName,
  caption,
  heroId = '',
  imageUrl = '',
  tiktokUrl = '',
}) {
  if (!userId) throw new Error('Login required');
  const text = String(caption || '').trim().slice(0, 280);
  if (text.length < 4) throw new Error('Caption too short');

  const name = String(displayName || 'Player').trim().slice(0, 40) || 'Player';
  const image_url = normalizeBoastImageUrl(imageUrl);
  const tiktok_url = normalizeHttpsUrl(tiktokUrl, { allowTiktok: true });
  if (!image_url && !tiktok_url) {
    // allow text-only boasts
  }

  const db = getTurso();
  await ensureSchema(db);
  const id = randomUUID();
  await db.execute({
    sql: `INSERT INTO lienquan_boasts
          (id, user_id, display_name, caption, hero_id, image_url, tiktok_url, like_count, is_hidden, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, datetime('now'))`,
    args: [id, userId, name, text, String(heroId || '').slice(0, 40), image_url, tiktok_url],
  });

  return {
    id,
    display_name: name,
    caption: text,
    hero_id: heroId || '',
    image_url,
    tiktok_url,
    like_count: 0,
    created_at: new Date().toISOString(),
    liked: false,
    seed: false,
  };
}

export async function likeBoast(boastId, visitorKey) {
  if (!boastId || !visitorKey) throw new Error('Missing id');
  if (String(boastId).startsWith('seed-')) {
    return { id: boastId, like_count: null, liked: true, seed: true };
  }

  const db = getTurso();
  await ensureSchema(db);

  const exists = await db.execute({
    sql: 'SELECT like_count FROM lienquan_boasts WHERE id = ? AND is_hidden = 0 LIMIT 1',
    args: [boastId],
  });
  if (!exists.rows[0]) throw new Error('Boast not found');

  const already = await db.execute({
    sql: 'SELECT 1 AS ok FROM lienquan_boast_likes WHERE boast_id = ? AND visitor_key = ? LIMIT 1',
    args: [boastId, visitorKey],
  });
  if (already.rows[0]) {
    return {
      id: boastId,
      like_count: Number(exists.rows[0].like_count) || 0,
      liked: true,
    };
  }

  await db.execute({
    sql: 'INSERT INTO lienquan_boast_likes (boast_id, visitor_key) VALUES (?, ?)',
    args: [boastId, visitorKey],
  });
  await db.execute({
    sql: 'UPDATE lienquan_boasts SET like_count = like_count + 1 WHERE id = ?',
    args: [boastId],
  });

  const next = await db.execute({
    sql: 'SELECT like_count FROM lienquan_boasts WHERE id = ? LIMIT 1',
    args: [boastId],
  });

  return {
    id: boastId,
    like_count: Number(next.rows[0]?.like_count) || 0,
    liked: true,
  };
}
