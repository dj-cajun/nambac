import { apiUrl, getImageUrl } from './apiConfig';
import { FORTUNE_KIND } from '../../shared/fortuneMeta.js';

const IMG_CACHE_PREFIX = 'nambac_fortune_img_v2_';

const DEFAULT_STATS = { kind: FORTUNE_KIND, view_count: 0, share_count: 0, like_count: 0 };

async function parseJson(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export async function fetchFortuneStats(kind = FORTUNE_KIND) {
  try {
    const params = new URLSearchParams({ kind });
    return await parseJson(await fetch(apiUrl(`fortune/stats?${params}`)));
  } catch {
    return { ...DEFAULT_STATS, kind };
  }
}

export async function incrementFortuneStat(field, kind = FORTUNE_KIND) {
  return parseJson(await fetch(apiUrl('fortune/stats'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ field, kind }),
  }));
}

export function fortuneImageCacheKey(dateLabel, fortuneIndex) {
  return `${IMG_CACHE_PREFIX}${dateLabel}_${fortuneIndex}`;
}

export function readFortuneImageCache(dateLabel, fortuneIndex) {
  try {
    return sessionStorage.getItem(fortuneImageCacheKey(dateLabel, fortuneIndex)) || '';
  } catch {
    return '';
  }
}

export function writeFortuneImageCache(dateLabel, fortuneIndex, src) {
  try {
    if (src) sessionStorage.setItem(fortuneImageCacheKey(dateLabel, fortuneIndex), src);
  } catch {
    /* quota / private mode */
  }
}

/** Fetch AI fortune scene — uses sessionStorage cache, then API */
export async function fetchFortuneSceneImage({ fortuneIndex, dateLabel }) {
  const cached = readFortuneImageCache(dateLabel, fortuneIndex);
  if (cached) return { src: cached, cached: true };

  const params = new URLSearchParams({
    idx: String(fortuneIndex),
    date: dateLabel,
  });
  const res = await fetch(apiUrl(`fortune-image?${params}`));
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Fortune image failed (${res.status})`);
  }

  const data = await res.json();
  let src = '';
  if (data.image_url) {
    src = getImageUrl(data.image_url);
  } else if (data.b64) {
    src = `data:image/webp;base64,${data.b64}`;
  }
  if (!src) throw new Error('No image returned');

  writeFortuneImageCache(dateLabel, fortuneIndex, src);
  return { src, cached: false };
}
