import { FORTUNE_COUNT } from './fortuneData.js';
import { ROAST_TRAITS } from './roastData.js';
import { BRAIN_RESULTS } from './brainData.js';
import { getIctDateString, hashString, pickDailyBalanceQuestion } from './dailyPicks.js';
import { getDateStr } from './fortuneEngine.js';

/** Intro card index for a date — same logic as FortunePage intro preview */
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

export function getFortuneThumbnailPath(dateLabel, fortuneIndex) {
  const idx = normalizeFortuneIndex(fortuneIndex);
  return `/images/fortune_${dateLabel}_idx${idx}.webp`;
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
  const todayIdx = introFortuneIndexFromDate(today);
  const tomorrowIdx = introFortuneIndexFromDate(tomorrow);
  const roastTrait = pickDailyRoastTrait(date);
  const brainResult = pickDailyBrainResult(date);
  const dailyBalance = pickDailyBalanceQuestion(date);

  return {
    fortuneToday: {
      src: getFortuneThumbnailPath(today, todayIdx),
      seed: `fortune-${today}-${todayIdx}`,
      fortuneIndex: todayIdx,
      dateLabel: today,
    },
    fortuneTomorrow: {
      src: getFortuneThumbnailPath(tomorrow, tomorrowIdx),
      seed: `fortune-${tomorrow}-${tomorrowIdx}`,
      fortuneIndex: tomorrowIdx,
      dateLabel: tomorrow,
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
