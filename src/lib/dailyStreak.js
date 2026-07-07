import { getIctDateString } from '../../shared/dailyPicks.js';

const STORAGE_KEY = 'nambac_visit_streak_v1';

function getYesterdayIct() {
  const now = new Date();
  const ict = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  ict.setUTCDate(ict.getUTCDate() - 1);
  return ict.toISOString().slice(0, 10);
}

function readStore() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeStore(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* private mode */
  }
}

/** Call once per session on home visit — returns { streak, best, last } */
export function recordDailyVisit() {
  const today = getIctDateString();
  const prev = readStore();
  if (prev.last === today) {
    return { streak: prev.streak || 1, best: prev.best || 1, last: today };
  }
  const yesterday = getYesterdayIct();
  const streak = prev.last === yesterday ? (prev.streak || 0) + 1 : 1;
  const best = Math.max(streak, prev.best || 0);
  const next = { last: today, streak, best };
  writeStore(next);
  return next;
}

export function getDailyStreak() {
  const today = getIctDateString();
  const prev = readStore();
  if (prev.last !== today && prev.last !== getYesterdayIct()) {
    return { streak: 0, best: prev.best || 0, last: prev.last || '' };
  }
  return {
    streak: prev.last === today ? (prev.streak || 0) : 0,
    best: prev.best || 0,
    last: prev.last || '',
  };
}
