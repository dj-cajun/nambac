import { dispatch } from './_lib/router.js';

function parseSegments(req) {
  const raw = req.query?.path;
  if (raw !== undefined && raw !== null) {
    const fromQuery = Array.isArray(raw)
      ? raw.filter(Boolean)
      : String(raw).split('/').filter(Boolean);
    if (fromQuery.length > 0) return fromQuery;
  }

  const pathname = (req.url || '').split('?')[0];
  const marker = '/api/';
  const idx = pathname.indexOf(marker);
  if (idx !== -1) {
    const fromUrl = pathname.slice(idx + marker.length).split('/').filter(Boolean);
    if (fromUrl.length > 0) return fromUrl;
  }

  // Vercel catch-all sometimes omits query.path — use pathname after leading slash
  if (pathname.startsWith('/')) {
    const stripped = pathname.replace(/^\//, '').split('/').filter(Boolean);
    if (stripped.length > 0) return stripped;
  }

  return [];
}

export default async function handler(req, res) {
  return dispatch(req, res, parseSegments(req));
}

export const config = {
  maxDuration: 300,
};
