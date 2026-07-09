import { clearSessionCookie, getSession, setSessionCookie } from '../session.js';
import { getUserById } from '../userDb.js';
import { isPasswordAdminSession, publicPasswordAdminUser } from './authAdminLogin.js';

function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    picture_url: user.picture_url,
    role: user.role,
    auth_kind: user.auth_kind || 'google',
    last_login_at: user.last_login_at,
    created_at: user.created_at,
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const session = getSession(req);
    if (!session?.userId) {
      return res.status(200).json({ user: null });
    }

    if (isPasswordAdminSession(session)) {
      return res.status(200).json({ user: publicPasswordAdminUser(session.email) });
    }

    const user = await getUserById(session.userId);
    if (!user) {
      clearSessionCookie(res);
      return res.status(200).json({ user: null });
    }

    if (user.role !== session.role) {
      setSessionCookie(res, {
        userId: user.id,
        email: user.email,
        role: user.role,
      });
    }

    return res.status(200).json({ user: publicUser(user) });
  } catch (err) {
    console.error('/api/auth/me', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

export async function authLogout(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  clearSessionCookie(res);
  return res.status(200).json({ ok: true });
}
