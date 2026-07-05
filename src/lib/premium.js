const PREMIUM_KEY = 'nambac_premium';
const PREMIUM_CODE = import.meta.env.VITE_PREMIUM_CODE || 'nambac-vip';

export function isAdFree() {
  try {
    if (localStorage.getItem(PREMIUM_KEY) === '1') return true;
    const params = new URLSearchParams(window.location.search);
    if (params.get('premium') === PREMIUM_CODE) {
      localStorage.setItem(PREMIUM_KEY, '1');
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

export function enablePremium(code) {
  if (code === PREMIUM_CODE) {
    localStorage.setItem(PREMIUM_KEY, '1');
    return true;
  }
  return false;
}

export function disablePremium() {
  localStorage.removeItem(PREMIUM_KEY);
}
