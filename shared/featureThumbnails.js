import { FORTUNE_COUNT } from './fortuneData.js';
import { ROAST_TRAITS } from './roastData.js';
import { BRAIN_RESULTS } from './brainData.js';
import { getIctDateString, hashString, pickDailyBalanceQuestion } from './dailyPicks.js';
import { getDateStr } from './fortuneEngine.js';
import { pickWesternZodiacForDate } from './zodiacFortune.js';

/** @deprecated use pickWesternZodiacForDate — kept for scripts referencing idx */
export function introFortuneIndexFromDate(dateLabel) {
  let hash = 2166136261;
  for (let i = 0; i < dateLabel.length; i += 1) {
    hash ^= dateLabel.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return Math.abs(hash) % FORTUNE_COUNT;
}

export function normalizeFortuneIndex(fortuneIndex) {
  return ((Number(fortuneIndex) % FORTUNE_COUNT) + FORTUNE_COUNT) % FORTUNE_COUNT;
}

/** Daily rotating western zodiac thumb — static pool, no per-day AI */
export function getFortuneThumbnailPath(dateLabel) {
  const sign = pickWesternZodiacForDate(dateLabel);
  return `/images/zodiac_west_${sign.id}.webp`;
}

export function addDaysToDateLabel(dateLabel, days) {
  const d = new Date(`${dateLabel}T00:00:00`);
  d.setDate(d.getDate() + days);
  return getDateStr(d);
}

export function pickDailyRoastTrait(date = new Date()) {
  const ictDate = getIctDateString(date);
  const idx = hashString(`roast_thumb_${ictDate}`) % ROAST_TRAITS.length;
  return ROAST_TRAITS[idx];
}

export function pickDailyBrainResult(date = new Date()) {
  const ictDate = getIctDateString(date);
  const idx = hashString(`brain_thumb_${ictDate}`) % BRAIN_RESULTS.length;
  return BRAIN_RESULTS[idx];
}

export function getRoastThumbnailPath(traitId) {
  return `/images/roast_${traitId}.webp`;
}

export function getBrainThumbnailPath(resultId) {
  return `/images/brain_${resultId}.webp`;
}

export function getBalanceThumbnailPath(questionId) {
  const id = String(questionId || '').replace(/[^a-zA-Z0-9_-]/g, '');
  return id ? `/images/balance_${id}.webp` : '';
}

export function getLienquanThumbnailPath() {
  return '/images/lienquan_hub.webp';
}

export function getSbtiThumbnailPath() {
  return '/images/sbti_hub.webp';
}

export function getHomeFeatureThumbPlan(date = new Date()) {
  const today = getDateStr(date);
  const tomorrow = addDaysToDateLabel(today, 1);
  const todaySign = pickWesternZodiacForDate(today);
  const tomorrowSign = pickWesternZodiacForDate(tomorrow);
  const roastTrait = pickDailyRoastTrait(date);
  const brainResult = pickDailyBrainResult(date);
  const dailyBalance = pickDailyBalanceQuestion(date);

  return {
    fortuneToday: {
      src: getFortuneThumbnailPath(today),
      seed: `zodiac-west-${today}-${todaySign.id}`,
      fortuneIndex: 0,
      dateLabel: today,
      zodiacId: todaySign.id,
    },
    fortuneTomorrow: {
      src: getFortuneThumbnailPath(tomorrow),
      seed: `zodiac-west-${tomorrow}-${tomorrowSign.id}`,
      fortuneIndex: 0,
      dateLabel: tomorrow,
      zodiacId: tomorrowSign.id,
    },
    roast: {
      src: getRoastThumbnailPath(roastTrait.id),
      seed: roastTrait.id,
      traitId: roastTrait.id,
    },
    brain: {
      src: getBrainThumbnailPath(brainResult.id),
      seed: brainResult.id,
      resultId: brainResult.id,
    },
    balance: {
      src: getBalanceThumbnailPath(dailyBalance.id),
      seed: dailyBalance.id,
      questionId: dailyBalance.id,
    },
    lienquan: {
      src: getLienquanThumbnailPath(),
      seed: 'lienquan-hub',
    },
    sbti: {
      src: getSbtiThumbnailPath(),
      seed: 'sbti-hub',
    },
  };
}
