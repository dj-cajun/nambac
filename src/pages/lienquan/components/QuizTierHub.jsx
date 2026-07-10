import { Link } from 'react-router-dom';
import { QUIZ_DIFFICULTIES } from '../../../../shared/lienquan/quizPool.js';

/** Game hub — compact tier boxes only */
export default function QuizTierHub() {
  return (
    <section id="quiz" className="lq-hub-quiz-box" aria-label="Thi Thông Thạo · 5 cấp độ">
      <p className="lq-hub-quiz-box-kicker">5 cấp · 10 câu mỗi cấp</p>
      <div className="lq-hub-quiz-tier-row">
        {QUIZ_DIFFICULTIES.map((d) => (
          <Link
            key={d.id}
            to={`/lienquan/quiz?tier=${d.id}`}
            className="lq-hub-tier-pill"
          >
            <span className="lq-hub-tier-emoji" aria-hidden="true">{d.emoji}</span>
            <span className="lq-hub-tier-label">{d.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
