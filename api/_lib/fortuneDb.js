import { getTurso } from './turso.js';
import { FORTUNE_KIND } from '../../shared/fortuneMeta.js';

const STAT_FIELDS = {
  view: 'view_count',
  share: 'share_count',
  like: 'like_count',
};

function normalizeKind(kind) {
  const k = String(kind || FORTUNE_KIND).trim();
  if (k !== FORTUNE_KIND) throw new Error(`Invalid fortune kind: ${kind}`);
  return k;
}

async function ensureFortuneStatsSchema(db) {
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS fortune_stats (
      kind TEXT PRIMARY KEY,
      view_count INTEGER NOT NULL DEFAULT 0,
      share_count INTEGER NOT NULL DEFAULT 0,
      like_count INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
  });
}

async function ensureFortuneStatsRow(kind) {
  const db = getTurso();
  await ensureFortuneStatsSchema(db);
  await db.execute({
    sql: `INSERT OR IGNORE INTO fortune_stats (kind, view_count, share_count, like_count)
          VALUES (?, 0, 0, 0)`,
    args: [kind],
  });
}

function rowToFortuneStats(row) {
  if (!row) {
    return { kind: FORTUNE_KIND, view_count: 0, share_count: 0, like_count: 0 };
  }
  return {
    kind: row.kind,
    view_count: Number(row.view_count) || 0,
    share_count: Number(row.share_count) || 0,
    like_count: Number(row.like_count) || 0,
  };
}

export async function getFortuneStats(kind = FORTUNE_KIND) {
  const k = normalizeKind(kind);
  await ensureFortuneStatsRow(k);
  const db = getTurso();
  const rs = await db.execute({
    sql: 'SELECT kind, view_count, share_count, like_count FROM fortune_stats WHERE kind = ? LIMIT 1',
    args: [k],
  });
  return rowToFortuneStats(rs.rows[0]);
}

export async function incrementFortuneStat(kind, field) {
  const column = STAT_FIELDS[field];
  if (!column) throw new Error(`Invalid stat field: ${field}`);

  const k = normalizeKind(kind);
  await ensureFortuneStatsRow(k);

  const db = getTurso();
  await db.execute({
    sql: `UPDATE fortune_stats SET ${column} = COALESCE(${column}, 0) + 1, updated_at = datetime('now') WHERE kind = ?`,
    args: [k],
  });

  return getFortuneStats(k);
}
