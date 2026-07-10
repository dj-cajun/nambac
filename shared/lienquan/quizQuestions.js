/**
 * Liên Quân quiz scoring + legacy re-exports.
 * Question pool: quizPool.js (5 tiers × 10Q).
 */
import { getTierQuestions } from './quizPool.js';

/** Default explore / backward-compat — tier 3 counter pick */
export const LIENQUAN_QUIZ_QUESTIONS = getTierQuestions(3);

/** Map correct count (0–10) → Thông Thạo level 0–7 (legacy single-pool) */
export function scoreToMastery(correctCount) {
  const n = Math.max(0, Math.min(10, Number(correctCount) || 0));
  if (n <= 1) return 0;
  if (n === 2) return 1;
  if (n === 3) return 2;
  if (n === 4) return 3;
  if (n === 5) return 4;
  if (n === 6) return 5;
  if (n <= 8) return 6;
  return 7;
}

export const MASTERY_LABELS = {
  0: 'Đồng',
  1: 'Thông Thạo 1',
  2: 'Thông Thạo 2',
  3: 'Thông Thạo 3',
  4: 'Thông Thạo 4',
  5: 'Thông Thạo 5',
  6: 'Thông Thạo 6',
  7: 'Thông Thạo 7',
};

export function masteryLabel(level) {
  return MASTERY_LABELS[level] || MASTERY_LABELS[0];
}

export { scoreTierToMastery } from './quizPool.js';
