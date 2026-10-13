import { getPostgresDb, isPostgresConfigured } from './postgres.js';

/**
 * DB client — Supabase Postgres only. Turso is read-only legacy (scripts/db/migrate_turso_to_supabase.mjs);
 * never fall back to it, or writes silently land in a DB the site does not read.
 */
export function getTurso() {
  if (!isPostgresConfigured()) {
    throw new Error('SUPABASE_DB_URL (or DATABASE_URL) is not configured');
  }
  return getPostgresDb();
}

function safeJsonParse(value, fallback = null) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function toInt(value, fallback = 0) {
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? fallback : n;
}

export function rowToQuiz(row) {
  if (!row) return null;
  return {
    ...row,
    is_active: row.is_active === 1 || row.is_active === true,
    config: safeJsonParse(row.config, null),
    design: safeJsonParse(row.design, null),
  };
}

export function rowToQuestion(row) {
  if (!row) return null;
  return {
    ...row,
    order_number: toInt(row.order_number, 0),
    score_a: toInt(row.score_a, 0),
    score_b: toInt(row.score_b, 0),
    options: safeJsonParse(row.options, null),
  };
}

export function rowToResult(row) {
  if (!row) return null;
  return {
    ...row,
    result_code: toInt(row.result_code, 0),
    traits: safeJsonParse(row.traits, []),
    title: row.title || row.type_name || '',
  };
}
