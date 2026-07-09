import { apiUrl } from './apiConfig';

const fetchOpts = { credentials: 'include' };

export async function fetchCurrentUser() {
  const res = await fetch(apiUrl('/auth/me'), fetchOpts);
  if (!res.ok) return null;
  const data = await res.json().catch(() => ({}));
  return data.user || null;
}

export function googleLoginUrl(returnTo = '/') {
  const safeReturn = String(returnTo || '/').startsWith('/') ? returnTo : '/';
  return apiUrl(`/auth/google?returnTo=${encodeURIComponent(safeReturn)}`);
}

export async function logoutUser() {
  const res = await fetch(apiUrl('/auth/logout'), { ...fetchOpts, method: 'POST' });
  if (!res.ok) throw new Error('Logout failed');
  return true;
}
