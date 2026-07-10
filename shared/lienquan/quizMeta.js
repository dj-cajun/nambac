/**
 * Liên Quân quiz CTA — update quizId when a dedicated quiz is published.
 * Until then, send users to Explore.
 */
export const LIENQUAN_QUIZ = {
  quizId: null,
  ctaPath: '/explore',
  bannerTitle: 'Bạn chơi Liên Quân giỏi?',
  bannerBody: 'Làm quiz độ hiểu biết trên nambac — đừng để mark Đồng!',
  bannerCta: 'Thi Thông Thạo ngay',
};

export function getLienquanQuizPath() {
  if (LIENQUAN_QUIZ.quizId) return `/quiz/${LIENQUAN_QUIZ.quizId}`;
  return LIENQUAN_QUIZ.ctaPath;
}
