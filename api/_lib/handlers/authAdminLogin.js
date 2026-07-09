import { isAdminLoginConfigured, verifyAdminCredentials } from '../adminCredentials.js';
import { setSessionCookie } from '../session.js';

const ADMIN_PASSWORD_USER_ID = 'admin-password';

export function publicPasswordAdminUser(username) {
  return {
    id: ADMIN_PASSWORD_USER_ID,
    email: username,
    name: 'Admin',
    picture_url: '',
    role: 'admin',
    auth_kind: 'admin_password',
  };
}

export function isPasswordAdminSession(session) {
  return session?.role === 'admin' && session?.authKind === 'admin_password';
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!isAdminLoginConfigured()) {
    return res.status(503).json({ error: 'Admin login is not configured' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const username = String(body.username || '').trim();
    const password = String(body.password || '');

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    if (!verifyAdminCredentials(username, password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    setSessionCookie(res, {
      userId: ADMIN_PASSWORD_USER_ID,
      email: username,
      role: 'admin',
      authKind: 'admin_password',
    });

    return res.status(200).json({
      ok: true,
      user: publicPasswordAdminUser(username),
    });
  } catch (err) {
    console.error('POST /api/auth/admin/login', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
