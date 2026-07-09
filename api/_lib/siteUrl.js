import { CANONICAL_SITE_ORIGIN, normalizeSiteOrigin } from '../../shared/siteOrigin.js';

/** Server-side site URL (no import.meta) */
export function buildSiteUrl(path = '') {
  const base = normalizeSiteOrigin(
    process.env.VITE_SITE_URL
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')
      || CANONICAL_SITE_ORIGIN,
  );
  if (!path) return base;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
