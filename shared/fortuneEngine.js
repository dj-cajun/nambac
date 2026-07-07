import { getFortuneByIndex } from './fortuneData.js';

/** YYYY-MM-DD in local timezone */
export function getDateStr(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Deterministic daily fortune from date + name (no DB).
 * Same name + same day → same index all day; changes tomorrow.
 */
export function calculateTodayFortune(name = '', date = new Date()) {
  const dateStr = getDateStr(date);
  const combinedSeed = dateStr + String(name).trim().toLowerCase();

  let hash = 5381;
  for (let i = 0; i < combinedSeed.length; i += 1) {
    hash = (hash * 33) ^ combinedSeed.charCodeAt(i);
  }

  const fortuneIndex = Math.abs(hash) % 8;
  const soulmateIndex = (fortuneIndex + 3) % 8;
  const rivalIndex = (fortuneIndex + 4) % 8;
  const fortune = getFortuneByIndex(fortuneIndex);
  const soulmate = getFortuneByIndex(soulmateIndex);
  const rival = getFortuneByIndex(rivalIndex);

  return {
    fortuneIndex,
    soulmateIndex,
    rivalIndex,
    dateLabel: dateStr,
    fortune,
    soulmate,
    rival,
    name: String(name).trim(),
  };
}

export function buildFortuneShareUrl(name, fortuneIndex, origin) {
  const base = origin || (typeof window !== 'undefined' ? window.location.origin : 'https://nambac.xyz');
  const params = new URLSearchParams({
    name: String(name).trim(),
    idx: String(fortuneIndex),
  });
  return `${base}/fortune?${params.toString()}`;
}

/** OG preview image with name burned in — uses cached daily fortune scene */
export function buildFortuneOgImageUrl(name, fortuneIndex, dateLabel, origin) {
  const base = origin || (typeof window !== 'undefined' ? window.location.origin : 'https://nambac.xyz');
  const params = new URLSearchParams({
    name: String(name).trim(),
    idx: String(fortuneIndex),
    date: dateLabel || getDateStr(),
  });
  return `${base}/api/fortune-og?${params.toString()}`;
}

export function parseFortuneShareParams(searchParams) {
  const friendName = (searchParams.get('name') || '').trim();
  const idxRaw = searchParams.get('idx');
  const idx = idxRaw !== null && idxRaw !== '' ? Number(idxRaw) : null;
  if (!friendName || idx === null || Number.isNaN(idx)) return null;
  return {
    friendName,
    fortuneIndex: ((idx % 8) + 8) % 8,
    fortune: getFortuneByIndex(idx),
  };
}
