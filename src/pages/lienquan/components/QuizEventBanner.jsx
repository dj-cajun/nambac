import { Link } from 'react-router-dom';
import { LIENQUAN_QUIZ, getLienquanQuizPath } from '../../../../shared/lienquan/quizMeta.js';

export default function QuizEventBanner() {
  return (
    <Link to={getLienquanQuizPath()} className="lq-quiz-banner">
      <div className="lq-quiz-banner-text">
        <strong>{LIENQUAN_QUIZ.bannerTitle}</strong>
        <span>{LIENQUAN_QUIZ.bannerBody}</span>
      </div>
      <span className="lq-quiz-banner-cta">{LIENQUAN_QUIZ.bannerCta}</span>
    </Link>
  );
}
