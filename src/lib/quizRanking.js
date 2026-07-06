/** Score for hero / viral surfaces: play volume + share intent. */
export function getViralScore(quiz) {
  const participants = quiz.participant_count || 0;
  const shares = quiz.share_count || 0;
  const views = quiz.view_count || 0;
  const shareRate = participants > 0 ? shares / participants : 0;

  if (participants === 0 && shares === 0) {
    return views;
  }

  return participants * 10 + shares * 30 + shareRate * 100;
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
