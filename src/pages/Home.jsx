import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
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
      <Link to={to} className={className} onClick={onClick}>
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
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doneToday, setDoneToday] = useState(() => readTodayDone());

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
        <title>nambac.xyz — Game &amp; VBTI cho Gen Z Sài Gòn</title>
        <meta
          name="description"
          content="VBTI, Liên Quân, quiz AI — chơi nhanh rồi khoe Zalo. Gen Z Sài Gòn chill 90 giây!"
        />
        <link rel="canonical" href={homeUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={homeUrl} />
        <meta property="og:title" content="nambac.xyz — Game &amp; VBTI Gen Z" />
        <meta
          property="og:description"
          content="VBTI, Liên Quân, quiz AI — chơi nhanh rồi khoe Zalo. Gen Z Sài Gòn chill 90 giây!"
        />
        <meta property="og:image" content={ogImage} />
      </Helmet>

      <section className="home-today home-launcher" aria-label="Hôm nay">
        <p className="home-pitch">VBTI · Game · khoe Zalo ngay</p>

        <div className="home-today-header-text">
          <h2 className="home-today-title">Xin chào, hôm nay tụi mình chơi gì? ⚡</h2>
          <p className="home-today-sub">~90 giây là xong — ở quán cf cũng được ☕</p>
        </div>

        <div className="home-today-body">
          <div className={`home-hero-primary home-hero-vbti${doneToday.has('sbti') ? ' is-done' : ''}`}>
            {doneToday.has('sbti') && (
              <span className="home-today-done" aria-label="Đã chơi">✓</span>
            )}
            <div className="home-hero-primary-thumb">
              {featureThumbs.sbti?.src ? (
                <QuizImage src={featureThumbs.sbti.src} alt="" seed={featureThumbs.sbti.seed || 'sbti'} />
              ) : (
                <span className="home-hero-primary-emoji" aria-hidden>🎭</span>
              )}
            </div>
            <p className="home-hero-primary-title">VBTI — 27 type + cung hoàng đạo</p>
            <p className="home-hero-primary-hint">Biết bạn thuộc type nào · share Zalo liền</p>
            <Link to="/vbti" className="home-today-start-cta home-hero-primary-cta">
              ▶ Làm VBTI ngay
            </Link>
          </div>

          <div className="home-today-subsection">
            <p className="home-today-subsection-label">AI &amp; Tương tác 🤝</p>
            <div className="home-today-grid home-today-grid--games" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              <Link to="/instant-quiz" className="home-today-card" style={{ background: '#f5f3ff', border: '2px solid #7c3aed', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px', borderRadius: '12px', textDecoration: 'none', color: '#1e293b' }}>
                <span style={{ fontSize: '1.8rem', marginBottom: '4px' }}>🪄</span>
                <span style={{ fontWeight: '800', fontSize: '13px' }}>Tự tạo Quiz AI</span>
                <span style={{ fontSize: '11px', color: '#6d28d9', fontWeight: '600' }}>Nhập chủ đề tùy ý</span>
              </Link>
              <Link to="/compatibility" className="home-today-card" style={{ background: '#ecfdf5', border: '2px solid #059669', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px', borderRadius: '12px', textDecoration: 'none', color: '#1e293b' }}>
                <span style={{ fontSize: '1.8rem', marginBottom: '4px' }}>❤️</span>
                <span style={{ fontWeight: '800', fontSize: '13px' }}>AI So Khớp</span>
                <span style={{ fontSize: '11px', color: '#047857', fontWeight: '600' }}>Đo độ hợp cạ</span>
              </Link>
              <Link to="/personality" className="home-today-card" style={{ background: '#fff7ed', border: '2px solid #ea580c', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px', borderRadius: '12px', textDecoration: 'none', color: '#1e293b', gridColumn: '1 / -1' }}>
                <span style={{ fontSize: '1.8rem', marginBottom: '4px' }}>🆔</span>
                <span style={{ fontWeight: '800', fontSize: '13px' }}>Thẻ Cá Nhân AI</span>
                <span style={{ fontSize: '11px', color: '#c2410c', fontWeight: '600' }}>VBTI + nhân vật khớp vibe</span>
              </Link>
            </div>
          </div>

          <div className="home-today-subsection">
            <p className="home-today-subsection-label">Mini Apps Vui Nhộn 🎮</p>
            <div className="home-today-grid home-today-grid--games">
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
          </div>

          <div className="home-today-subsection">
            <p className="home-today-subsection-label">Quiz &amp; Tử vi 🔮</p>
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
              {todayQuiz ? (
                <TodayThumbCard
                  className={`home-today-card home-today-quiz${doneToday.has('quiz') ? ' is-done' : ''}`}
                  done={doneToday.has('quiz')}
                  to={`/quiz/${todayQuiz.id}`}
                  onClick={() => {
                    if (trackQuizViewOnce(todayQuiz.id)) {
                      incrementQuizStat(todayQuiz.id, 'view').catch(console.error);
                    }
                  }}
                  imageSrc={todayQuiz.image_url}
                  imageSeed={todayQuiz.id}
                  label="Quiz hôm nay"
                  hint="5 câu AI"
                  emoji="🎯"
                />
              ) : (
                <TodayThumbCard
                  className="home-today-card home-today-quiz"
                  to="/explore"
                  label="Quiz"
                  hint="Khám phá thêm"
                  emoji="🎯"
                />
              )}
            </div>
          </div>

          <Link to="/explore" className="home-explore-link">
            Khám phá thêm →
          </Link>
        </div>
      </section>
    </div>
  );
}
