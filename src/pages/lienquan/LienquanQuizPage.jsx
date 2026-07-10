import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  LIENQUAN_QUIZ_QUESTIONS,
  scoreToMastery,
} from '../../../shared/lienquan/quizQuestions.js';
import { LQ_UI, quizResultMeme } from '../../../shared/lienquan/uiText.js';
import { saveMastery } from '../../lib/lienquan/mastery.js';
import { markTodayDone } from '../../lib/todayDone.js';
import MasteryBadgeCard from './components/MasteryBadgeCard.jsx';
import ShareLinkButton from './components/ShareLinkButton.jsx';
import { buildLienquanOgImageUrl, buildLienquanShareUrl } from '../../lib/siteUrl';
import './lienquan.css';

export default function LienquanQuizPage() {
  const questions = useMemo(() => LIENQUAN_QUIZ_QUESTIONS, []);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const [mastery, setMastery] = useState(null);
  const [picked, setPicked] = useState(null);

  const q = questions[index];
  const progress = Math.round(((index + (done ? 1 : 0)) / questions.length) * 100);
  const ogImage = buildLienquanOgImageUrl({
    title: 'Quiz Thông Thạo Liên Quân',
    subtitle: '10 câu · Mark Đồng → Thông Thạo 7',
  });
  const shareUrl = buildLienquanShareUrl({ page: 'quiz' });
  const metaDescription = '10 câu hỏi Liên Quân — lấy mark Thông Thạo 7 trên nambac.';

  const answer = async (opt) => {
    if (picked || done) return;
    setPicked(opt.id);
    const nextCorrect = correct + (opt.correct ? 1 : 0);
    window.setTimeout(async () => {
      if (index + 1 >= questions.length) {
        const level = scoreToMastery(nextCorrect);
        const saved = await saveMastery(level);
        markTodayDone('lienquan');
        setCorrect(nextCorrect);
        setMastery(saved);
        setDone(true);
        return;
      }
      setCorrect(nextCorrect);
      setIndex((i) => i + 1);
      setPicked(null);
    }, 420);
  };

  return (
    <div className="lienquan-page">
      <Helmet>
        <title>Quiz Thông Thạo Liên Quân | nambac</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href="https://www.nambac.xyz/lienquan/quiz" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Quiz Thông Thạo Liên Quân | nambac" />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content={shareUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>

      <Link to="/lienquan" className="lq-back">← Liên Quân</Link>

      <header className="lq-hero-block">
        <h1>Thi Thông Thạo</h1>
        <p>{LQ_UI.quizIntro}</p>
      </header>

      <div className="lq-quiz-progress" aria-hidden="true">
        <div className="lq-quiz-progress-bar" style={{ width: `${progress}%` }} />
      </div>

      {!done && q && (
        <div className="lq-detail-card">
          <p className="lq-quiz-step">
            Câu {index + 1}/{questions.length}
          </p>
          <h2 className="lq-quiz-q">{q.text}</h2>
          <div className="lq-quiz-options">
            {q.options.map((opt) => {
              let cls = 'lq-quiz-opt';
              if (picked === opt.id) cls += opt.correct ? ' ok' : ' bad';
              else if (picked && opt.correct) cls += ' ok';
              return (
                <button
                  key={opt.id}
                  type="button"
                  className={cls}
                  disabled={Boolean(picked)}
                  onClick={() => answer(opt)}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {done && mastery && (
        <div className="lq-detail-card lq-quiz-result">
          <p className="lq-quiz-step">Kết quả</p>
          <h2 className="lq-quiz-q">
            {correct}/{questions.length} đúng
          </h2>
          <MasteryBadgeCard mastery={mastery} emptyCta={false} variant="stack" />
          <p className="lq-tip">{quizResultMeme(mastery.level)}</p>
          <div className="lq-nav-chips">
            <Link to="/lienquan" className="lq-chip">Về hub</Link>
            <Link to="/lienquan/khoe" className="lq-chip">Góc Khoe</Link>
            <ShareLinkButton page="quiz" className="lq-chip lq-chip-btn" />
            <button
              type="button"
              className="lq-chip"
              onClick={() => {
                setIndex(0);
                setCorrect(0);
                setDone(false);
                setMastery(null);
                setPicked(null);
              }}
            >
              Thi lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
