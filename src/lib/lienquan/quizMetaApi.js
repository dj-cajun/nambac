import { apiUrl } from '../apiConfig';

let cache = null;
let inflight = null;

export async function fetchLienquanQuizMeta() {
  if (cache) return cache;
  if (inflight) return inflight;

  inflight = fetch(apiUrl('/lienquan/quiz-meta'), { credentials: 'include' })
    .then((res) => (res.ok ? res.json() : { quizId: null, ctaPath: '/lienquan/quiz' }))
    .then((data) => {
      cache = {
        quizId: data?.quizId || null,
        ctaPath: data?.ctaPath || '/lienquan/quiz',
      };
      return cache;
    })
    .catch(() => {
      cache = { quizId: null, ctaPath: '/lienquan/quiz' };
      return cache;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}
