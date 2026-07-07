/**
 * Shared /api handler for local dev (Express standalone or Vite middleware).
 * Uses the same dispatch() as Vercel production.
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dispatch } from '../api/_lib/router.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '..');

let envLoaded = false;

export function loadDevEnv() {
  if (envLoaded) return;
  dotenv.config({ path: path.join(PROJECT_ROOT, '.env.local') });
  dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });
  envLoaded = true;
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString();
      if (!raw) return resolve(undefined);
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

/** Vercel/Express-style helpers on Node http.ServerResponse */
function enhanceResponse(res) {
  if (res._nambacEnhanced) return res;
  res._nambacEnhanced = true;

  let statusCode = 200;
  const originalEnd = res.end.bind(res);

  res.status = (code) => {
    statusCode = code;
    res.statusCode = code;
    return res;
  };

  res.json = (body) => {
    if (!res.headersSent) {
      res.statusCode = statusCode;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
    originalEnd(JSON.stringify(body));
    return res;
  };

  res.send = (body) => {
    if (!res.headersSent) res.statusCode = statusCode;
    if (Buffer.isBuffer(body) || body instanceof Uint8Array) {
      originalEnd(body);
    } else {
      originalEnd(String(body));
    }
    return res;
  };

  res.redirect = (code, url) => {
    res.statusCode = code;
    res.setHeader('Location', url);
    originalEnd();
    return res;
  };

  return res;
}

function parseQuery(url) {
  const idx = url.indexOf('?');
  if (idx === -1) return {};
  return Object.fromEntries(new URL(url, 'http://localhost').searchParams);
}

export async function handleApiRequest(req, res) {
  loadDevEnv();
  enhanceResponse(res);

  const url = req.url || '';
  const pathname = url.split('?')[0];
  const apiPath = pathname.replace(/^\/api\/?/, '');
  const segments = apiPath.split('/').filter(Boolean);

  let body = req.body;
  if (body === undefined && req.method && !['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    body = await readJsonBody(req);
  }

  const vercelReq = {
    method: req.method,
    headers: req.headers,
    body,
    url,
    query: { ...parseQuery(url), path: segments },
  };

  return dispatch(vercelReq, res, segments);
}

/** Connect middleware — mount on /api in Vite or Express */
export function createApiMiddleware() {
  return (req, res, next) => {
    const pathname = (req.url || '').split('?')[0];
    if (!pathname.startsWith('/api')) return next();

    handleApiRequest(req, res).catch((err) => {
      console.error('[api]', err);
      if (!res.headersSent) {
        enhanceResponse(res);
        res.status(500).json({ error: err.message || 'Internal server error' });
      }
    });
  };
}
