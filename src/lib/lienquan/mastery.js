import { apiUrl } from '../apiConfig';
import { getVisitorId } from '../siteVisit';
import { masteryLabel } from '../../../shared/lienquan/quizQuestions.js';

const LS_KEY = 'nambac_lienquan_mastery';

export function readLocalMastery() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { level: 0 };
    const parsed = JSON.parse(raw);
    return { level: Math.max(0, Math.min(7, Number(parsed.level) || 0)) };
  } catch {
    return { level: 0 };
  }
}

export function writeLocalMastery(level) {
  const safe = Math.max(0, Math.min(7, Number(level) || 0));
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ level: safe, at: Date.now() }));
  } catch {
    /* ignore */
  }
  return safe;
}

export async function fetchMastery() {
  const local = readLocalMastery();
  try {
    const params = new URLSearchParams({ visitorId: getVisitorId() });
    const res = await fetch(apiUrl(`/lienquan/mastery?${params}`), { credentials: 'include' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ...local, label: masteryLabel(local.level) };
    const level = Math.max(local.level, Number(data.level) || 0);
    if (level > local.level) writeLocalMastery(level);
    return { level, label: masteryLabel(level) };
  } catch {
    return { ...local, label: masteryLabel(local.level) };
  }
}

export async function saveMastery(level) {
  const safe = writeLocalMastery(level);
  try {
    await fetch(apiUrl('/lienquan/mastery'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level: safe, visitorId: getVisitorId() }),
    });
  } catch {
    /* local is enough */
  }
  return { level: safe, label: masteryLabel(safe) };
}
