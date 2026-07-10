import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LIENQUAN_QUIZ } from '../../../../shared/lienquan/quizMeta.js';
import { LQ_UI } from '../../../../shared/lienquan/uiText.js';
import { fetchLienquanQuizMeta } from '../../../lib/lienquan/quizMetaApi.js';

export default function QuizEventBanner() {
  const [ctaPath, setCtaPath] = useState(LIENQUAN_QUIZ.ctaPath);

  useEffect(() => {
    fetchLienquanQuizMeta().then((meta) => {
      if (meta?.ctaPath) setCtaPath(meta.ctaPath);
    });
  }, []);

  return (
    <Link to={ctaPath} className="lq-quiz-banner">
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
