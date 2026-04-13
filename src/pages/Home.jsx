import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, User, Heart, MessageCircle, Send, Plus,
  Home as HomeIcon, Compass, BarChart2, Settings, Play, ChevronLeft, ChevronRight
} from 'lucide-react';
import './Home.css';
import { QUIZ_CATEGORIES, HOME_SPECIAL_TABS } from '../constants/categories';
import { getImageUrl } from '../lib/apiConfig';
import { supabase } from '../lib/supabase';
import AdSenseUnit from '../components/AdSenseUnit';

export default function Home() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef(null);

  // Categories: Special tabs first, then quiz categories
  const categories = [
    ...HOME_SPECIAL_TABS,
    ...QUIZ_CATEGORIES.map(c => ({ id: c.id, label: c.label, color: c.color })),
  ];


  const [magazineArticles, setMagazineArticles] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);

  // Fetch Quizzes from Supabase and Local Backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Supabase에서 퀴즈 가져오기
        const { data: cloudData, error: cloudError } = await supabase
          .from('quizzes')
          .select('*')
          .order('created_at', { ascending: false });

        if (cloudError) console.error("Supabase fetch error:", cloudError);
        
        // Only show active quizzes
        const activeQuizzes = (cloudData || []).filter(q => q.is_active !== false && q.status !== 'hidden');
        
        // 최신순 정렬
        activeQuizzes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        setQuizzes(activeQuizzes);


        setMagazineArticles([]);
        
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getRandomCount = () => Math.floor(Math.random() * (500 - 50 + 1)) + 50;

  // Legacy category mapping for backward compatibility with existing DB records
  const legacyCategoryMap = {
    'MBTI': ['MBTI', 'Tính Cách (MBTI)'],
    'Personality': ['Personality', 'Tính Cách', 'Lifestyle'],
    'Fortune': ['Fortune', 'Bói Toán (Tarot)'],
    'PastLife': ['PastLife', 'Kiếp Trước'],
    'Survival': ['Survival', 'Sinh Tồn', 'HCMC_Guide'],
    'Trendy': ['Trendy', 'Xu Hướng', 'Trend_Hunter'],
    'Delivery': ['Delivery', 'Giao Hàng', 'Delivery_King'],
    'Lookalike': ['Lookalike', 'Ai Giống?', 'Linker_Lookalike'],
  };

  // Derived state for Main List
  const filteredQuizzes = useMemo(() => {
    let result = quizzes;
    if (activeTab !== 'all') {
      const allowedCategories = legacyCategoryMap[activeTab] || [activeTab];
      result = result.filter(q => allowedCategories.includes(q.category));
    }
    return result;
  }, [quizzes, activeTab]);

  // Get top 3 quizzes for carousel
  const heroQuizzes = quizzes.slice(0, 3);

  // Carousel Navigation
  const goToSlide = (index) => {
    setCurrentSlide(index);
    if (carouselRef.current) {
      carouselRef.current.scrollTo({
        left: index * carouselRef.current.offsetWidth,
        behavior: 'smooth'
      });
    }
  };

  // Mouse Drag State
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  // Auto-slide effect (5 seconds)
  useEffect(() => {
    if (isDragging) return; // Pause auto-slide while dragging

    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const nextSlide = (prev + 1) % heroQuizzes.length;
        if (carouselRef.current) {
          carouselRef.current.scrollTo({
            left: nextSlide * carouselRef.current.offsetWidth,
            behavior: 'smooth'
          });
        }
        return nextSlide;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [heroQuizzes.length, isDragging]);

  // Handle scroll to update dots (User Interaction)
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

  // Mouse Drag Handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeftState(carouselRef.current.scrollLeft);
    if (carouselRef.current) {
      // Temporarily disable snap for smooth dragging
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
      // Optional: manually snap to nearest here if needed, but CSS snap usually takes over once user stops
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll-fast
    carouselRef.current.scrollLeft = scrollLeftState - walk;
  };


  const handleQuizClick = async (quizId) => {
    // 1. Fire and forget view increment
    try {
      const quizToUpdate = quizzes.find(q => q.id === quizId);
      if (quizToUpdate) {
        supabase.from('quizzes')
          .update({ view_count: (quizToUpdate.view_count || 0) + 1 })
          .eq('id', quizId)
          .then();
      }
    } catch (e) {
      console.error("View increment failed", e);
    }
    // 2. Navigate
    navigate(`/quiz/${quizId}`);
  };

  if (loading) {
    return (
      <div className="home-container flex items-center justify-center">
        <div className="text-2xl font-black text-[#1E293B] animate-pulse">
          Đang tải... ⚡
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* 2. Hero Carousel (3 Slides) */}
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
            <div
              key={quiz.id}
              className="hero-slide"
              onClick={() => handleQuizClick(quiz.id)}
            >
              <div className="simple-tape"></div>
              <div className="hero-image-bg">
                <img src={getImageUrl(quiz.image_url) || `https://images.unsplash.com/photo-161800518238${index}-a83a8bd57fbe`} alt="Hero" />
              </div>
              <div className="hero-overlay-gradient"></div>

              <div className="hero-content">
                <div className="speech-bubble">
                  💬 {(quiz.view_count || 0).toLocaleString()} Đang chơi
                </div>
                <div className="mb-2">
                  <span className="trending-badge">
                    {index === 0 ? 'Top Thịnh Hành 🔥' : index === 1 ? 'HOT 🔥' : 'Mới ✨'}
                  </span>
                </div>
                <h2 className="hero-title" style={{ display: 'none' }}>{quiz.title}</h2>
                <p className="hero-desc" style={{ display: 'none' }}>
                  {quiz.description}
                </p>
                <button className="hero-btn" style={{ display: 'none' }}>
                  Bắt đầu ngay
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Dots */}
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

      {/* 3. Category Tabs (Horizontal Scroll with Pastel Colors) */}
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

      {/* 4. Content List (Quiz or Magazine) */}
      <div className="mt-6">
        <h3 className="glass-section-title">🔥 Top Thịnh Hành</h3>
        <div className="glass-list grid-cols-2">
          {filteredQuizzes.length === 0 ? (
            <div className="text-center p-8 text-gray-500 font-bold col-span-2">Chưa có quiz nào hết trơn á! 🕸️</div>
          ) : (
            filteredQuizzes.map((quiz) => (
              <div key={quiz.id} className="glass-card square-card" onClick={() => handleQuizClick(quiz.id)}>
                <div className="card-tape"></div>
                <div className="glass-card-thumb-large">
                  <img src={getImageUrl(quiz.image_url) || "https://api.dicebear.com/7.x/shapes/svg?seed=" + quiz.id} alt="thumb" />
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
      {/* AdSense Slot (Between Quiz List and About Section) */}
      <AdSenseUnit adSlot="1234567890" location="home-middle" />

      {/* About Section — Rich text content for AdSense compliance */}
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
          nambac.xyz là nền tảng trắc nghiệm tính cách trực tuyến sử dụng trí tuệ nhân tạo (AI) tiên tiến. Chúng tôi kết hợp Google Gemini AI với tâm lý học hiện đại để tạo ra những bài trắc nghiệm thú vị giúp bạn khám phá tính cách và sở thích cá nhân. Mỗi bài chỉ gồm 5 câu hỏi — nhanh, vui và đầy bất ngờ!
        </p>
        <p style={{ fontSize: '13px', color: '#555', lineHeight: '1.8', marginBottom: '12px' }}>
          Khám phá các chủ đề đa dạng: MBTI & tính cách, tình yêu & mối quan hệ, ẩm thực & lối sống, nghề nghiệp & tài chính, và nhiều hơn nữa. Tất cả hoàn toàn miễn phí!
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

      {/* 6. Bottom Nav */}
      <div className="fixed bottom-0 left-[50%] translate-x-[-50%] w-full max-w-[480px] h-[80px] bg-white border-t-2 border-black flex items-center justify-around z-50">
        <div className="nav-item-col active">
          <HomeIcon size={24} strokeWidth={2.5} color="#FF2D85" />
          <span className="text-[10px] font-bold text-[#FF2D85]">Trang chủ</span>
        </div>
        <div className="nav-item-col" onClick={() => alert('🔜 Khám phá — Sắp ra mắt!')}>
          <Compass size={24} color="#94A3B8" />
          <span className="text-[10px] font-bold text-gray-400">Khám phá</span>
        </div>
        <div className="w-12"></div>
        <div className="nav-item-col" onClick={() => alert('🔜 BXH — Sắp ra mắt!')}>
          <BarChart2 size={24} color="#94A3B8" />
          <span className="text-[10px] font-bold text-gray-400">BXH</span>
        </div>
        <div className="nav-item-col" onClick={() => navigate('/admin')}>
          <Settings size={24} color="#94A3B8" />
          <span className="text-[10px] font-bold text-gray-400">ADMIN</span>
        </div>
      </div>
    </div>
  );
}
