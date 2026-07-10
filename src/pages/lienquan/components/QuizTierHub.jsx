import { Link } from 'react-router-dom';
import { QUIZ_DIFFICULTIES } from '../../../../shared/lienquan/quizPool.js';
import { LQ_UI } from '../../../../shared/lienquan/uiText.js';

/** Game hub — Thi Thông Thạo label + 5 tiers in one row */
export default function QuizTierHub() {
  return (
    <section id="quiz" className="lq-hub-quiz-box" aria-label={LQ_UI.hubQuizTitle}>
      <div className="lq-hub-quiz-inner">
        <div className="lq-hub-quiz-desc">
          <span className="lq-hub-quiz-title">Thi Thông Thạo</span>
          <span className="lq-hub-quiz-sub">5 cấp · 10 câu</span>
        </div>
        <div className="lq-hub-quiz-tier-row">
          {QUIZ_DIFFICULTIES.map((d) => (
            <Link
              key={d.id}
              to={`/lienquan/quiz?tier=${d.id}`}
              className="lq-hub-tier-pill"
              title={`${d.label} · ${d.subtitle}`}
            >
              <span className="lq-hub-tier-emoji" aria-hidden="true">{d.emoji}</span>
              <span className="lq-hub-tier-label">{d.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
