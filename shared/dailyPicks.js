import { BALANCE_QUESTIONS } from './balanceData.js';

/** ICT date string YYYY-MM-DD */
export function getIctDateString(date = new Date()) {
  const ict = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return ict.toISOString().slice(0, 10);
}

export function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash);
}

/** Today's featured quiz — prefer created today (ICT), else deterministic daily pick */
export function pickDailyQuiz(quizzes, date = new Date()) {
  if (!quizzes?.length) return null;
  const ictDate = getIctDateString(date);

  const createdToday = quizzes.filter((q) => {
    if (!q.created_at) return false;
    const d = new Date(q.created_at);
    const qDate = getIctDateString(d);
    return qDate === ictDate;
  });
  if (createdToday.length) {
    return [...createdToday].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    )[0];
  }

  const sorted = [...quizzes].sort((a, b) => String(a.id).localeCompare(String(b.id)));
  return sorted[hashString(ictDate) % sorted.length];
}

export function pickDailyBalanceQuestion(date = new Date()) {
  const ictDate = getIctDateString(date);
  const idx = hashString(`balance_${ictDate}`) % BALANCE_QUESTIONS.length;
  return BALANCE_QUESTIONS[idx];
}
