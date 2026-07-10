import { Link } from 'react-router-dom';
import { LIENQUAN_QUIZ } from '../../../../shared/lienquan/quizMeta.js';
import { LQ_UI } from '../../../../shared/lienquan/uiText.js';

/** Compact quiz promo — links to tier grid on same page */
export default function QuizEventBanner() {
  return (
    <Link to="#quiz" className="lq-quiz-banner">
      <div className="lq-quiz-banner-text">
        <strong>{LIENQUAN_QUIZ.bannerTitle}</strong>
        <span>{LIENQUAN_QUIZ.bannerBody}</span>
      </div>
      <div className="lq-quiz-banner-side">
        <span className="lq-quiz-banner-cta">{LIENQUAN_QUIZ.bannerCta}</span>
        <span className="lq-quiz-banner-note">{LQ_UI.bannerExploreNote}</span>
      </div>
    </Link>
  );
}
