import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './Home.css';

const Home = () => {
  const [quizzes, setQuizzes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      const { data } = await supabase.from('quizzes').select('*').eq('is_active', true);
      setQuizzes(data || []);
    };
    fetchQuizzes();
  }, []);

  return (
    <div className="home-container">
      {/* 1. 히어로 섹션 */}
      <header className="hero-section">
        <div className="hero-content">
          <span className="trending-tag">✨ TRENDING QUIZ</span>
          <h1>Which 2000s Pop Diva<br/>Matches Your Aesthetic?</h1>
          <p>Take the ultimate nostalgia trip with Nambac and find out your Y2K persona.</p>
          <button className="play-now-btn" onClick={() => navigate('/quiz/1')}>▶ Play Now</button>
        </div>
        <div className="hero-mascot">
            <img src="https://api.dicebear.com/7.x/bottts/svg?seed=nambac" alt="mascot" />
        </div>
      </header>

      {/* 2. 카테고리 칩 */}
      <nav className="category-bar">
        <button className="cat-chip active">🎀 All Vibe</button>
        <button className="cat-chip">💖 Love & Destiny</button>
        <button className="cat-chip">💼 Career Path</button>
        <button className="cat-chip">🧠 Personality</button>
      </nav>

      {/* 3. Fresh Picks (퀴즈 그리드) */}
      <section className="fresh-picks">
        <div className="section-header">
          <h3>Fresh Picks 🦄</h3>
          <span className="view-all">View all →</span>
        </div>
        <div className="quiz-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {quizzes.map(quiz => (
            <div key={quiz.id} className="border-4 border-black p-4 bg-white shadow-[8px_8px_0px_0px_#FF69B4] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
              <img 
                src={quiz.image_url || "https://api.dicebear.com/7.x/thumbs/svg?seed=" + quiz.id} 
                className="w-full h-40 object-cover border-2 border-black mb-4" 
                alt="quiz" 
              />
              <h2 className="text-xl font-black mb-4 text-black leading-tight">{quiz.title}</h2>
              {/* 이 버튼이 실제 페이지로 연결되는 핵심 */}
              <Link to={`/quiz/${quiz.id}`} className="block text-center bg-black text-white font-black py-3 hover:bg-pink-500 transition-colors">
                퀴즈 시작하기 🚀
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 4. 리더보드 & 스트릭 (사진 하단 구조) */}
      <section className="bottom-layout">
        <div className="leaderboard-box">
          <h3>Top Scorers This Week 🏆</h3>
          <div className="rank-list">
            <div className="rank-item"><span>1</span><div className="user-dot pink"></div> Linh_Strawberry <span className="pts">2,450 pts</span></div>
            <div className="rank-item"><span>2</span><div className="user-dot purple"></div> Mochi_Babe <span className="pts">2,100 pts</span></div>
            <div className="rank-item"><span>3</span><div className="user-dot blue"></div> GenZ_Dreamer <span className="pts">1,980 pts</span></div>
          </div>
        </div>
        
        <div className="streak-card">
          <div className="streak-header">
            <h3>My Streak</h3>
            <span className="streak-icon">🔥</span>
          </div>
          <div className="streak-val">12 <span>Days</span></div>
          <p>You're on fire! Keep playing to unlock the Crystal Goggles badge.</p>
          <div className="streak-progress">
             <div className="bar"><div className="fill" style={{width:'80%'}}></div></div>
             <span className="next-goal">NEXT MILESTONE: 15 DAYS</span>
          </div>
        </div>
      </section>
    </div>
  );
};
export default Home;
