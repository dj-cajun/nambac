import { Link } from 'react-router-dom';
import { QUIZ_DIFFICULTIES, QUIZ_TIER_COUNT } from '../../../../shared/lienquan/quizPool.js';
import { LQ_UI } from '../../../../shared/lienquan/uiText.js';

export default function QuizTierHub() {
  return (
    <section className="lq-hub-quiz-section" id="quiz" aria-labelledby="lq-hub-quiz-title">
      <div className="lq-hub-quiz-head">
        <h2 id="lq-hub-quiz-title" className="lq-section-title">{LQ_UI.hubQuizTitle}</h2>
        <p className="lq-hub-quiz-sub">{LQ_UI.hubQuizSub}</p>
      </div>

      <div className="lq-quiz-tier-grid lq-hub-quiz-grid">
        {QUIZ_DIFFICULTIES.map((d) => (
          <Link
            key={d.id}
            to={`/lienquan/quiz?tier=${d.id}`}
            className="lq-quiz-tier-card lq-hub-quiz-tier"
          >
            <span className="lq-quiz-tier-emoji" aria-hidden="true">{d.emoji}</span>
            <span className="lq-quiz-tier-label">{d.label}</span>
            <span className="lq-quiz-tier-sub">{d.subtitle}</span>
            <span className="lq-quiz-tier-hint-line">{d.masteryHint}</span>
            <span className="lq-hub-quiz-tier-cta">
              {QUIZ_TIER_COUNT} câu →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
