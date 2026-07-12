import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import QuizImage from './QuizImage';

export default function HeroCarousel({ slides, onItemClick }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const dragMoved = useRef(false);

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

  useEffect(() => {
    if (isDragging || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const nextSlide = (prev + 1) % slides.length;
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
  }, [slides.length, isDragging]);

  useEffect(() => {
    setCurrentSlide(0);
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ left: 0, behavior: 'auto' });
    }
  }, [slides.length]);

  const handleScroll = () => {
    if (carouselRef.current && !isDragging) {
      const scrollLeft = carouselRef.current.scrollLeft;
      const step = getCarouselStep();
      if (!step) return;
      const newIndex = Math.round(scrollLeft / step);
      if (newIndex >= 0 && newIndex < slides.length && newIndex !== currentSlide) {
        setCurrentSlide(newIndex);
      }
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragMoved.current = false;
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
    if (Math.abs(walk) > 6) dragMoved.current = true;
    carouselRef.current.scrollLeft = scrollLeftState - walk;
  };

  if (slides.length === 0) return null;

  return (
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
            {slides.map((item) => (
              <Link
                key={`${item.kind}-${item.id}`}
                to={item.to || '/explore'}
                className="hero-slide"
                onClick={(e) => {
                  if (dragMoved.current) {
                    e.preventDefault();
                    return;
                  }
                  onItemClick?.(item);
                }}
              >
                <div className="hero-image-bg">
                  <QuizImage src={item.image_url} alt={item.title} seed={item.imageSeed} />
                </div>
                <div className="hero-overlay-gradient" />
                <div className="hero-content">
                  <span className="trending-badge">{item.typeLabel}</span>
                  <h2 className="hero-title">{item.title}</h2>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="carousel-dots">
          {slides.map((item, index) => (
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
  );
}
