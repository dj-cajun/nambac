/**
 * Liên Quân quiz CTA — dedicated in-app quiz at /lienquan/quiz
 */
export const LIENQUAN_QUIZ = {
  quizId: null,
  ctaPath: '/lienquan/quiz',
  bannerTitle: 'Bạn chơi Liên Quân giỏi?',
  bannerBody: 'Làm quiz 10 câu — lấy mark Thông Thạo 7 trên nambac!',
  bannerCta: 'Thi Thông Thạo ngay',
};

export function getLienquanQuizPath() {
  if (LIENQUAN_QUIZ.quizId) return `/quiz/${LIENQUAN_QUIZ.quizId}`;
  return LIENQUAN_QUIZ.ctaPath;
}
