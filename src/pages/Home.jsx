import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, User, Heart, MessageCircle, Send, Plus,
  Home as HomeIcon, Compass, BarChart2, Settings, Play, ChevronLeft, ChevronRight
} from 'lucide-react';
import './Home.css';
import { QUIZ_CATEGORIES, HOME_SPECIAL_TABS } from '../constants/categories';

export default function Home() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Total');
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef(null);

  // Categories: Special tabs first, then quiz categories
  const categories = [
    ...HOME_SPECIAL_TABS,
    ...QUIZ_CATEGORIES.map(c => ({ id: c.id, label: c.label, color: c.color })),
  ];

  const [services, setServices] = useState([]);
  const [magazineArticles, setMagazineArticles] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);

  // Fetch Quizzes & Services & Magazine from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quizRes, serviceRes, magRes] = await Promise.all([
          fetch('http://localhost:8000/api/quizzes'),
          fetch('http://localhost:8000/api/services'),
          fetch('http://localhost:8000/api/magazine')
        ]);

        const quizData = await quizRes.json();
        const serviceData = await serviceRes.json();
        const magData = await magRes.json();

        const quizList = quizData.quizzes || quizData || [];
        // Sort by created_at desc
        quizList.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        setQuizzes(quizList);

        setServices(serviceData.services || []);
        setMagazineArticles(magData.articles || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getRandomCount = () => Math.floor(Math.random() * (500 - 50 + 1)) + 50;

  const filteredQuizzes = activeTab === 'Total'
    ? quizzes
    : quizzes.filter(q => q.category === activeTab || (activeTab === 'Trendy' && !q.category));

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


  const [connectingService, setConnectingService] = useState(null);

  const handleServiceClick = (service) => {
    setIsConnecting(true);
    setConnectingService(service);

    // Fake loading delay for effect
    setTimeout(() => {
      window.open(service.url, '_blank');
      setIsConnecting(false);
      setConnectingService(null);
    }, 1500);
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
      {/* 0. Connecting Overlay (Fake Loader) */}
      {isConnecting && (
        <div className="connecting-overlay">
          <div className="connecting-box">
            <div className="spinner-pink"></div>
            <h3 className="text-lg font-bold mt-4 animate-pulse">
              Đang kết nối AI... 📡
            </h3>
            <p className="text-xs text-gray-500 mt-2">
              (Dữ liệu đang đi qua Hầm Thủ Thiêm...)
            </p>
            {connectingService && (
              <div className="mt-4 p-2 bg-pink-50 rounded-lg text-xs font-bold text-[#FF2D85] border border-pink-200">
                Target: {connectingService.title}
              </div>
            )}
          </div>
        </div>
      )}

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
              onClick={() => navigate(`/quiz/${quiz.id}`)}
            >
              <div className="simple-tape"></div>
              <div className="hero-image-bg">
                <img src={quiz.image_url || `https://images.unsplash.com/photo-161800518238${index}-a83a8bd57fbe`} alt="Hero" />
              </div>
              <div className="hero-overlay-gradient"></div>

              <div className="hero-content">
                <div className="speech-bubble">
                  💬 {(120432 + index * 10000).toLocaleString()} Đang chơi
                </div>
                <div className="mb-2">
                  <span className="trending-badge">
                    {index === 0 ? 'Top Thịnh Hành 🔥' : index === 1 ? 'HOT 🔥' : 'Mới ✨'}
                  </span>
                </div>
                <h2 className="hero-title">{quiz.title}</h2>
                <p className="hero-desc">
                  {quiz.description}
                </p>
                <button className="hero-btn">
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
        {activeTab === 'Magazine' ? (
          <>
            <h3 className="glass-section-title text-[#10B981]">📰 HCMC Guide</h3>
            <div className="glass-list">
              {magazineArticles.map((article) => (
                <div key={article.id} className="glass-card flex-col !items-start gap-4 h-auto" onClick={() => window.open(article.link || '#', '_blank')}>
                  <div className="relative w-full h-40 rounded-xl overflow-hidden border-2 border-black shadow-[4px_4px_0px_#000]">
                    <img src={article.image_url} alt="article" className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 bg-white border-2 border-black px-2 py-0.5 rounded-md text-[10px] font-bold shadow-[2px_2px_0px_#000]">
                      {article.category}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg leading-tight mb-1">{article.title}</h4>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{article.summary}</p>
                    <div className="mt-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Read More ↗
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <h3 className="glass-section-title">🔥 Top Thịnh Hành</h3>
            <div className="glass-list">
              {filteredQuizzes.length === 0 ? (
                <div className="text-center p-8 text-gray-500 font-bold">Chưa có quiz nào hết trơn á! 🕸️</div>
              ) : (
                filteredQuizzes.map((quiz) => (
                  <div key={quiz.id} className="glass-card" onClick={() => navigate(`/quiz/${quiz.id}`)}>
                    <div className="card-tape"></div>
                    <div className="glass-card-thumb">
                      <img src={quiz.image_url || "https://api.dicebear.com/7.x/shapes/svg?seed=" + quiz.id} alt="thumb" />
                    </div>
                    <div className="glass-card-info">
                      <div className="info-category">{quiz.category || 'VIBE'}</div>
                      <h4 className="info-title line-clamp-2">{quiz.title}</h4>
                      <div className="flex items-center gap-2 mt-2 text-xs font-bold text-gray-500">
                        <User size={12} className="inline" /> {getRandomCount().toLocaleString()} người tham gia
                      </div>
                    </div>
                    <div className="action-play-sm">
                      <Play size={16} fill="white" color="white" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
      {/* 5. AI Service Hub (New) */}
      <div className="mt-8 mb-24">
        <h3 className="glass-section-title text-[#FF2D85]">✨ AI Partner Services</h3>
        <p className="px-4 text-xs text-gray-500 mb-3">Công cụ AI xịn xò từ Hugging Face & Friends</p>

        <div className="glass-list">
          {services.map((service) => (
            <div
              key={service.id}
              className="glass-card border-2 border-pink-100 bg-gradient-to-br from-white to-pink-50 hover:scale-[1.02] active:scale-95 transition-transform cursor-pointer"
              onClick={() => handleServiceClick(service)}
            >
              <div className="card-tape bg-pink-300"></div>
              <div className="glass-card-thumb">
                <img src={service.image_url} alt="service" className="filter hover:brightness-110 transition-all" />
              </div>
              <div className="glass-card-info">
                <div className="info-category bg-pink-100 text-[#FF2D85]">{service.category || 'AI Tool'}</div>
                <h4 className="info-title line-clamp-1 text-[#FF2D85]">{service.title}</h4>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{service.description}</p>
                <div className="mt-2 flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  External App ↗
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Bottom Nav */}
      <div className="fixed bottom-0 left-[50%] translate-x-[-50%] w-full max-w-[480px] h-[80px] bg-white border-t-2 border-black flex items-center justify-around z-50">
        <div className="nav-item-col active">
          <HomeIcon size={24} strokeWidth={2.5} color="#FF2D85" />
          <span className="text-[10px] font-bold text-[#FF2D85]">Trang chủ</span>
        </div>
        <div className="nav-item-col">
          <Compass size={24} color="#94A3B8" />
          <span className="text-[10px] font-bold text-gray-400">Khám phá</span>
        </div>
        <div className="w-12"></div>
        <div className="nav-item-col">
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
