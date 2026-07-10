/**
 * Liên Quân quiz CTA — copy from uiText.js / ui-text-vi.txt
 */
import { LQ_UI } from './uiText.js';

export const LIENQUAN_QUIZ = {
  quizId: null,
  ctaPath: '/lienquan/quiz',
  bannerTitle: LQ_UI.bannerTitle,
  bannerBody: LQ_UI.bannerBody,
  bannerCta: LQ_UI.bannerCta,
};

export function getLienquanQuizPath() {
  if (LIENQUAN_QUIZ.quizId) return `/quiz/${LIENQUAN_QUIZ.quizId}`;
  return LIENQUAN_QUIZ.ctaPath;
}
