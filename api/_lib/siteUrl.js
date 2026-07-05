/** Server-side site URL (no import.meta) */
export function buildSiteUrl(path = '') {
  const base =
    process.env.VITE_SITE_URL ||
    process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}` ||
    'https://nambac.vercel.app';
  const normalized = base.replace(/\/$/, '');
  if (!path) return normalized;
  return `${normalized}${path.startsWith('/') ? path : `/${path}`}`;
}
