import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import { scoreTierToMastery } from '../../../shared/lienquan/quizQuestions.js';
import {
  QUIZ_DIFFICULTIES,
  QUIZ_TIER_COUNT,
  getTierMeta,
  getTierQuestions,
  tierResultMessage,
} from '../../../shared/lienquan/quizPool.js';
import { LQ_UI } from '../../../shared/lienquan/uiText.js';
import { saveMastery } from '../../lib/lienquan/mastery.js';
import { markTodayDone } from '../../lib/todayDone.js';
import MasteryBadgeCard from './components/MasteryBadgeCard.jsx';
import ShareLinkButton from './components/ShareLinkButton.jsx';
import { buildLienquanOgImageUrl, buildLienquanShareUrl } from '../../lib/siteUrl';
import './lienquan.css';

function parseTierParam(raw) {
  const n = Number(raw);
  if (n >= 1 && n <= 5) return n;
  return null;
}

export default function LienquanQuizPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTier = parseTierParam(searchParams.get('tier'));

  const [tier, setTier] = useState(initialTier);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const [mastery, setMastery] = useState(null);
  const [picked, setPicked] = useState(null);

  const tierMeta = tier ? getTierMeta(tier) : null;
  const questions = useMemo(
    () => (tier ? getTierQuestions(tier) : []),
    [tier],
  );

  const q = questions[index];
  const inQuiz = tier && !done;
  const progress = questions.length
    ? Math.round(((index + (done ? 1 : 0)) / questions.length) * 100)
    : 0;

  const ogImage = buildLienquanOgImageUrl({
    title: 'Quiz Thông Thạo Liên Quân',
    subtitle: '5 cấp độ · 10 câu mỗi cấp · Mark Đồng → TT7',
  });
  const shareUrl = buildLienquanShareUrl({ page: 'quiz' });
  const metaDescription =
    '5 cấp độ thi Thông Thạo Liên Quân — 10 câu mỗi cấp, từ Đồng đến giáo án AOG trên nambac.';

  const startTier = (tierId) => {
    setTier(tierId);
    setIndex(0);
    setCorrect(0);
    setDone(false);
    setMastery(null);
    setPicked(null);
    setSearchParams({ tier: String(tierId) }, { replace: true });
  };

  const resetToPicker = () => {
    setTier(null);
    setIndex(0);
    setCorrect(0);
    setDone(false);
    setMastery(null);
    setPicked(null);
    setSearchParams({}, { replace: true });
  };

  const answer = async (opt) => {
    if (picked || done || !tier) return;
    setPicked(opt.id);
    const nextCorrect = correct + (opt.correct ? 1 : 0);
    window.setTimeout(async () => {
      if (index + 1 >= questions.length) {
        const level = scoreTierToMastery(tier, nextCorrect);
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

      {!tier && (
        <div className="lq-detail-card lq-quiz-tier-picker">
          <p className="lq-quiz-step">Chọn cấp độ</p>
          <h2 className="lq-quiz-q">5 cấp · 10 câu mỗi cấp</h2>
          <p className="lq-tip lq-quiz-tier-hint">{LQ_UI.quizTierHint}</p>
          <div className="lq-quiz-tier-grid">
            {QUIZ_DIFFICULTIES.map((d) => (
              <button
                key={d.id}
                type="button"
                className="lq-quiz-tier-card"
                onClick={() => startTier(d.id)}
              >
                <span className="lq-quiz-tier-emoji" aria-hidden="true">{d.emoji}</span>
                <span className="lq-quiz-tier-label">{d.label}</span>
                <span className="lq-quiz-tier-sub">{d.subtitle}</span>
                <span className="lq-quiz-tier-hint-line">{d.masteryHint}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {inQuiz && (
        <div className="lq-quiz-tier-bar">
          <span>{tierMeta?.emoji} {tierMeta?.label}</span>
          <button type="button" className="lq-quiz-tier-change" onClick={resetToPicker}>
            Đổi cấp
          </button>
        </div>
      )}

      {inQuiz && (
        <div className="lq-quiz-progress" aria-hidden="true">
          <div className="lq-quiz-progress-bar" style={{ width: `${progress}%` }} />
        </div>
      )}

      {inQuiz && q && (
        <div className="lq-detail-card">
          <p className="lq-quiz-step">
            Câu {index + 1}/{QUIZ_TIER_COUNT}
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

      {done && mastery && tierMeta && (
        <div className="lq-detail-card lq-quiz-result">
          <p className="lq-quiz-step">{tierMeta.label} · Kết quả</p>
          <h2 className="lq-quiz-q">
            {correct}/{QUIZ_TIER_COUNT} đúng
          </h2>
          <MasteryBadgeCard mastery={mastery} emptyCta={false} variant="stack" />
          <p className="lq-tip">{tierResultMessage(tier, correct)}</p>
          <div className="lq-nav-chips">
            <Link to="/lienquan" className="lq-chip">Về hub</Link>
            <Link to="/lienquan/khoe" className="lq-chip">Góc Khoe</Link>
            <ShareLinkButton page="quiz" className="lq-chip lq-chip-btn" />
            <button type="button" className="lq-chip" onClick={() => startTier(tier)}>
              Thi lại cấp này
            </button>
            <button type="button" className="lq-chip" onClick={resetToPicker}>
              Chọn cấp khác
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
