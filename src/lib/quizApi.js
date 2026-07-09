import { apiUrl } from './apiConfig';

const QUIZ_LIST_TTL_MS = 45_000;
let quizListCache = null;
let quizListInflight = null;

async function parseJson(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export async function fetchQuizzes({ force = false } = {}) {
  const now = Date.now();
  if (!force && quizListCache && now - quizListCache.at < QUIZ_LIST_TTL_MS) {
    return quizListCache.quizzes;
  }
  if (!force && quizListInflight) return quizListInflight;

  quizListInflight = (async () => {
    const data = await parseJson(await fetch(apiUrl('/quizzes')));
    const quizzes = data.quizzes || [];
    quizListCache = { quizzes, at: Date.now() };
    return quizzes;
  })();

  try {
    return await quizListInflight;
  } finally {
    quizListInflight = null;
  }
}

export async function fetchQuizBundle(quizId) {
  return parseJson(await fetch(apiUrl(`/quizzes/${quizId}`)));
}

export async function fetchQuizResults(quizId) {
  const bundle = await fetchQuizBundle(quizId);
  return bundle.results || [];
}

export async function incrementQuizStat(quizId, field) {
  return parseJson(await fetch(apiUrl(`/quizzes/${quizId}/stats`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ field }),
  }));
}

export async function submitBrandInquiry(payload) {
  return parseJson(await fetch(apiUrl('/brand-inquiries'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }));
}

export async function checkTursoConnection() {
  try {
    await fetchQuizzes({ force: true });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
