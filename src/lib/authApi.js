import { apiUrl } from './apiConfig';
import { clearAdminSessionToken, getAdminSessionToken, setAdminSessionToken } from './adminSession.js';

const fetchOpts = { credentials: 'include' };

export async function fetchCurrentUser() {
  const headers = {};
  const token = getAdminSessionToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(apiUrl('/auth/me'), { ...fetchOpts, headers });
  if (!res.ok) return null;
  const data = await res.json().catch(() => ({}));
  return data.user || null;
}

export function googleLoginUrl(returnTo = '/') {
  const safeReturn = String(returnTo || '/').startsWith('/') ? returnTo : '/';
  const qs = `returnTo=${encodeURIComponent(safeReturn)}`;
  // Full-page OAuth redirect — use pretty /api/auth/* URL (Vercel rewrite), not handler?path=
  if (import.meta.env.PROD) {
    return `/api/auth/google?${qs}`;
  }
  return apiUrl(`/auth/google?${qs}`);
}

export async function logoutUser() {
  const res = await fetch(apiUrl('/auth/logout'), { ...fetchOpts, method: 'POST' });
  clearAdminSessionToken();
  if (!res.ok) throw new Error('Logout failed');
  return true;
}

export async function loginAdmin(username, password) {
  const res = await fetch(apiUrl('/auth/admin/login'), {
    ...fetchOpts,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Login failed');
  if (data.sessionToken) setAdminSessionToken(data.sessionToken);
  return data.user || null;
}
