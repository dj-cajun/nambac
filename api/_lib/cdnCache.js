/** Shared CDN cache headers for public GET APIs. */
export const SHORT_CDN_CACHE = 'public, s-maxage=30, stale-while-revalidate=120';
export const MEDIUM_CDN_CACHE = 'public, s-maxage=60, stale-while-revalidate=300';

export function setPublicGetCache(res, directive = SHORT_CDN_CACHE) {
  res.setHeader('Cache-Control', directive);
  res.setHeader('CDN-Cache-Control', directive);
  res.setHeader('Vercel-CDN-Cache-Control', directive);
}

export function setNoStore(res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('CDN-Cache-Control', 'no-store');
  res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
}
