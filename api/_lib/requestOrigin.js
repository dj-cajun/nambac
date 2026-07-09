import { buildSiteUrl } from './siteUrl.js';

function hostnameFromUrl(value) {
  try {
    return new URL(value).hostname;
  } catch {
    return '';
  }
}

function withWwwVariants(hostname) {
  if (!hostname) return [];
  const host = hostname.toLowerCase();
  if (host.startsWith('www.')) {
    return [host, host.slice(4)];
  }
  return [host, `www.${host}`];
}

/** Block obvious cross-site stats spam in production. */
export function isTrustedSiteRequest(req) {
  if (!process.env.VERCEL) return true;

  const referer = req.headers.referer || req.headers.origin || '';
  if (!referer) return false;

  const refHost = hostnameFromUrl(referer).toLowerCase();
  if (!refHost) return false;

  const allowed = new Set([
    ...withWwwVariants(hostnameFromUrl(buildSiteUrl())),
    ...withWwwVariants(hostnameFromUrl(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')),
    // Canonical product hosts (apex redirects to www in production)
    'nambac.xyz',
    'www.nambac.xyz',
    'localhost',
    '127.0.0.1',
  ].filter(Boolean));

  if (allowed.has(refHost)) return true;
  if (refHost.endsWith('.vercel.app')) return true;
  return false;
}
