import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Send, X, Heart } from 'lucide-react';
import { scrollToTop } from '../lib/scrollToTop';
import { fetchFortuneStats } from '../lib/fortuneApi';
import { FORTUNE_BRAND } from '../../shared/fortuneMeta.js';
import './Home.css';
import './MiniApp.css';
import { QUIZ_CATEGORIES, HOME_SPECIAL_TABS, matchesCategory } from '../constants/categories';
import { fetchQuizzes, incrementQuizStat } from '../lib/quizApi';
import { getViralScore, sortByViralScore, trackQuizViewOnce } from '../lib/quizRanking';
import AdSenseUnit from '../components/AdSenseUnit';
import QuizImage from '../components/QuizImage';
import QuizCardStats from '../components/QuizCardStats';
import { AD_SLOTS } from '../lib/adsConfig';

const SORT_OPTIONS = [
  { id: 'trending', label: '🔥 Hot', sortFn: (a, b) => (b.view_count || 0) - (a.view_count || 0) },
  { id: 'viral', label: '📤 Viral', sortFn: (a, b) => getViralScore(b) - getViralScore(a) },
  { id: 'new', label: '✨ Mới', sortFn: (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0) },
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

export default function Home() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [sortMode, setSortMode] = useState('trending');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [introModal, setIntroModal] = useState(null);
  const [fortuneStats, setFortuneStats] = useState({ view_count: 0, share_count: 0, like_count: 0 });
  const carouselRef = useRef(null);
  const introPanelRef = useRef(null);
  const introBodyRef = useRef(null);

  const categories = [
    ...HOME_SPECIAL_TABS,
    ...QUIZ_CATEGORIES.map(c => ({ id: c.id, label: c.label, color: c.color })),
  ];

  useEffect(() => {
    scrollToTop();
  }, []);

  useEffect(() => {
    fetchFortuneStats().then(setFortuneStats).catch(console.error);
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

  const sortFn = SORT_OPTIONS.find((s) => s.id === sortMode)?.sortFn || SORT_OPTIONS[0].sortFn;

  const sortedQuizzes = useMemo(
    () => [...quizzes].sort(sortFn),
    [quizzes, sortFn],
  );

  const filteredQuizzes = useMemo(() => {
    if (activeTab === 'all') return sortedQuizzes;
    return sortedQuizzes.filter((q) => matchesCategory(q.category, activeTab));
  }, [sortedQuizzes, activeTab]);

  const heroQuizzes = useMemo(
    () => sortByViralScore(quizzes).slice(0, 3),
    [quizzes],
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
    if (isDragging || heroQuizzes.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const nextSlide = (prev + 1) % heroQuizzes.length;
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
  }, [heroQuizzes.length, isDragging]);

  const handleScroll = () => {
    if (carouselRef.current && !isDragging) {
      const scrollLeft = carouselRef.current.scrollLeft;
      const step = getCarouselStep();
      if (!step) return;
      const newIndex = Math.round(scrollLeft / step);
      if (newIndex >= 0 && newIndex < heroQuizzes.length && newIndex !== currentSlide) {
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

  if (loading) {
    return (
      <div className="home-container flex items-center justify-center">
        <div className="text-2xl font-black text-[#1E293B] animate-pulse">Đang tải... ⚡</div>
      </div>
    );
  }

  return (
    <div className="home-container">
      {heroQuizzes.length > 0 && (
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
              {heroQuizzes.map((quiz) => (
                <div key={quiz.id} className="hero-slide" onClick={() => handleQuizClick(quiz.id)}>
                  <div className="hero-image-bg">
                    <QuizImage src={quiz.image_url} alt={quiz.title} seed={quiz.id} />
                  </div>
                  <div className="hero-overlay-gradient" />
                  <div className="hero-content">
                    <h2 className="hero-title">{quiz.title}</h2>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="carousel-dots">
            {heroQuizzes.map((_, index) => (
              <button
                key={index}
                className={`dot ${currentSlide === index ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      <nav className="home-quick-chips" aria-label="Chơi nhanh">
        <Link to="/fortune" className="home-fortune-card">
          <span className="home-fortune-card-label">{FORTUNE_BRAND.emoji} {FORTUNE_BRAND.label}</span>
          <div className="home-fortune-card-stats">
            <span title="Lượt xem">
              <User size={11} aria-hidden="true" />
              {(fortuneStats.view_count || 0).toLocaleString()}
            </span>
            <span title="Lượt chia sẻ">
              <Send size={11} aria-hidden="true" />
              {(fortuneStats.share_count || 0).toLocaleString()}
            </span>
            <span title="Lượt thích">
              <Heart size={11} strokeWidth={2} aria-hidden="true" />
              {(fortuneStats.like_count || 0).toLocaleString()}
            </span>
          </div>
        </Link>
        <Link to="/balance" className="home-quick-chip balance">⚖️ Chọn 1 trong 2</Link>
        <Link to="/roast-card" className="home-quick-chip roast">💳 Thẻ đen bóc phốt</Link>
      </nav>

      <div className="category-tabs" role="tablist" aria-label="Danh mục quiz">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={activeTab === cat.id}
            className={`glass-tab ${cat.color} ${activeTab === cat.id ? 'active' : ''}`}
            onClick={() => setActiveTab(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="sort-tabs">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={`sort-tab ${sortMode === opt.id ? 'active' : ''}`}
            onClick={() => setSortMode(opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="glass-section-title">{SECTION_TITLES[sortMode]}</h3>
        <div className="glass-list grid-cols-2">
          {filteredQuizzes.length === 0 ? (
            <div className="text-center p-8 text-gray-500 font-bold col-span-2">Chưa có quiz nào hết trơn á! 🕸️</div>
          ) : (
            filteredQuizzes.map((quiz) => (
              <div key={quiz.id} className="glass-card square-card" onClick={() => handleQuizClick(quiz.id)}>
                <div className="glass-card-thumb-large">
                  <QuizImage src={quiz.image_url} alt="thumb" seed={quiz.id} />
                </div>
                <div className="glass-card-info-bottom">
                  <h4 className="info-title-sm line-clamp-2">{quiz.title}</h4>
                  <QuizCardStats quiz={quiz} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <AdSenseUnit adSlot={AD_SLOTS.home} location="home-middle" />

      <div className="home-intro-box">
        <h3 className="home-intro-box-title">nambac.xyz — Trắc nghiệm tính cách AI</h3>
        <p className="home-intro-box-desc">
          Mỗi bài chỉ 5 câu hỏi — nhanh, vui và đầy bất ngờ!
        </p>
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

        <button
          type="button"
          className={`home-intro-btn home-intro-btn-wide${introModal === 'brands' ? ' active' : ''}`}
          aria-expanded={introModal === 'brands'}
          onClick={() => openIntroSection('brands')}
        >
          Hợp tác thương hiệu 🎯
        </button>

        <Link to="/blog" className="home-intro-btn home-intro-btn-wide home-intro-btn-link">
          Insights 📰 — Bài viết phân tích
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
