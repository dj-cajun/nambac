import { FORTUNE_COUNT, getFortuneByIndex } from './fortuneData.js';

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

  const fortuneIndex = Math.abs(hash) % FORTUNE_COUNT;
  const fortune = getFortuneByIndex(fortuneIndex);
  const soulmateIndex =
    Number.isInteger(fortune?.soulmateIndex)
      ? ((fortune.soulmateIndex % FORTUNE_COUNT) + FORTUNE_COUNT) % FORTUNE_COUNT
      : (fortuneIndex + 7) % FORTUNE_COUNT;
  const rivalIndex =
    Number.isInteger(fortune?.villainIndex)
      ? ((fortune.villainIndex % FORTUNE_COUNT) + FORTUNE_COUNT) % FORTUNE_COUNT
      : (fortuneIndex + 11) % FORTUNE_COUNT;
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

/** Rebuild sharer's fortune from link params (idx + date — not visitor's name hash). */
export function buildFortuneResultFromShare(share) {
  if (!share?.friendName) return null;
  const fortuneIndex = share.fortuneIndex;
  const fortune = share.fortune || getFortuneByIndex(fortuneIndex);
  const dateLabel = share.dateLabel || getDateStr();
  const soulmateIndex = Number.isInteger(fortune?.soulmateIndex)
    ? ((fortune.soulmateIndex % FORTUNE_COUNT) + FORTUNE_COUNT) % FORTUNE_COUNT
    : (fortuneIndex + 7) % FORTUNE_COUNT;
  const rivalIndex = Number.isInteger(fortune?.villainIndex)
    ? ((fortune.villainIndex % FORTUNE_COUNT) + FORTUNE_COUNT) % FORTUNE_COUNT
    : (fortuneIndex + 11) % FORTUNE_COUNT;
  return {
    fortuneIndex,
    soulmateIndex,
    rivalIndex,
    dateLabel,
    fortune,
    soulmate: getFortuneByIndex(soulmateIndex),
    rival: getFortuneByIndex(rivalIndex),
    name: share.friendName,
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
  const idx = ((Number(fortuneIndex) % FORTUNE_COUNT) + FORTUNE_COUNT) % FORTUNE_COUNT;
  const encodedName = encodeURIComponent(String(name).trim());
  return `${base}/share-fortune/${encodedName}/${idx}/${dateLabel}`;
}

/** OG preview image — date is required so previews never roll to the next day. */
export function buildFortuneOgImageUrl(name, fortuneIndex, dateLabel, origin) {
  if (!isValidFortuneDateLabel(dateLabel)) {
    throw new Error('buildFortuneOgImageUrl requires dateLabel (YYYY-MM-DD)');
  }
  const base = (origin || (typeof window !== 'undefined' ? window.location.origin : 'https://nambac.xyz')).replace(/\/$/, '');
  const q = new URLSearchParams({
    name: String(name).trim(),
    idx: String(fortuneIndex),
    date: dateLabel,
  });
  const isLocal = base.includes('localhost');
  if (isLocal) {
    return `${base}/api/fortune-og?${q}`;
  }
  const handlerQ = new URLSearchParams({
    path: 'fortune-og',
    name: String(name).trim(),
    idx: String(fortuneIndex),
    date: dateLabel,
  });
  return `${base}/api/handler?${handlerQ}`;
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
    fortuneIndex: ((idx % FORTUNE_COUNT) + FORTUNE_COUNT) % FORTUNE_COUNT,
    dateLabel,
    fortune: getFortuneByIndex(idx),
  };
}
