import crypto from 'crypto';
import { getTurso } from './turso.js';
import { getAdminAllowedEmails } from './googleOAuth.js';
import { getTodayVisitorStats } from './visitDb.js';

async function ensureColumn(db, sql) {
  try {
    await db.execute(sql);
  } catch {
    /* column already exists */
  }
}

async function ensureSchema(db) {
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      google_sub TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL,
      name TEXT,
      picture_url TEXT,
      role TEXT NOT NULL DEFAULT 'user',
      email_opt_in INTEGER NOT NULL DEFAULT 1,
      admin_note TEXT,
      login_count INTEGER NOT NULL DEFAULT 0,
      last_login_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT
    )`,
  });
  await ensureColumn(db, 'ALTER TABLE users ADD COLUMN email_opt_in INTEGER NOT NULL DEFAULT 1');
  await ensureColumn(db, 'ALTER TABLE users ADD COLUMN admin_note TEXT');
  await ensureColumn(db, 'ALTER TABLE users ADD COLUMN login_count INTEGER NOT NULL DEFAULT 0');
  await ensureColumn(db, 'ALTER TABLE users ADD COLUMN updated_at TEXT');
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
    email_opt_in: row.email_opt_in === 0 || row.email_opt_in === false ? false : true,
    admin_note: row.admin_note || '',
    login_count: Number(row.login_count) || 0,
    last_login_at: row.last_login_at || null,
    created_at: row.created_at || null,
    updated_at: row.updated_at || null,
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
    const loginCount = (prev.login_count || 0) + 1;
    await db.execute({
      sql: `UPDATE users
            SET email = ?, name = ?, picture_url = ?, role = ?, last_login_at = ?,
                login_count = ?, updated_at = ?
            WHERE id = ?`,
      args: [email, name, pictureUrl, role, now, loginCount, now, prev.id],
    });
    return { ...prev, email, name, picture_url: pictureUrl, role, last_login_at: now, login_count: loginCount, updated_at: now };
  }

  const id = crypto.randomUUID();
  await db.execute({
    sql: `INSERT INTO users (id, google_sub, email, name, picture_url, role, last_login_at, login_count, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
    args: [id, googleSub, email, name, pictureUrl, role, now, now],
  });

  return {
    id,
    google_sub: googleSub,
    email,
    name,
    picture_url: pictureUrl,
    role,
    email_opt_in: true,
    admin_note: '',
    login_count: 1,
    last_login_at: now,
    created_at: now,
    updated_at: now,
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

export async function getUserStats() {
  const db = getTurso();
  await ensureSchema(db);
  const result = await db.execute({
    sql: `SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) AS admins,
            SUM(CASE WHEN datetime(COALESCE(last_login_at, created_at)) >= datetime('now', '-7 days') THEN 1 ELSE 0 END) AS active7d,
            SUM(CASE WHEN email_opt_in = 1 THEN 1 ELSE 0 END) AS mailable
          FROM users`,
  });
  const row = result.rows[0] || {};
  const visitors = await getTodayVisitorStats();
  return {
    total: Number(row.total) || 0,
    admins: Number(row.admins) || 0,
    activeToday: visitors.total,
    activeTodayLoggedIn: visitors.loggedIn,
    activeTodayGuest: visitors.guest,
    active7d: Number(row.active7d) || 0,
    mailable: Number(row.mailable) || 0,
  };
}

export async function listUsers({ limit = 200, offset = 0, search = '', role = 'all' } = {}) {
  const db = getTurso();
  await ensureSchema(db);
  const safeLimit = Math.min(Math.max(Number(limit) || 200, 1), 500);
  const safeOffset = Math.max(Number(offset) || 0, 0);

  const where = ['1=1'];
  const args = [];

  if (role && role !== 'all') {
    where.push('role = ?');
    args.push(role);
  }

  const q = String(search || '').trim();
  if (q) {
    where.push('(email LIKE ? OR name LIKE ?)');
    const like = `%${q}%`;
    args.push(like, like);
  }

  const whereSql = where.join(' AND ');

  const result = await db.execute({
    sql: `SELECT * FROM users
          WHERE ${whereSql}
          ORDER BY datetime(COALESCE(last_login_at, created_at)) DESC
          LIMIT ? OFFSET ?`,
    args: [...args, safeLimit, safeOffset],
  });

  const countResult = await db.execute({
    sql: `SELECT COUNT(*) AS total FROM users WHERE ${whereSql}`,
    args,
  });
  const total = Number(countResult.rows[0]?.total) || 0;
  const stats = await getUserStats();

  return {
    users: result.rows.map(rowToUser),
    total,
    stats,
  };
}

export async function updateUser(userId, patch = {}) {
  const db = getTurso();
  await ensureSchema(db);
  const now = new Date().toISOString();
  const sets = ['updated_at = ?'];
  const args = [now];

  if (patch.role !== undefined) {
    if (!['user', 'admin'].includes(patch.role)) throw new Error('Invalid role');
    sets.push('role = ?');
    args.push(patch.role);
  }

  if (patch.email_opt_in !== undefined) {
    sets.push('email_opt_in = ?');
    args.push(patch.email_opt_in ? 1 : 0);
  }

  if (patch.admin_note !== undefined) {
    sets.push('admin_note = ?');
    args.push(String(patch.admin_note || ''));
  }

  if (sets.length === 1) throw new Error('No fields to update');

  args.push(userId);
  await db.execute({
    sql: `UPDATE users SET ${sets.join(', ')} WHERE id = ?`,
    args,
  });
  return getUserById(userId);
}

/** @deprecated use updateUser */
export async function updateUserRole(userId, role) {
  return updateUser(userId, { role });
}
