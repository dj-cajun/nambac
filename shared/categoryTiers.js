/**
 * Quiz category tiers — MZ feedback: weak categories deprioritized in auto-generation.
 */
import { QUIZ_CATEGORY_IDS } from './categories.js';

/** Daily cron + batch default rotation — core 5 only */
export const DAILY_CATEGORY_IDS = Object.freeze([
  'MBTI',
  'Personality',
  'PastLife',
  'Fortune',
  'Survival',
]);

/** Manual / admin only — MZ flagged as boring or unclear */
export const DEPRIORITIZED_CATEGORY_IDS = Object.freeze(
  QUIZ_CATEGORY_IDS.filter((id) => !DAILY_CATEGORY_IDS.includes(id)),
);

export function isDailyCategory(categoryId) {
  return DAILY_CATEGORY_IDS.includes(categoryId);
}

/** ICT-day hash pick from Tier A */
export function pickDailyCategory(date = new Date()) {
  const day = Math.floor(date.getTime() / 86_400_000);
  return DAILY_CATEGORY_IDS[day % DAILY_CATEGORY_IDS.length];
}
