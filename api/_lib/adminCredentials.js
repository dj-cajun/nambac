import { timingSafeEqualString } from './secureCompare.js';

export function getAdminCredentials() {
  return {
    username: (process.env.ADMIN_USERNAME || '').trim(),
    password: (process.env.ADMIN_PASSWORD || '').trim(),
  };
}

export function isAdminLoginConfigured() {
  const { username, password } = getAdminCredentials();
  return Boolean(username && password);
}

export function verifyAdminCredentials(username, password) {
  const expected = getAdminCredentials();
  if (!expected.username || !expected.password) return false;
  return timingSafeEqualString(username, expected.username)
    && timingSafeEqualString(password, expected.password);
}
