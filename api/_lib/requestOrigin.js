import { buildSiteUrl } from './siteUrl.js';

function hostnameFromUrl(value) {
  try {
    return new URL(value).hostname;
  } catch {
    return '';
  }
}

/** Block obvious cross-site stats spam in production. */
export function isTrustedSiteRequest(req) {
  if (!process.env.VERCEL) return true;

  const referer = req.headers.referer || req.headers.origin || '';
  if (!referer) return false;

  const refHost = hostnameFromUrl(referer);
  if (!refHost) return false;

  const allowed = new Set([
    hostnameFromUrl(buildSiteUrl()),
    hostnameFromUrl(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ''),
    'localhost',
    '127.0.0.1',
  ].filter(Boolean));

  if (allowed.has(refHost)) return true;
  if (refHost.endsWith('.vercel.app')) return true;
  return false;
}
