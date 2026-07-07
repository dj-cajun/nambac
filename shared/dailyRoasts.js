/** @deprecated Use fortuneEngine.js + fortuneData.js */
export { FORTUNE_ARCHETYPES as DAILY_ROASTS, getFortuneByIndex } from './fortuneData.js';
export { calculateTodayFortune, getDateStr } from './fortuneEngine.js';

import { calculateTodayFortune } from './fortuneEngine.js';

export function getTodayRoast(date = new Date()) {
  const { fortune } = calculateTodayFortune('', date);
  return {
    id: fortune.id,
    tag: fortune.title,
    emoji: fortune.emoji,
    body: fortune.body,
  };
}
