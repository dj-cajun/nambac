import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { scrollToTop } from '../lib/scrollToTop';
import { getFortuneBrand } from '../../shared/fortuneMeta.js';
import './Home.css';
import './MiniApp.css';
import { fetchQuizzes, incrementQuizStat } from '../lib/quizApi';
import { trackQuizViewOnce } from '../lib/quizRanking';
import { pickDailyQuiz, pickDailyBalanceQuestion } from '../../shared/dailyPicks.js';
import QuizImage from '../components/QuizImage';
import { useHomeFeatureThumbs } from '../hooks/useHomeFeatureThumbs';
import { readTodayDone } from '../lib/todayDone';
import { buildShareUrl, getOgDefaultImageUrl } from '../lib/siteUrl';

function TodayThumbCard({
  className,
  done,
  onClick,
  to,
  imageSrc,
  imageSeed,
  label,
  hint,
  emoji,
}) {
  const content = (
    <>
      {done && <span className="home-today-done" aria-label="Đã chơi">✓</span>}
      {imageSrc ? (
        <div className="home-today-card-thumb">
          <QuizImage src={imageSrc} alt="" seed={imageSeed} />
        </div>
      ) : (
        <span className="home-today-emoji">{emoji}</span>
      )}
      <span className="home-today-text">
        <span className="home-today-label">{label}</span>
        {hint ? <span className="home-today-hint">{hint}</span> : null}
      </span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={className} onClick={onClick}>
      {content}
    </button>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doneToday, setDoneToday] = useState(() => readTodayDone());
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    scrollToTop();
  }, []);

  useEffect(() => {
    const refresh = () => setDoneToday(readTodayDone());
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);

  useEffect(() => {
    fetchQuizzes()
      .then(setQuizzes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const todayQuiz = useMemo(() => pickDailyQuiz(quizzes), [quizzes]);
  const todayBalance = useMemo(() => pickDailyBalanceQuestion(), []);
  const featureThumbs = useHomeFeatureThumbs();

  const handleQuizClick = async (quizId) => {
    if (trackQuizViewOnce(quizId)) {
      incrementQuizStat(quizId, 'view').catch(console.error);
    }
    navigate(`/quiz/${quizId}`);
  };

  if (loading) {
    return (
      <div className="home-container flex items-center justify-center">
        <div className="text-2xl font-black text-[#1E293B] animate-pulse">Đang tải... ⚡</div>
      </div>
    );
  }

  const homeUrl = buildShareUrl('/');
  const ogImage = getOgDefaultImageUrl();

  return (
    <div className="home-container">
      <Helmet>
        <title>nambac.xyz — Trắc nghiệm tính cách AI cho Gen Z Sài Gòn</title>
        <meta
          name="description"
          content="Chỉ 5 câu hỏi — AI phân tích tính cách kiểu Gen Z Sài Gòn. Nhanh, vui, share Zalo liền tay!"
        />
        <link rel="canonical" href={homeUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={homeUrl} />
        <meta property="og:title" content="nambac.xyz — Trắc nghiệm tính cách AI" />
        <meta
          property="og:description"
          content="Chỉ 5 câu hỏi — AI phân tích tính cách kiểu Gen Z Sài Gòn. Nhanh, vui, share Zalo liền tay!"
        />
        <meta property="og:image" content={ogImage} />
      </Helmet>

      <section className="home-today home-launcher" aria-label="Hôm nay">
        <p className="home-pitch">Quiz AI · 5 câu · khoe Zalo ngay</p>

        <div className="home-today-header-text">
          <h2 className="home-today-title">Hôm nay chơi gì?</h2>
          <p className="home-today-sub">~90 giây là xong — ở quán cf cũng được ☕</p>
        </div>

        <div className="home-today-body">
          {todayQuiz ? (
            <div className={`home-hero-quiz${doneToday.has('quiz') ? ' is-done' : ''}`}>
              {doneToday.has('quiz') && (
                <span className="home-today-done" aria-label="Đã chơi">✓</span>
              )}
              <div className="home-hero-quiz-thumb">
                <QuizImage src={todayQuiz.image_url} alt="" seed={todayQuiz.id} />
              </div>
              <p className="home-hero-quiz-title">{todayQuiz.title}</p>
              <button
                type="button"
                className="home-today-start-cta home-hero-quiz-cta"
                onClick={() => handleQuizClick(todayQuiz.id)}
              >
                ▶ Bắt đầu ngay
              </button>
            </div>
          ) : (
            <Link to="/explore" className="home-today-start-cta home-hero-quiz-cta home-hero-quiz-fallback">
              Khám phá quiz →
            </Link>
          )}

          <div className="home-today-grid home-today-grid--secondary">
            <TodayThumbCard
              className={`home-today-card home-today-fortune${doneToday.has('fortune') ? ' is-done' : ''}`}
              done={doneToday.has('fortune')}
              to="/fortune"
              imageSrc={featureThumbs.fortuneToday.src}
              imageSeed={featureThumbs.fortuneToday.seed}
              label="Tử vi"
              hint="Tên + ngày sinh"
              emoji={getFortuneBrand('general').emoji}
            />
            <TodayThumbCard
              className={`home-today-card home-today-balance${doneToday.has('balance') ? ' is-done' : ''}`}
              done={doneToday.has('balance')}
              to={`/balance/${todayBalance.id}`}
              imageSrc={featureThumbs.balance?.src}
              imageSeed={featureThumbs.balance?.seed || todayBalance.id}
              label="Cân não"
              hint="Chọn A hay B"
              emoji={todayBalance.emoji || '⚖️'}
            />
          </div>

          <div className="home-today-more">
            <button
              type="button"
              className="home-today-more-toggle"
              aria-expanded={moreOpen}
              onClick={() => setMoreOpen((open) => !open)}
            >
              <span>Thêm trò chơi</span>
              <span className="home-today-more-toggle-hint">{moreOpen ? 'Thu gọn' : 'Mở'}</span>
            </button>
            {moreOpen && (
              <div className="home-today-grid home-today-more-panel">
                <TodayThumbCard
                  className={`home-today-card home-today-roast${doneToday.has('roast') ? ' is-done' : ''}`}
                  done={doneToday.has('roast')}
                  to="/roast-card"
                  imageSrc={featureThumbs.roast.src}
                  imageSeed={featureThumbs.roast.seed}
                  label="Bóc phốt"
                  hint="Gõ tên bạn"
                  emoji="💳"
                />
                <TodayThumbCard
                  className={`home-today-card home-today-brain${doneToday.has('brain') ? ' is-done' : ''}`}
                  done={doneToday.has('brain')}
                  to="/brain"
                  imageSrc={featureThumbs.brain.src}
                  imageSeed={featureThumbs.brain.seed}
                  label="Não bạn"
                  hint="Gõ tên → meme"
                  emoji="🧠"
                />
                <TodayThumbCard
                  className={`home-today-card home-today-lienquan${doneToday.has('lienquan') ? ' is-done' : ''}`}
                  done={doneToday.has('lienquan')}
                  to="/lienquan#quiz"
                  imageSrc={featureThumbs.lienquan?.src}
                  imageSeed={featureThumbs.lienquan?.seed || 'lienquan'}
                  label="Liên Quân"
                  hint="Tướng khớp tên"
                  emoji="⚔️"
                />
                <TodayThumbCard
                  className={`home-today-card home-today-sbti${doneToday.has('sbti') ? ' is-done' : ''}`}
                  done={doneToday.has('sbti')}
                  to="/vbti"
                  imageSrc={featureThumbs.sbti?.src}
                  imageSeed={featureThumbs.sbti?.seed || 'sbti'}
                  label="VBTI"
                  hint="27 type + cung"
                  emoji="🎭"
                />
              </div>
            )}
          </div>

          <Link to="/explore" className="home-explore-link">
            Khám phá thêm quiz →
          </Link>
        </div>
      </section>
    </div>
  );
}
