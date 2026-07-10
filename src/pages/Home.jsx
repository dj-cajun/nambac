import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { X } from 'lucide-react';
import { scrollToTop } from '../lib/scrollToTop';
import { fetchFortuneStats } from '../lib/fortuneApi';
import { fetchAllFeatureStats } from '../lib/featureStats';
import { FORTUNE_BRAND } from '../../shared/fortuneMeta.js';
import './Home.css';
import './MiniApp.css';
import { fetchQuizzes, incrementQuizStat } from '../lib/quizApi';
import { getViralScore, trackQuizViewOnce } from '../lib/quizRanking';
import { buildFeatureFeedItems, buildHomeFeed, pickHeroSlides } from '../lib/homeFeed';
import { pickDailyQuiz, pickDailyBalanceQuestion } from '../../shared/dailyPicks.js';
import { incrementFeatureStat, trackFeatureViewOnce } from '../lib/featureStats';
import AdSenseUnit from '../components/AdSenseUnit';
import QuizImage from '../components/QuizImage';
import QuizCardThumb from '../components/QuizCardThumb';
import QuizCardTitle from '../components/QuizCardTitle';
import QuizCardStats from '../components/QuizCardStats';
import { useHomeFeatureThumbs } from '../hooks/useHomeFeatureThumbs';
import { AD_SLOTS } from '../lib/adsConfig';
import { readTodayDone } from '../lib/todayDone';
import { buildShareUrl, getOgDefaultImageUrl } from '../lib/siteUrl';

const SORT_OPTIONS = [
  { id: 'trending', emoji: '🔥', label: 'Hot', sortFn: (a, b) => (b.view_count || 0) - (a.view_count || 0) },
  { id: 'viral', emoji: '📤', label: 'Viral', sortFn: (a, b) => getViralScore(b) - getViralScore(a) },
  { id: 'new', emoji: '✨', label: 'Mới', sortFn: (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0) },
];

const SECTION_TITLES = {
  trending: '🔥 Top Thịnh Hành',
  viral: '📤 Viral tuần này',
  new: '✨ Mới hôm nay',
};

const HOME_INTRO_FAQ = [
  {
    q: 'nambac.xyz là gì?',
    a: 'Nền tảng trắc nghiệm tính cách AI — 5 câu hỏi, nhanh, vui, dành cho Gen Z Sài Gòn.',
  },
  {
    q: 'Kết quả có chính xác không?',
    a: 'Mục đích giải trí và khám phá bản thân. Không thay thế kiểm tra tâm lý chuyên nghiệp.',
  },
  {
    q: 'Có cần đăng ký không?',
    a: 'Không. Làm quiz và xem kết quả ngay, không cần tài khoản.',
  },
  {
    q: 'Thông tin cá nhân có được bảo mật không?',
    a: 'Không thu thập tên, email hay SĐT. Chỉ dùng cookie cơ bản để cải thiện trải nghiệm.',
  },
  {
    q: 'Có miễn phí không?',
    a: '100% miễn phí. Chúng tôi duy trì qua quảng cáo, không ảnh hưởng trải nghiệm chính.',
  },
  {
    q: 'Làm thế nào để chia sẻ kết quả?',
    a: 'Sau khi hoàn thành, dùng nút chia sẻ ở trang kết quả — Zalo, Facebook hoặc sao chép link.',
  },
];

