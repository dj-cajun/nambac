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

export function rowToQuiz(row) {
  if (!row) return null;
  return {
    ...row,
    is_active: row.is_active === 1 || row.is_active === true,
    config: row.config ? JSON.parse(row.config) : null,
    design: row.design ? JSON.parse(row.design) : null,
  };
}

export function rowToQuestion(row) {
  if (!row) return null;
  return {
    ...row,
    options: row.options ? JSON.parse(row.options) : null,
  };
}

export function rowToResult(row) {
  if (!row) return null;
  return {
    ...row,
    traits: row.traits ? JSON.parse(row.traits) : [],
  };
}
