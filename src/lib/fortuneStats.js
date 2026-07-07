import { FORTUNE_KIND } from '../../shared/fortuneMeta.js';

const VIEW_KEY = `nambac_fortune_view_${FORTUNE_KIND}`;
const LIKE_KEY = `nambac_fortune_like_${FORTUNE_KIND}`;

function sessionFlag(key) {
  try {
    return sessionStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function setSessionFlag(key) {
  try {
    sessionStorage.setItem(key, '1');
  } catch {
    /* private mode */
  }
}

/** One view per fortune kind per browser session */
export function trackFortuneViewOnce() {
  if (sessionFlag(VIEW_KEY)) return false;
  setSessionFlag(VIEW_KEY);
  return true;
}

/** One like per fortune kind per browser session */
export function trackFortuneLikeOnce() {
  if (sessionFlag(LIKE_KEY)) return false;
  setSessionFlag(LIKE_KEY);
  return true;
}

export function hasFortuneLikedThisSession() {
  return sessionFlag(LIKE_KEY);
}
