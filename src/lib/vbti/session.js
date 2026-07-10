const STORAGE_KEY = 'nambac:sbti:lastResult';

export function saveSbtiResult(payload) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...payload,
      savedAt: Date.now(),
    }));
  } catch {
    /* ignore */
  }
}

export function loadSbtiResult() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSbtiResult() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
