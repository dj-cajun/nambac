import { apiUrl } from './apiConfig';

async function parseJson(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export async function fetchQuizzes() {
  const data = await parseJson(await fetch(apiUrl('/quizzes')));
  return data.quizzes || [];
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
    await fetchQuizzes();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
