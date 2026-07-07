import { getFortuneByIndex } from './fortuneData.js';

/** YYYY-MM-DD in local timezone */
export function getDateStr(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isValidFortuneDateLabel(dateLabel) {
  return typeof dateLabel === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateLabel);
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
  const fortune = getFortuneByIndex(fortuneIndex);
  const soulmateIndex = (fortuneIndex + 3) % 8;
  const rivalIndex = (fortuneIndex + 4) % 8;
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

/** Parse YYYY-MM-DD as local calendar date — no silent fallback (keeps OG/share dates frozen). */
export function parseFortuneDateLabel(dateLabel) {
  if (!isValidFortuneDateLabel(dateLabel)) {
    throw new Error(`Invalid fortune date label: ${dateLabel}`);
  }
  const [y, m, d] = dateLabel.split('-').map((n) => parseInt(n, 10));
  return new Date(y, m - 1, d);
}

/** Short date for result titles — e.g. 7/7/2026 (vi-VN) */
export function formatFortuneDateShort(dateLabel) {
  return parseFortuneDateLabel(dateLabel).toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });
}

/** Long date for footer — e.g. Thứ Ba, 7 tháng 7, 2026 */
export function formatFortuneDateLong(dateLabel) {
  return parseFortuneDateLabel(dateLabel).toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Result headline — name + today's date + fortune archetype title */
export function buildFortuneResultTitle({ name, fortune, dateLabel }) {
  const dateShort = formatFortuneDateShort(dateLabel);
  const who = String(name || '').trim();
  const archetype = `${fortune.emoji} ${fortune.title}`;
  if (who) return `${who} · ${dateShort} · ${archetype}`;
  return `${dateShort} · ${archetype}`;
}

export function buildFortuneShareUrl(name, fortuneIndex, dateLabel, origin) {
  if (!isValidFortuneDateLabel(dateLabel)) {
    throw new Error('buildFortuneShareUrl requires dateLabel (YYYY-MM-DD)');
  }
  const base = origin || (typeof window !== 'undefined' ? window.location.origin : 'https://nambac.xyz');
  const idx = ((Number(fortuneIndex) % 8) + 8) % 8;
  const encodedName = encodeURIComponent(String(name).trim());
  return `${base}/share-fortune/${encodedName}/${idx}/${dateLabel}`;
}

/** OG preview image — date is required so previews never roll to the next day. */
export function buildFortuneOgImageUrl(name, fortuneIndex, dateLabel, origin) {
  if (!isValidFortuneDateLabel(dateLabel)) {
    throw new Error('buildFortuneOgImageUrl requires dateLabel (YYYY-MM-DD)');
  }
  const base = origin || (typeof window !== 'undefined' ? window.location.origin : 'https://nambac.xyz');
  const params = new URLSearchParams({
    name: String(name).trim(),
    idx: String(fortuneIndex),
    date: dateLabel,
  });
  return `${base}/api/fortune-og?${params.toString()}`;
}

export function parseFortuneShareParams(searchParams) {
  const friendName = (searchParams.get('name') || '').trim();
  const idxRaw = searchParams.get('idx');
  const idx = idxRaw !== null && idxRaw !== '' ? Number(idxRaw) : null;
  const dateParam = (searchParams.get('date') || '').trim();
  const dateLabel = isValidFortuneDateLabel(dateParam) ? dateParam : null;
  if (!friendName || idx === null || Number.isNaN(idx)) return null;
  return {
    friendName,
    fortuneIndex: ((idx % 8) + 8) % 8,
    dateLabel,
    fortune: getFortuneByIndex(idx),
  };
}
