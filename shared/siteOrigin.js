/** Canonical public site origin — keep www (apex redirects to www in production). */
export const CANONICAL_SITE_ORIGIN = 'https://www.nambac.xyz';

export function normalizeSiteOrigin(value, fallback = CANONICAL_SITE_ORIGIN) {
  const raw = String(value || '').trim() || fallback;
  return raw.replace(/\/$/, '');
}
