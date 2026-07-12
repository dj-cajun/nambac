/**
 * Tracks which "today" mini-activities the user has actually completed.
 *
 * Stored per local calendar day in localStorage so it auto-resets at midnight.
 * Shape: { date: 'YYYY-MM-DD', ids: ['quiz', 'fortune', 'balance', 'roast', 'brain', 'sbti', 'lienquan'] }
 *
 * Recorded at the real completion moment of each activity (result revealed /
 * vote submitted), not merely on click, so the Home badge means "đã chơi".
 */
const TODAY_DONE_KEY = 'nambac-today-done';

export const TODAY_IDS = ['quiz', 'fortune', 'balance', 'roast', 'brain', 'sbti', 'lienquan'];

export function localDateKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function readTodayDone() {
  try {
    const raw = JSON.parse(localStorage.getItem(TODAY_DONE_KEY) || '{}');
    if (raw.date === localDateKey() && Array.isArray(raw.ids)) return new Set(raw.ids);
  } catch {
    // ignore malformed storage
  }
  return new Set();
}

function writeTodayDone(set) {
  try {
    localStorage.setItem(TODAY_DONE_KEY, JSON.stringify({ date: localDateKey(), ids: [...set] }));
  } catch {
    // ignore storage failures (private mode, quota)
  }
}

/**
 * Mark one activity as completed today. Idempotent.
 * @param {'quiz'|'fortune'|'balance'|'roast'|'brain'|'sbti'|'lienquan'} id
 */
export function markTodayDone(id) {
  if (!TODAY_IDS.includes(id)) return;
  const set = readTodayDone();
  if (set.has(id)) return;
  set.add(id);
  writeTodayDone(set);
}

export function isTodayDone(id) {
  return readTodayDone().has(id);
}
