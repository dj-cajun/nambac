import { createClient } from '@libsql/client';

let client;

export function getTurso() {
  if (client) return client;

  const url = process.env.TURSO_DATABASE_URL || process.env.VITE_TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error('TURSO_DATABASE_URL is not configured');
  }
  if (!authToken) {
    throw new Error('TURSO_AUTH_TOKEN is not configured');
  }

  client = createClient({ url, authToken });
  return client;
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
