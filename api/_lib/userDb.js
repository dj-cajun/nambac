import crypto from 'crypto';
import { getTurso } from './turso.js';
import { getAdminAllowedEmails } from './googleOAuth.js';

async function ensureSchema(db) {
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      google_sub TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL,
      name TEXT,
      picture_url TEXT,
      role TEXT NOT NULL DEFAULT 'user',
      last_login_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
  });
  await db.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)' });
  await db.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)' });
  await db.execute({ sql: 'CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login_at)' });
}

function rowToUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    google_sub: row.google_sub,
    email: row.email,
    name: row.name || '',
    picture_url: row.picture_url || '',
    role: row.role || 'user',
    last_login_at: row.last_login_at || null,
    created_at: row.created_at || null,
  };
}

function resolveRole(email, existingRole) {
  const allowed = getAdminAllowedEmails();
  if (allowed.length === 0) return existingRole || 'user';
  if (allowed.includes(String(email || '').toLowerCase())) return 'admin';
  return existingRole === 'admin' ? 'admin' : 'user';
}

export async function upsertUserFromGoogle({ googleSub, email, name, pictureUrl }) {
  const db = getTurso();
  await ensureSchema(db);

  const existing = await db.execute({
    sql: 'SELECT * FROM users WHERE google_sub = ? LIMIT 1',
    args: [googleSub],
  });
  const prev = rowToUser(existing.rows[0]);
  const role = resolveRole(email, prev?.role);
  const now = new Date().toISOString();

  if (prev) {
    await db.execute({
      sql: `UPDATE users
            SET email = ?, name = ?, picture_url = ?, role = ?, last_login_at = ?
            WHERE id = ?`,
      args: [email, name, pictureUrl, role, now, prev.id],
    });
    return { ...prev, email, name, picture_url: pictureUrl, role, last_login_at: now };
  }

  const id = crypto.randomUUID();
  await db.execute({
    sql: `INSERT INTO users (id, google_sub, email, name, picture_url, role, last_login_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [id, googleSub, email, name, pictureUrl, role, now],
  });

  return {
    id,
    google_sub: googleSub,
    email,
    name,
    picture_url: pictureUrl,
    role,
    last_login_at: now,
    created_at: now,
  };
}

export async function getUserById(id) {
  const db = getTurso();
  await ensureSchema(db);
  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE id = ? LIMIT 1',
    args: [id],
  });
  return rowToUser(result.rows[0]);
}

export async function listUsers({ limit = 200, offset = 0 } = {}) {
  const db = getTurso();
  await ensureSchema(db);
  const safeLimit = Math.min(Math.max(Number(limit) || 200, 1), 500);
  const safeOffset = Math.max(Number(offset) || 0, 0);

  const result = await db.execute({
    sql: `SELECT * FROM users
          ORDER BY datetime(COALESCE(last_login_at, created_at)) DESC
          LIMIT ? OFFSET ?`,
    args: [safeLimit, safeOffset],
  });

  const countResult = await db.execute({ sql: 'SELECT COUNT(*) AS total FROM users' });
  const total = Number(countResult.rows[0]?.total) || 0;

  return {
    users: result.rows.map(rowToUser),
    total,
  };
}

export async function updateUserRole(userId, role) {
  if (!['user', 'admin'].includes(role)) throw new Error('Invalid role');
  const db = getTurso();
  await ensureSchema(db);
  await db.execute({
    sql: 'UPDATE users SET role = ? WHERE id = ?',
    args: [role, userId],
  });
  return getUserById(userId);
}
