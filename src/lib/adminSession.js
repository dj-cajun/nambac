const STORAGE_KEY = 'nambac_admin_session';

export function getAdminSessionToken() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function setAdminSessionToken(token) {
  try {
    if (token) sessionStorage.setItem(STORAGE_KEY, token);
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function clearAdminSessionToken() {
  setAdminSessionToken('');
}
