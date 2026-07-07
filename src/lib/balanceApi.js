import { apiUrl, getImageUrl } from './apiConfig';

const IMG_CACHE_PREFIX = 'nambac_balance_img_v1_';

function cacheKey(id) {
  return `${IMG_CACHE_PREFIX}${id}`;
}

function readCache(id) {
  try {
    return sessionStorage.getItem(cacheKey(id)) || '';
  } catch {
    return '';
  }
}

function writeCache(id, src) {
  try {
    if (src) sessionStorage.setItem(cacheKey(id), src);
  } catch {
    /* quota / private mode */
  }
}

/** Fetch AI dilemma scene for a balance question — sessionStorage cache, then API. */
export async function fetchBalanceSceneImage(id) {
  if (!id) throw new Error('Balance image: id required');

  const cached = readCache(id);
  if (cached) return { src: cached, cached: true };

  const params = new URLSearchParams({ id });
  const res = await fetch(apiUrl(`balance-image?${params}`));
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Balance image failed (${res.status})`);
  }

  const data = await res.json();
  let src = '';
  if (data.image_url) {
    src = getImageUrl(data.image_url);
  } else if (data.b64) {
    src = `data:image/webp;base64,${data.b64}`;
  }
  if (!src) throw new Error('No image returned');

  writeCache(id, src);
  return { src, cached: false };
}
