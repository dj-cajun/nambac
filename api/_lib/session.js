import crypto from 'crypto';

export const SESSION_COOKIE = 'nambac_session';
const MAX_AGE_SEC = 60 * 60 * 24 * 30;

function getSecret() {
  const secret = process.env.SESSION_SECRET || process.env.ADMIN_API_KEY;
  if (secret) return secret;
  if (process.env.VERCEL) throw new Error('SESSION_SECRET is not configured');
  return 'nambac-dev-session';
}

function sign(data) {
  return crypto.createHmac('sha256', getSecret()).update(data).digest('base64url');
}

export function signPayload(payload) {
  const body = { ...payload, exp: Date.now() + MAX_AGE_SEC * 1000 };
  const data = Buffer.from(JSON.stringify(body)).toString('base64url');
  return `${data}.${sign(data)}`;
}

export function verifyPayload(token) {
  if (!token) return null;
  const [data, sig] = String(token).split('.');
  if (!data || !sig || sign(data) !== sig) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString());
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function parseCookies(req) {
  const header = req.headers?.cookie || req.headers?.Cookie || '';
  const out = {};
  for (const part of header.split(';')) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    const value = trimmed.slice(eq + 1);
    out[key] = decodeURIComponent(value);
  }
  return out;
}

export function getSession(req) {
  const cookies = parseCookies(req);
  return verifyPayload(cookies[SESSION_COOKIE]);
}

export function setSessionCookie(res, payload) {
  const token = signPayload(payload);
  const secure = Boolean(process.env.VERCEL) || process.env.NODE_ENV === 'production';
  const parts = [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${MAX_AGE_SEC}`,
  ];
  if (secure) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

export function clearSessionCookie(res) {
  const secure = Boolean(process.env.VERCEL) || process.env.NODE_ENV === 'production';
  const parts = [
    `${SESSION_COOKIE}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
  ];
  if (secure) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

export function signOAuthState(returnTo = '/') {
  return signPayload({ kind: 'oauth', returnTo: String(returnTo || '/').slice(0, 200) });
}

export function verifyOAuthState(state) {
  const payload = verifyPayload(state);
  if (!payload || payload.kind !== 'oauth') return null;
  const returnTo = payload.returnTo || '/';
  if (!returnTo.startsWith('/') || returnTo.startsWith('//')) return '/';
  return returnTo;
}
