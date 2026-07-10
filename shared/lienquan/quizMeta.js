/**
 * Liên Quân quiz CTA — copy from uiText.js / ui-text-vi.txt
 */
import { LQ_UI } from './uiText.js';
import { LIENQUAN_QUIZ_DB_TITLE } from './quizDbSeed.js';

export const LIENQUAN_QUIZ = {
  quizId: null,
  dbTitle: LIENQUAN_QUIZ_DB_TITLE,
  ctaPath: '/lienquan/quiz',
  bannerTitle: LQ_UI.bannerTitle,
  bannerBody: LQ_UI.bannerBody,
  bannerCta: LQ_UI.bannerCta,
};

export function getLienquanQuizPath(quizId = LIENQUAN_QUIZ.quizId) {
  if (quizId) return `/quiz/${quizId}`;
  return LIENQUAN_QUIZ.ctaPath;
}
