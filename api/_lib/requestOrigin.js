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

function deploymentHosts() {
  return [
    process.env.VERCEL_URL,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  ]
    .flatMap((host) => withWwwVariants(hostnameFromUrl(host ? `https://${host}` : '')))
    .filter(Boolean);
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
    ...deploymentHosts(),
    // Canonical product hosts (apex redirects to www in production)
    'nambac.xyz',
    'www.nambac.xyz',
  ].filter(Boolean));

  return allowed.has(refHost);
}
