/**
 * Liên Quân quiz pool — 5 difficulty tiers × 10 questions (50 total).
 */
import { buildAllTierStubs } from './quizTemplates.js';

export const QUIZ_TIER_COUNT = 10;

export const QUIZ_DIFFICULTIES = [
  {
    id: 1,
    slug: 'cap-1',
    label: 'Cấp 1',
    subtitle: 'Đồng · Thuật ngữ cơ bản',
    emoji: '🥉',
    masteryHint: 'Mới làm quen Liên Quân',
    masteryCap: 1,
  },
  {
    id: 2,
    slug: 'cap-2',
    label: 'Cấp 2',
    subtitle: 'Thông Thạo 1–2 · Lane & tướng',
    emoji: '⚔️',
    masteryHint: 'Biết ai đi đường nào',
    masteryCap: 2,
  },
  {
    id: 3,
    slug: 'cap-3',
    label: 'Cấp 3',
    subtitle: 'Thông Thạo 3–4 · Counter pick',
    emoji: '💠',
    masteryHint: 'Chọn tướng khắc chế',
    masteryCap: 4,
  },
  {
    id: 4,
    slug: 'cap-4',
    label: 'Cấp 4',
    subtitle: 'Thông Thạo 5–6 · Mẹo lane',
    emoji: '👑',
    masteryHint: 'Đọc tip pro',
    masteryCap: 6,
  },
  {
    id: 5,
    slug: 'cap-5',
    label: 'Cấp 5',
    subtitle: 'Thông Thạo 7 · Giáo án AOG',
    emoji: '🏆',
    masteryHint: 'Build & rune pro',
    masteryCap: 7,
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

/** Map tier (1–5) + correct count → Thông Thạo 0–7; harder tiers cap higher */
export function scoreTierToMastery(tierId, correctCount) {
  const tier = Math.max(1, Math.min(5, Number(tierId) || 1));
  const meta = getTierMeta(tier);
  const cap = meta.masteryCap ?? 7;
  const n = Math.max(0, Math.min(QUIZ_TIER_COUNT, Number(correctCount) || 0));
  const floor = Math.max(0, cap - 3);
  const span = Math.max(1, cap - floor);
  const level = floor + Math.round((n / QUIZ_TIER_COUNT) * span);
  return Math.min(cap, Math.max(floor, level));
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
