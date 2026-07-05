import { dispatch } from './_lib/router.js';

function parseSegments(req) {
  const raw = req.query?.path;
  if (raw !== undefined && raw !== null) {
    return Array.isArray(raw) ? raw : String(raw).split('/').filter(Boolean);
  }
  const pathname = (req.url || '').split('?')[0];
  const marker = '/api/';
  const idx = pathname.indexOf(marker);
  if (idx === -1) return [];
  return pathname.slice(idx + marker.length).split('/').filter(Boolean);
}

export default async function handler(req, res) {
  return dispatch(req, res, parseSegments(req));
}

export const config = {
  maxDuration: 300,
};
