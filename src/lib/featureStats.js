import { apiUrl } from './apiConfig';

const DEFAULT = { view_count: 0, share_count: 0, like_count: 0 };
const VIEW_SESSION_PREFIX = 'nambac_feat_viewed_';
const LIKE_SESSION_PREFIX = 'nambac_feat_liked_';

async function parseJson(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

/** Fetch all mini-app stats at once → { balance: {...}, roast: {...} } */
export async function fetchAllFeatureStats() {
  try {
    return await parseJson(await fetch(apiUrl('feature/stats?kind=all')));
  } catch {
    return { balance: { kind: 'balance', ...DEFAULT }, roast: { kind: 'roast', ...DEFAULT } };
  }
}

export async function fetchFeatureStats(kind) {
  try {
    const params = new URLSearchParams({ kind });
    return await parseJson(await fetch(apiUrl(`feature/stats?${params}`)));
  } catch {
    return { kind, ...DEFAULT };
  }
}

export async function incrementFeatureStat(kind, field) {
  return parseJson(await fetch(apiUrl('feature/stats'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind, field }),
  }));
}

/** Count a view at most once per browser session per feature. */
export function trackFeatureViewOnce(kind) {
  try {
    const key = `${VIEW_SESSION_PREFIX}${kind}`;
    if (sessionStorage.getItem(key)) return false;
    sessionStorage.setItem(key, '1');
    return true;
  } catch {
    return true;
  }
}

/** Allow one like per browser (persisted) per feature. */
export function trackFeatureLikeOnce(kind) {
  try {
    const key = `${LIKE_SESSION_PREFIX}${kind}`;
    if (localStorage.getItem(key)) return false;
    localStorage.setItem(key, '1');
    return true;
  } catch {
    return true;
  }
}

export function hasLikedFeature(kind) {
  try {
    return Boolean(localStorage.getItem(`${LIKE_SESSION_PREFIX}${kind}`));
  } catch {
    return false;
  }
}
