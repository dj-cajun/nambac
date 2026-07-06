import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { User, Send } from 'lucide-react';
import './Home.css';
import { fetchQuizzes, incrementQuizStat } from '../lib/quizApi';
import { sortByViralScore, trackQuizViewOnce } from '../lib/quizRanking';
import QuizImage from '../components/QuizImage';

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes()
      .then(setQuizzes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const ranked = useMemo(() => sortByViralScore(quizzes), [quizzes]);

  const handleQuizClick = (quizId) => {
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
      <Helmet>
        <title>BXH — nambac.xyz</title>
        <meta name="description" content="Bảng xếp hạng quiz hot nhất trên nambac.xyz" />
      </Helmet>

      <div className="mt-4 px-5">
        <h1 className="glass-section-title mb-1">🏆 BXH Hot</h1>
        <p className="text-sm text-gray-500 font-bold mb-4">Top quiz hay chơi &amp; hay share nhất</p>
      </div>

      <div className="px-5 flex flex-col gap-3" style={{ marginBottom: '100px' }}>
        {ranked.length === 0 ? (
          <div className="text-center p-8 text-gray-500 font-bold">Chưa có quiz nào hết trơn á! 🕸️</div>
        ) : (
          ranked.map((quiz, index) => (
            <button
              key={quiz.id}
              type="button"
              onClick={() => handleQuizClick(quiz.id)}
              className="glass-card w-full text-left"
              style={{ padding: '10px' }}
            >
              <div className="flex items-center gap-3 w-full">
                <span
                  className={`leaderboard-rank-badge flex-shrink-0 font-black text-sm${index < 3 ? ' top-rank' : ''}`}
                >
                  {index + 1}
                </span>
                <div className="leaderboard-quiz-thumb">
                  <QuizImage src={quiz.image_url} alt="" seed={quiz.id} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="info-title-sm line-clamp-2">{quiz.title}</h4>
                  <div className="flex gap-3 text-[10px] font-bold text-gray-400 mt-1">
                    <span className="flex items-center gap-1"><User size={10} /> {(quiz.view_count || 0).toLocaleString()}</span>
                    <span className="flex items-center gap-1"><Send size={10} /> {(quiz.share_count || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      <div style={{ marginBottom: '100px' }} />
    </div>
  );
}
