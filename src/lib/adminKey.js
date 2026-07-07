const STORAGE_KEY = 'nambac_admin_key';

export function getAdminKey() {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
  } catch {
    /* private browsing */
  }
  if (import.meta.env.DEV && import.meta.env.VITE_ADMIN_API_KEY) {
    return import.meta.env.VITE_ADMIN_API_KEY;
  }
  return '';
}

export function setAdminKey(key) {
  sessionStorage.setItem(STORAGE_KEY, key.trim());
}

export function clearAdminKey() {
  sessionStorage.removeItem(STORAGE_KEY);
}
