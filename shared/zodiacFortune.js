/**
 * Fortune zodiac assets — Western sign (cung) + Vietnamese con giáp (năm sinh).
 * Static images: /images/zodiac_west_{id}.webp, /images/zodiac_cn_{id}.webp
 */
import { ZODIAC_SIGNS } from './vbti/cross-zodiac.js';
import { normalizeFortuneAxis } from './fortuneMeta.js';
import { normalizeFortuneDob } from './fortuneEngine.js';

/** Vietnamese con giáp — Mão = Mèo (not rabbit) */
export const CHINESE_ZODIAC_ANIMALS = Object.freeze([
  { id: 'ty', name: 'Chuột', emoji: '🐭' },
  { id: 'suu', name: 'Trâu', emoji: '🐮' },
  { id: 'dan', name: 'Hổ', emoji: '🐯' },
  { id: 'mao', name: 'Mèo', emoji: '🐱' },
  { id: 'thin', name: 'Rồng', emoji: '🐲' },
  { id: 'ran', name: 'Rắn', emoji: '🐍' },
  { id: 'ngo', name: 'Ngựa', emoji: '🐴' },
  { id: 'mui', name: 'Dê', emoji: '🐐' },
  { id: 'than', name: 'Khỉ', emoji: '🐵' },
  { id: 'dau', name: 'Gà', emoji: '🐔' },
  { id: 'tuat', name: 'Chó', emoji: '🐶' },
  { id: 'hoi', name: 'Heo', emoji: '🐷' },
]);

const CN_IDS = CHINESE_ZODIAC_ANIMALS.map((a) => a.id);

/** Western zodiac from YYYY-MM-DD */
export function getWesternZodiacFromDob(dob) {
  const s = normalizeFortuneDob(dob);
  if (!s) return ZODIAC_SIGNS[0];
  const [, mm, dd] = s.split('-').map(Number);
  const day = dd;
  const month = mm;

  const inRange = (m1, d1, m2, d2) => {
    if (month === m1 && day >= d1) return true;
    if (month === m2 && day <= d2) return true;
    return false;
  };

  if (inRange(3, 21, 4, 19)) return ZODIAC_SIGNS.find((z) => z.id === 'aries');
  if (inRange(4, 20, 5, 20)) return ZODIAC_SIGNS.find((z) => z.id === 'taurus');
  if (inRange(5, 21, 6, 20)) return ZODIAC_SIGNS.find((z) => z.id === 'gemini');
  if (inRange(6, 21, 7, 22)) return ZODIAC_SIGNS.find((z) => z.id === 'cancer');
  if (inRange(7, 23, 8, 22)) return ZODIAC_SIGNS.find((z) => z.id === 'leo');
  if (inRange(8, 23, 9, 22)) return ZODIAC_SIGNS.find((z) => z.id === 'virgo');
  if (inRange(9, 23, 10, 22)) return ZODIAC_SIGNS.find((z) => z.id === 'libra');
  if (inRange(10, 23, 11, 21)) return ZODIAC_SIGNS.find((z) => z.id === 'scorpio');
  if (inRange(11, 22, 12, 21)) return ZODIAC_SIGNS.find((z) => z.id === 'sagittarius');
  if (month === 12 && day >= 22) return ZODIAC_SIGNS.find((z) => z.id === 'capricorn');
  if (month === 1 && day <= 19) return ZODIAC_SIGNS.find((z) => z.id === 'capricorn');
  if (inRange(1, 20, 2, 18)) return ZODIAC_SIGNS.find((z) => z.id === 'aquarius');
  return ZODIAC_SIGNS.find((z) => z.id === 'pisces');
}

/** Con giáp from birth year (solar year — VN Gen Z apps) */
export function getChineseZodiacFromDob(dob) {
  const s = normalizeFortuneDob(dob);
  if (!s) return CHINESE_ZODIAC_ANIMALS[0];
  const year = parseInt(s.slice(0, 4), 10);
  const idx = ((year - 1900) % 12 + 12) % 12;
  return CHINESE_ZODIAC_ANIMALS[idx];
}

/** Daily intro rotation when DOB not yet entered */
export function pickWesternZodiacForDate(dateStr) {
  let hash = 0;
  const seed = String(dateStr || '');
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return ZODIAC_SIGNS[hash % ZODIAC_SIGNS.length];
}

/** Fallback when no DOB — map fortune archetype index → zodiac visual */
export function pickWesternZodiacFromFortuneIndex(fortuneIndex) {
  const idx = Math.abs(Number(fortuneIndex) || 0) % ZODIAC_SIGNS.length;
  return ZODIAC_SIGNS[idx];
}

/**
 * Which static zodiac image to show.
 * - love / general → cung hoàng đạo (birth month-day)
 * - money / health → con giáp (birth year)
 */
export function resolveFortuneZodiacAsset({ dob, axis, fortuneIndex, dateStr }) {
  const normalizedDob = normalizeFortuneDob(dob);
  const ax = normalizeFortuneAxis(axis);

  if (normalizedDob && (ax === 'money' || ax === 'health')) {
    const cn = getChineseZodiacFromDob(normalizedDob);
    return {
      kind: 'cn',
      id: cn.id,
      label: `${cn.emoji} ${cn.name}`,
      path: `/images/zodiac_cn_${cn.id}.webp`,
    };
  }

  if (normalizedDob) {
    const west = getWesternZodiacFromDob(normalizedDob);
    return {
      kind: 'west',
      id: west.id,
      label: `${west.emoji} ${west.name}`,
      path: `/images/zodiac_west_${west.id}.webp`,
    };
  }

  const west = dateStr
    ? pickWesternZodiacForDate(dateStr)
    : pickWesternZodiacFromFortuneIndex(fortuneIndex);
  return {
    kind: 'west',
    id: west.id,
    label: `${west.emoji} ${west.name}`,
    path: `/images/zodiac_west_${west.id}.webp`,
  };
}

export function getZodiacImagePublicPath(kind, id) {
  const safeKind = kind === 'cn' ? 'cn' : 'west';
  const safeId = String(id || '').trim().toLowerCase();
  if (safeKind === 'cn' && !CN_IDS.includes(safeId)) return '/images/zodiac_west_aries.webp';
  if (safeKind === 'west' && !ZODIAC_SIGNS.some((z) => z.id === safeId)) {
    return '/images/zodiac_west_aries.webp';
  }
  return `/images/zodiac_${safeKind}_${safeId}.webp`;
}

export { ZODIAC_SIGNS };
