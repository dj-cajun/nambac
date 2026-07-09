import crypto from 'crypto';

function timingSafeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

export function getAdminCredentials() {
  return {
    username: (process.env.ADMIN_USERNAME || '').trim(),
    password: process.env.ADMIN_PASSWORD || '',
  };
}

export function isAdminLoginConfigured() {
  const { username, password } = getAdminCredentials();
  return Boolean(username && password);
}

export function verifyAdminCredentials(username, password) {
  const expected = getAdminCredentials();
  if (!expected.username || !expected.password) return false;
  return timingSafeEqual(username, expected.username)
    && timingSafeEqual(password, expected.password);
}