const INTRO_BUTTONS = [
  { id: 'about', label: 'Giới thiệu' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contact', label: 'Liên hệ' },
  { id: 'privacy', label: 'Bảo mật' },
  { id: 'cookie', label: 'Cookie' },
  { id: 'terms', label: 'Điều khoản' },
];

const INTRO_MODAL_META = {
  about: { title: 'Giới thiệu', more: '/about', moreLabel: 'Xem thêm giới thiệu →' },
  faq: { title: 'Câu hỏi thường gặp', more: '/faq', moreLabel: 'Xem tất cả FAQ →' },
  contact: { title: 'Liên hệ', more: '/contact', moreLabel: 'Trang liên hệ đầy đủ →' },
  privacy: { title: 'Bảo mật', more: '/privacy-policy', moreLabel: 'Chính sách bảo mật →' },
  cookie: { title: 'Cookie & quảng cáo', more: '/cookie-policy', moreLabel: 'Chính sách Cookie →' },
  terms: { title: 'Điều khoản', more: '/terms-of-service', moreLabel: 'Xem điều khoản đầy đủ →' },
  brands: { title: 'Hợp tác thương hiệu', more: '/brands', moreLabel: 'Đăng ký tư vấn →' },
};

function IntroModalBody({ sectionId }) {
  if (sectionId === 'about') {
    return (
      <>
        <p className="home-intro-lead">
          nambac.xyz — trắc nghiệm tính cách AI cho Gen Z Sài Gòn.
        </p>
        <ul className="home-intro-list">
          <li>Chỉ 5 câu hỏi — hoàn thành trong 1–2 phút</li>
          <li>AI phân tích kết quả &amp; tạo hình minh hoạ riêng</li>
          <li>MBTI, tình yêu, ẩm thực, nghề nghiệp và nhiều chủ đề khác</li>
          <li>Chia sẻ kết quả qua Zalo, Facebook dễ dàng</li>
        </ul>
      </>
    );
  }

  if (sectionId === 'faq') {
    return (
      <div className="home-intro-faq-list">
        {HOME_INTRO_FAQ.map((item) => (
          <article key={item.q} className="home-intro-faq-item">
            <h4 className="home-intro-faq-q">{item.q}</h4>
            <p className="home-intro-faq-a">{item.a}</p>
          </article>
        ))}
      </div>
    );
  }

  if (sectionId === 'privacy') {
    return (
      <ul className="home-intro-list">
        <li>Không yêu cầu đăng ký — không thu thập tên, email, SĐT</li>
        <li>Chỉ thu thập dữ liệu kỹ thuật ẩn danh (IP, trình duyệt, trang truy cập)</li>
        <li>Cookie cơ bản + phân tích (Google Analytics, Vercel Analytics)</li>
        <li>Quảng cáo qua Google AdSense — có thể tắt cá nhân hoá trong cài đặt Google</li>
        <li>Thông báo push (tuỳ chọn) — chỉ khi bạn bấm &quot;Bật&quot;</li>
        <li>Kết quả quiz dùng để chia sẻ — không bán cho bên thứ ba</li>
      </ul>
    );
  }

  if (sectionId === 'contact') {
    return (
      <>
        <p className="home-intro-lead">
          Góp ý, báo lỗi hoặc hợp tác — chúng tôi phản hồi trong 24–48 giờ.
        </p>
        <ul className="home-intro-list">
          <li>📧 <strong>contact@nambac.xyz</strong></li>
          <li>Báo lỗi quiz / hình ảnh / kết quả</li>
          <li>Đề xuất chủ đề trắc nghiệm mới</li>
          <li>Hợp tác thương hiệu → mục &quot;Hợp tác thương hiệu&quot; bên dưới</li>
        </ul>
      </>
    );
  }

  if (sectionId === 'cookie') {
    return (
      <ul className="home-intro-list">
        <li>Cookie cần thiết: phiên, tùy chọn UI, đóng banner</li>
        <li>Phân tích: Google Analytics, Vercel Analytics (ẩn danh)</li>
        <li>Quảng cáo: Google AdSense / DoubleClick (khi bật)</li>
        <li>Tắt quảng cáo cá nhân hoá: google.com/settings/ads</li>
        <li>Xóa cookie bất cứ lúc nào trong cài đặt trình duyệt</li>
      </ul>
    );
  }

  if (sectionId === 'terms') {
    return (
      <>
        <p className="home-intro-lead">
          Sử dụng nambac.xyz đồng nghĩa bạn chấp nhận các điều khoản dưới đây.
        </p>
        <ul className="home-intro-list">
          <li>Dịch vụ trắc nghiệm miễn phí, mục đích giải trí</li>
          <li>Không cần đăng ký tài khoản để sử dụng</li>
          <li>Kết quả AI mang tính tham khảo — không phải tư vấn y khoa hay pháp lý</li>
          <li>Nội dung, hình ảnh thuộc nambac.xyz — không sao chép thương mại</li>
          <li>Chúng tôi có thể cập nhật điều khoản; tiếp tục dùng = đồng ý</li>
        </ul>
      </>
    );
  }

  if (sectionId === 'brands') {
    return (
      <>
        <p className="home-intro-lead">
          Tạo chiến dịch quiz AI viral — tiếp cận Gen Z Sài Gòn qua nambac.xyz.
        </p>
        <ul className="home-intro-list">
          <li>Quiz thương hiệu tuỳ chỉnh — AI tạo câu hỏi &amp; hình minh hoạ</li>
          <li>100K+ lượt chơi tự nhiên, lan truyền Zalo &amp; Facebook</li>
          <li>Báo cáo hiệu quả chiến dịch realtime</li>
          <li>Gói ngân sách linh hoạt — tư vấn miễn phí</li>
        </ul>
      </>
    );
  }

  return null;
}

function TodayThumbCard({
  className,
  done,
  onClick,
  to,
  imageSrc,
  imageSeed,
  label,
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
      <span className="home-today-label">{label}</span>
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
  const [sortMode, setSortMode] = useState('trending');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [introModal, setIntroModal] = useState(null);
  const [fortuneStats, setFortuneStats] = useState({ view_count: 0, share_count: 0, like_count: 0 });
  const [featureStats, setFeatureStats] = useState({
    balance: { view_count: 0, share_count: 0, like_count: 0 },
    roast: { view_count: 0, share_count: 0, like_count: 0 },
    brain: { view_count: 0, share_count: 0, like_count: 0 },
  });
  const [doneToday, setDoneToday] = useState(() => readTodayDone());
  const carouselRef = useRef(null);
  const introPanelRef = useRef(null);
  const introBodyRef = useRef(null);

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
    fetchFortuneStats().then(setFortuneStats).catch(console.error);
    fetchAllFeatureStats().then(setFeatureStats).catch(console.error);
  }, []);

  useEffect(() => {
    fetchQuizzes()
      .then(setQuizzes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!introModal) return;
    if (introBodyRef.current) introBodyRef.current.scrollTop = 0;
    requestAnimationFrame(() => {
      introPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [introModal]);

  const openIntroSection = (sectionId) => {
    setIntroModal((prev) => (prev === sectionId ? null : sectionId));
  };

  const closeIntroSection = () => setIntroModal(null);

  const todayQuiz = useMemo(() => pickDailyQuiz(quizzes), [quizzes]);
  const todayBalance = useMemo(() => pickDailyBalanceQuestion(), []);
  const featureThumbs = useHomeFeatureThumbs();

  const featureFeedItems = useMemo(
    () => buildFeatureFeedItems({ fortuneStats, featureStats, featureThumbs }),
    [fortuneStats, featureStats, featureThumbs],
  );

  const feedItems = useMemo(
    () => buildHomeFeed(quizzes, featureFeedItems, sortMode),
    [quizzes, featureFeedItems, sortMode],
  );

  const heroSlides = useMemo(
    () => pickHeroSlides(quizzes, featureFeedItems, 6),
    [quizzes, featureFeedItems],
  );

  const getCarouselStep = () => {
    const el = carouselRef.current;
    if (!el) return 0;
    const slide = el.querySelector('.hero-slide');
    return slide ? slide.offsetWidth : el.offsetWidth;
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    if (carouselRef.current) {
      carouselRef.current.scrollTo({
        left: index * getCarouselStep(),
        behavior: 'smooth',
      });
    }
  };

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  useEffect(() => {
    if (isDragging || heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const nextSlide = (prev + 1) % heroSlides.length;
        if (carouselRef.current) {
          carouselRef.current.scrollTo({
            left: nextSlide * getCarouselStep(),
            behavior: 'smooth',
          });
        }
        return nextSlide;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length, isDragging]);

  useEffect(() => {
    setCurrentSlide(0);
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ left: 0, behavior: 'auto' });
    }
  }, [heroSlides.length]);

  const handleScroll = () => {
    if (carouselRef.current && !isDragging) {
      const scrollLeft = carouselRef.current.scrollLeft;
      const step = getCarouselStep();
      if (!step) return;
      const newIndex = Math.round(scrollLeft / step);
      if (newIndex >= 0 && newIndex < heroSlides.length && newIndex !== currentSlide) {
        setCurrentSlide(newIndex);
      }
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeftState(carouselRef.current.scrollLeft);
    if (carouselRef.current) {
      carouselRef.current.style.scrollSnapType = 'none';
      carouselRef.current.style.cursor = 'grabbing';
    }
  };

  const handleMouseLeave = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (carouselRef.current) {
      carouselRef.current.style.scrollSnapType = 'x mandatory';
      carouselRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (carouselRef.current) {
      carouselRef.current.style.scrollSnapType = 'x mandatory';
      carouselRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    carouselRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleQuizClick = async (quizId) => {
    if (trackQuizViewOnce(quizId)) {
      incrementQuizStat(quizId, 'view').catch(console.error);
    }
    navigate(`/quiz/${quizId}`);
  };

  const handleFeedItemClick = (item) => {
    if (item.kind === 'quiz') {
      handleQuizClick(item.quizId);
      return;
    }
    if (item.kind === 'roast' || item.kind === 'brain' || item.kind === 'lienquan' || item.kind === 'sbti') {
      if (trackFeatureViewOnce(item.kind)) {
        incrementFeatureStat(item.kind, 'view').catch(console.error);
      }
    }
    navigate(item.to);
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
      <section className="home-today" aria-label="Hôm nay">
        <div className="home-today-header-text">
          <h2 className="home-today-title">Hôm nay · Chơi 90 giây ☕</h2>
          <p className="home-today-sub">Ở quán cf? Làm nhanh rồi khoe Zalo nhé</p>
        </div>

        <div className="home-today-body">
          <div className="home-today-grid">
            {todayQuiz && (
              <TodayThumbCard
                className={`home-today-card home-today-quiz${doneToday.has('quiz') ? ' is-done' : ''}`}
                done={doneToday.has('quiz')}
                onClick={() => handleQuizClick(todayQuiz.id)}
                imageSrc={todayQuiz.image_url}
                imageSeed={todayQuiz.id}
                label="Quiz"
                emoji="🎯"
              />
            )}
            <TodayThumbCard
              className={`home-today-card home-today-fortune${doneToday.has('fortune') ? ' is-done' : ''}`}
              done={doneToday.has('fortune')}
              to="/fortune"
              imageSrc={featureThumbs.fortuneToday.src}
              imageSeed={featureThumbs.fortuneToday.seed}
              label="Tử vi"
              emoji={FORTUNE_BRAND.emoji}
            />
            <TodayThumbCard
              className={`home-today-card home-today-balance${doneToday.has('balance') ? ' is-done' : ''}`}
              done={doneToday.has('balance')}
              to={`/balance/${todayBalance.id}`}
              imageSrc={featureThumbs.balance?.src}
              imageSeed={featureThumbs.balance?.seed || todayBalance.id}
              label="Balance Quiz"
              emoji={todayBalance.emoji || '⚖️'}
            />
            <TodayThumbCard
              className={`home-today-card home-today-roast${doneToday.has('roast') ? ' is-done' : ''}`}
              done={doneToday.has('roast')}
              to="/roast-card"
              imageSrc={featureThumbs.roast.src}
              imageSeed={featureThumbs.roast.seed}
              label="Bóc phốt"
              emoji="💳"
            />
            <TodayThumbCard
              className={`home-today-card home-today-lienquan${doneToday.has('lienquan') ? ' is-done' : ''}`}
              done={doneToday.has('lienquan')}
              to="/lienquan#quiz"
              imageSrc={featureThumbs.lienquan?.src}
              imageSeed={featureThumbs.lienquan?.seed || 'lienquan'}
              label="Liên Quân"
              emoji="⚔️"
            />
            <TodayThumbCard
              className={`home-today-card home-today-sbti${doneToday.has('sbti') ? ' is-done' : ''}`}
              done={doneToday.has('sbti')}
              to="/vbti"
              imageSrc={featureThumbs.sbti?.src}
              imageSeed={featureThumbs.sbti?.seed || 'sbti'}
              label="VBTI"
              emoji="🎭"
            />
          </div>

          <div className="home-today-cta-row">
            {todayQuiz && (
              <button
                type="button"
                className="home-today-start-cta"
                onClick={() => handleQuizClick(todayQuiz.id)}
              >
                ▶ Bắt đầu quiz hôm nay
              </button>
            )}
            <Link
              to="/vbti"
              className={`home-today-vbti-cta${todayQuiz ? '' : ' is-solo'}`}
            >
              {featureThumbs.sbti?.src ? (
                <span className="home-today-vbti-thumb" aria-hidden>
                  <QuizImage src={featureThumbs.sbti.src} alt="" seed={featureThumbs.sbti.seed || 'sbti'} />
                </span>
              ) : (
                <span className="home-today-vbti-emoji" aria-hidden>🎭</span>
              )}
              VBTI
            </Link>
          </div>

          <Link to="/brain" className="home-today-more-link">
            Não bạn 🧠 · thêm trò chơi →
          </Link>
        </div>
      </section>

      <AdSenseUnit adSlot={AD_SLOTS.home} location="home-middle" />

      {heroSlides.length > 0 && (
        <section className="home-hot-section" aria-label="Đang hot">
          <h3 className="home-hot-title">🔥 Đang hot</h3>
          <div className="hero-carousel-outer">
            <div className="hero-carousel-wrapper">
              <div
                className="hero-carousel"
                ref={carouselRef}
                onScroll={handleScroll}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
              >
                {heroSlides.map((item) => (
                  <div
                    key={`${item.kind}-${item.id}`}
                    className="hero-slide"
                    onClick={() => handleFeedItemClick(item)}
                  >
                    <div className="hero-image-bg">
                      <QuizImage src={item.image_url} alt={item.title} seed={item.imageSeed} />
                    </div>
                    <div className="hero-overlay-gradient" />
                    <div className="hero-content">
                      <span className="trending-badge">{item.typeLabel}</span>
                      <h2 className="hero-title">{item.title}</h2>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="carousel-dots">
              {heroSlides.map((item, index) => (
                <button
                  key={`${item.kind}-${item.id}-dot`}
                  type="button"
                  className={`dot ${currentSlide === index ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="home-feed-section" aria-label="Khám phá quiz">
        <div className="home-sort-bar">
          <div className="sort-tabs" role="tablist" aria-label="Sắp xếp quiz">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                role="tab"
                aria-selected={sortMode === opt.id}
                className={`sort-tab ${sortMode === opt.id ? 'active' : ''}`}
                onClick={() => setSortMode(opt.id)}
              >
                <span className="sort-tab-emoji" aria-hidden="true">{opt.emoji}</span>
                <span className="sort-tab-label">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <h3 className="glass-section-title">{SECTION_TITLES[sortMode]}</h3>
        <div className="glass-list grid-cols-2">
          {feedItems.length === 0 ? (
            <div className="text-center p-8 text-gray-500 font-bold col-span-2">Chưa có quiz nào hết trơn á! 🕸️</div>
          ) : (
            feedItems.map((item) => (
              <div
                key={`${item.kind}-${item.id}`}
                className="glass-card square-card"
                onClick={() => handleFeedItemClick(item)}
              >
                <QuizCardThumb
                  src={item.image_url}
                  seed={item.imageSeed}
                  alt={item.title}
                  typeLabel={item.typeLabel}
                />
                <div className="glass-card-info-bottom">
                  <QuizCardTitle title={item.title} />
                  <QuizCardStats quiz={item} />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="home-brand-cta" aria-label="Hợp tác thương hiệu">
        <p className="home-brand-cta-kicker">Dành cho nhãn hàng</p>
        <h3>Chạy quiz branded để kéo Gen Z thật</h3>
        <p>
          Team nambac hỗ trợ từ concept, nội dung, hình ảnh đến báo cáo realtime.
          Phù hợp cho launch sản phẩm, social campaign, seeding cộng đồng.
        </p>
        <div className="home-brand-cta-actions">
          <Link to="/brands" className="home-brand-cta-btn primary">Nhận tư vấn miễn phí</Link>
          <Link to="/brands" className="home-brand-cta-btn">Xem gói hợp tác</Link>
        </div>
      </section>

      <div className="home-intro-box">
        <h3 className="home-intro-box-title">nambac.xyz</h3>
        <p className="home-intro-box-desc">Trắc nghiệm AI · 5 câu · share Zalo liền</p>
        <div className="home-intro-btns" role="group" aria-label="Thông tin nambac">
          {INTRO_BUTTONS.map((btn) => (
            <button
              key={btn.id}
              type="button"
              className={`home-intro-btn${introModal === btn.id ? ' active' : ''}`}
              aria-expanded={introModal === btn.id}
              onClick={() => openIntroSection(btn.id)}
            >
              {btn.label}
            </button>
          ))}
        </div>
        <Link to="/blog" className="home-intro-btn home-intro-btn-wide home-intro-btn-link">
          Insights 📰
        </Link>
        {introModal && (
          <div
            ref={introPanelRef}
            className="home-intro-panel"
            role="region"
            aria-label={INTRO_MODAL_META[introModal].title}
          >
            <div className="home-intro-panel-header">
              <h4 className="home-intro-panel-title">{INTRO_MODAL_META[introModal].title}</h4>
              <button
                type="button"
                className="home-intro-panel-close"
                onClick={closeIntroSection}
                aria-label="Đóng"
              >
                <X size={18} strokeWidth={2.25} />
              </button>
            </div>
            <div ref={introBodyRef} className="home-intro-panel-body">
              <IntroModalBody sectionId={introModal} />
              <Link to={INTRO_MODAL_META[introModal].more} className="home-intro-more">
                {INTRO_MODAL_META[introModal].moreLabel}
              </Link>
            </div>
          </div>
        )}
      </div>

      <footer className="home-footer">
        <p className="home-footer-copy">
          © 2026 nambac.xyz — Made for Vietnamese Gen Z with love and pixels.
        </p>
      </footer>
    </div>
  );
}
