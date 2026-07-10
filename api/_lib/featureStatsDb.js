import { getTurso } from './turso.js';

const STAT_FIELDS = {
  view: 'view_count',
  share: 'share_count',
  like: 'like_count',
};

/** Whitelisted mini-app kinds that can hold view/share/like counters. */
export const FEATURE_KINDS = ['balance', 'roast', 'brain', 'lienquan'];

function normalizeKind(kind) {
  const k = String(kind || '').trim();
  if (!FEATURE_KINDS.includes(k)) throw new Error(`Invalid feature kind: ${kind}`);
  return k;
}

async function ensureSchema(db) {
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS feature_stats (
      kind TEXT PRIMARY KEY,
      view_count INTEGER NOT NULL DEFAULT 0,
      share_count INTEGER NOT NULL DEFAULT 0,
      like_count INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
  });
}

async function ensureRow(kind) {
  const db = getTurso();
  await ensureSchema(db);
  await db.execute({
    sql: `INSERT OR IGNORE INTO feature_stats (kind, view_count, share_count, like_count)
          VALUES (?, 0, 0, 0)`,
    args: [kind],
  });
}

function rowToStats(kind, row) {
  if (!row) {
    return { kind, view_count: 0, share_count: 0, like_count: 0 };
  }
  return {
    kind: row.kind,
    view_count: Number(row.view_count) || 0,
    share_count: Number(row.share_count) || 0,
    like_count: Number(row.like_count) || 0,
  };
}

export async function getFeatureStats(kind) {
  const k = normalizeKind(kind);
  await ensureRow(k);
  const db = getTurso();
  const rs = await db.execute({
    sql: 'SELECT kind, view_count, share_count, like_count FROM feature_stats WHERE kind = ? LIMIT 1',
    args: [k],
  });
  return rowToStats(k, rs.rows[0]);
}

export async function getManyFeatureStats(kinds = FEATURE_KINDS) {
  const out = {};
  for (const kind of kinds) {
    try {
      out[kind] = await getFeatureStats(kind);
    } catch {
      out[kind] = { kind, view_count: 0, share_count: 0, like_count: 0 };
    }
  }
  return out;
}

export async function incrementFeatureStat(kind, field) {
  const column = STAT_FIELDS[field];
  if (!column) throw new Error(`Invalid stat field: ${field}`);

  const k = normalizeKind(kind);
  await ensureRow(k);

  const db = getTurso();
  await db.execute({
    sql: `UPDATE feature_stats SET ${column} = COALESCE(${column}, 0) + 1, updated_at = datetime('now') WHERE kind = ?`,
    args: [k],
  });

  return getFeatureStats(k);
}
