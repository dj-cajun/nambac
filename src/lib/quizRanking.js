/** Score for hero / viral surfaces: play volume + share intent. */
export function getViralScore(quiz) {
  const participants = quiz.participant_count || 0;
  const shares = quiz.share_count || 0;
  const views = quiz.view_count || 0;
  const likes = quiz.like_count || 0;
  const shareRate = participants > 0 ? shares / participants : 0;

  if (participants === 0 && shares === 0) {
    return views + likes * 5;
  }

  return participants * 10 + shares * 30 + likes * 5 + shareRate * 100;
}

export function sortByViralScore(quizzes) {
  return [...quizzes].sort((a, b) => getViralScore(b) - getViralScore(a));
}

/** Track view once per quiz per browser session (Home → QuizPage double-count guard). */
export function trackQuizViewOnce(quizId) {
  if (!quizId || window.__viewedQuiz?.[quizId]) return false;
  window.__viewedQuiz = { ...(window.__viewedQuiz || {}), [quizId]: true };
  return true;
}

const QUIZ_LIKE_PREFIX = 'nambac_quiz_like_';

/** One like per quiz per browser session */
export function trackQuizLikeOnce(quizId) {
  if (!quizId) return false;
  const key = `${QUIZ_LIKE_PREFIX}${quizId}`;
  try {
    if (sessionStorage.getItem(key) === '1') return false;
    sessionStorage.setItem(key, '1');
    return true;
  } catch {
    return false;
  }
}

export function hasQuizLikedThisSession(quizId) {
  if (!quizId) return false;
  try {
    return sessionStorage.getItem(`${QUIZ_LIKE_PREFIX}${quizId}`) === '1';
  } catch {
    return false;
  }
}
