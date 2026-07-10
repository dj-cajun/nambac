/**
 * Liên Quân quiz pool — 5 difficulty tiers × 10 questions (50 total).
 */
import { buildAllTierStubs } from './quizTemplates.js';

export const QUIZ_TIER_COUNT = 10;

export const QUIZ_DIFFICULTIES = [
  {
    id: 1,
    slug: 'dong',
    label: 'Đồng',
    subtitle: 'Thuật ngữ & cơ bản',
    emoji: '🥉',
    masteryHint: 'Mới làm quen Liên Quân',
  },
  {
    id: 2,
    slug: 'tt2',
    label: 'Thông Thạo 2',
    subtitle: 'Lane & tướng meta',
    emoji: '⚔️',
    masteryHint: 'Biết ai đi đường nào',
  },
  {
    id: 3,
    slug: 'tt4',
    label: 'Thông Thạo 4',
    subtitle: 'Counter pick',
    emoji: '💠',
    masteryHint: 'Chọn tướng khắc chế',
  },
  {
    id: 4,
    slug: 'tt6',
    label: 'Thông Thạo 6',
    subtitle: 'Mẹo lane & đối đầu',
    emoji: '👑',
    masteryHint: 'Đọc tip pro',
  },
  {
    id: 5,
    slug: 'tt7',
    label: 'Thông Thạo 7',
    subtitle: 'Giáo án AOG',
    emoji: '🏆',
    masteryHint: 'Build & rune pro',
  },
];

const STUBS = buildAllTierStubs();

/** @param {number} tierId 1–5 */
export function getTierMeta(tierId) {
  return QUIZ_DIFFICULTIES.find((d) => d.id === tierId) || QUIZ_DIFFICULTIES[0];
}

/** @param {number} tierId 1–5 */
export function getTierQuestions(tierId) {
  const tier = Math.max(1, Math.min(5, Number(tierId) || 1));
  const qs = STUBS[tier] || [];
  return qs.map(({ source, ...q }) => q);
}

/** Map tier + correct count (0–10) → Thông Thạo level 0–7 */
export function scoreTierToMastery(tierId, correctCount) {
  const tier = Math.max(1, Math.min(5, Number(tierId) || 1));
  const n = Math.max(0, Math.min(QUIZ_TIER_COUNT, Number(correctCount) || 0));
  const base = tier - 1;
  const bonus = n <= 2 ? 0 : n <= 5 ? 1 : n <= 8 ? 2 : 3;
  return Math.min(7, base + bonus);
}

export function tierResultMessage(tierId, correctCount) {
  const meta = getTierMeta(tierId);
  const n = Math.max(0, Math.min(QUIZ_TIER_COUNT, Number(correctCount) || 0));
  if (n >= 9) {
    return `${meta.emoji} ${meta.label} — ${n}/10 xuất sắc! Mark đã lên — khoe Góc Khoe đi.`;
  }
  if (n >= 7) {
    return `${meta.emoji} ${meta.label} — ${n}/10 khá ổn. Thử tier cao hơn xem!`;
  }
  if (n >= 4) {
    return `${meta.emoji} ${meta.label} — ${n}/10. Vào hub copy giáo án rồi thi lại.`;
  }
  return `${meta.emoji} ${meta.label} — ${n}/10. Đừng buồn — rank Đồng ai cũng từng qua 😂`;
}

export const LIENQUAN_QUIZ_POOL = STUBS;
