import { apiUrl } from './apiConfig';
import { getVisitorId } from './siteVisit';

const GRADE_RECORDED_PREFIX = 'nambac_grade_recorded_';

function buildGradeQuery() {
  const params = new URLSearchParams();
  params.set('visitorId', getVisitorId());
  return params.toString();
}

export async function fetchPlayerGrade() {
  try {
    const res = await fetch(`${apiUrl('/player/grade')}?${buildGradeQuery()}`, {
      credentials: 'include',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/** Record quiz completion once per quiz per session; returns grade payload or null. */
export async function recordPlayerQuizComplete(quizId, score) {
  if (!quizId || Number.isNaN(score)) return null;

  try {
    if (sessionStorage.getItem(`${GRADE_RECORDED_PREFIX}${quizId}`)) return null;
    sessionStorage.setItem(`${GRADE_RECORDED_PREFIX}${quizId}`, '1');
  } catch {
    /* private mode — still try API */
  }

  try {
    const res = await fetch(apiUrl('/player/complete'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quizId,
        score,
        visitorId: getVisitorId(),
      }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
