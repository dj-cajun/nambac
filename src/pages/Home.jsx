import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Send } from 'lucide-react';
import './Home.css';
import { QUIZ_CATEGORIES, HOME_SPECIAL_TABS, matchesCategory } from '../constants/categories';
import { fetchQuizzes, incrementQuizStat } from '../lib/quizApi';
import AdSenseUnit from '../components/AdSenseUnit';
import QuizImage from '../components/QuizImage';
import BottomNav from '../components/BottomNav';
import { AD_SLOTS } from '../lib/adsConfig';

const SORT_OPTIONS = [
  { id: 'trending', label: '🔥 Hot', sortFn: (a, b) => (b.view_count || 0) - (a.view_count || 0) },
  { id: 'viral', label: '📤 Viral', sortFn: (a, b) => (b.share_count || 0) - (a.share_count || 0) },
  { id: 'new', label: '✨ Mới', sortFn: (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0) },
];

const SECTION_TITLES = {
  trending: '🔥 Top Thịnh Hành',
  viral: '📤 Viral tuần này',
  new: '✨ Mới hôm nay',
};

export default function Home() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [sortMode, setSortMode] = useState('trending');
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef(null);

  const categories = [
    ...HOME_SPECIAL_TABS,
    ...QUIZ_CATEGORIES.map(c => ({ id: c.id, label: c.label, color: c.color })),
  ];

  useEffect(() => {
    fetchQuizzes()
      .then(setQuizzes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const sortFn = SORT_OPTIONS.find((s) => s.id === sortMode)?.sortFn || SORT_OPTIONS[0].sortFn;

  const sortedQuizzes = useMemo(
    () => [...quizzes].sort(sortFn),
    [quizzes, sortFn],
  );

  const filteredQuizzes = useMemo(() => {
    if (activeTab === 'all') return sortedQuizzes;
    return sortedQuizzes.filter((q) => matchesCategory(q.category, activeTab));
  }, [sortedQuizzes, activeTab]);

  const heroQuizzes = sortedQuizzes.slice(0, 3);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    if (carouselRef.current) {
      carouselRef.current.scrollTo({
        left: index * carouselRef.current.offsetWidth,
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
            left: nextSlide * carouselRef.current.offsetWidth,
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
      const width = carouselRef.current.offsetWidth;
      const newIndex = Math.round(scrollLeft / width);
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
    incrementQuizStat(quizId, 'view').catch(console.error);
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
            {heroQuizzes.map((quiz, index) => (
              <div key={quiz.id} className="hero-slide" onClick={() => handleQuizClick(quiz.id)}>
                <div className="hero-image-bg">
                  <QuizImage src={quiz.image_url} alt="Hero" seed={quiz.id} />
                </div>
                <div className="hero-overlay-gradient" />
                <div className="hero-content">
                  <div className="speech-bubble">
                    💬 {(quiz.view_count || 0).toLocaleString()} Đang chơi
                  </div>
                  <div className="mb-2">
                    <span className="trending-badge">
                      {index === 0 ? 'Top Thịnh Hành 🔥' : index === 1 ? 'HOT 🔥' : 'Mới ✨'}
                    </span>
                  </div>
                  <h2 className="hero-title">{quiz.title}</h2>
                  <p className="hero-desc">{quiz.description}</p>
                  <button className="hero-btn">Bắt đầu ngay</button>
                </div>
              </div>
            ))}
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

      <div className="category-tabs">
        {categories.map((cat) => (
          <button
            key={cat.id}
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
                  <div className="flex justify-between items-center mt-auto w-full">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                      <User size={10} /> {(quiz.view_count || 0).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                      <Send size={10} /> {(quiz.share_count || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <AdSenseUnit adSlot={AD_SLOTS.home} location="home-middle" />

      <div style={{
        marginTop: '32px',
        marginBottom: '100px',
        padding: '24px',
        background: 'rgba(255,255,255,0.7)',
        borderRadius: '20px',
        border: '1px solid rgba(0,0,0,0.05)',
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#1a1a1a', marginBottom: '12px' }}>
          🎯 nambac.xyz — Trắc nghiệm tính cách AI
        </h3>
        <p style={{ fontSize: '13px', color: '#555', lineHeight: '1.8', marginBottom: '12px' }}>
          nambac.xyz là nền tảng trắc nghiệm tính cách trực tuyến sử dụng trí tuệ nhân tạo (AI) tiên tiến. Mỗi bài chỉ gồm 5 câu hỏi — nhanh, vui và đầy bất ngờ!
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
          <a href="/about" style={{ fontSize: '12px', color: '#FF2D85', fontWeight: '700', textDecoration: 'underline' }}>Giới thiệu</a>
          <span style={{ color: '#ddd' }}>|</span>
          <a href="/faq" style={{ fontSize: '12px', color: '#FF2D85', fontWeight: '700', textDecoration: 'underline' }}>FAQ</a>
          <span style={{ color: '#ddd' }}>|</span>
          <a href="/privacy-policy" style={{ fontSize: '12px', color: '#FF2D85', fontWeight: '700', textDecoration: 'underline' }}>Bảo mật</a>
          <span style={{ color: '#ddd' }}>|</span>
          <a href="/terms-of-service" style={{ fontSize: '12px', color: '#FF2D85', fontWeight: '700', textDecoration: 'underline' }}>Điều khoản</a>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
