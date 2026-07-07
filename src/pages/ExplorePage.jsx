import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { User, Send } from 'lucide-react';
import './Home.css';
import { fetchQuizzes, incrementQuizStat } from '../lib/quizApi';
import { sortByViralScore, trackQuizViewOnce } from '../lib/quizRanking';
import QuizImage from '../components/QuizImage';

export default function ExplorePage() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes()
      .then(setQuizzes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const sorted = useMemo(() => sortByViralScore(quizzes), [quizzes]);

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
        <title>Khám phá — nambac.xyz</title>
        <meta name="description" content="Quiz viral được chia sẻ nhiều nhất trên nambac.xyz" />
      </Helmet>

      <div className="mt-4 px-5">
        <h1 className="glass-section-title mb-1">🧭 Khám phá</h1>
        <p className="text-sm text-gray-500 font-bold mb-4">Quiz được chia sẻ nhiều nhất — thử ngay!</p>
      </div>

      <div className="glass-list grid-cols-2">
        {sorted.length === 0 ? (
          <div className="text-center p-8 text-gray-500 font-bold col-span-2">Chưa có quiz nào hết trơn á! 🕸️</div>
        ) : (
          sorted.map((quiz) => (
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
                  <div className="flex items-center gap-1 text-[10px] font-bold text-[#FF2D85]">
                    <Send size={10} /> {(quiz.share_count || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ marginBottom: '100px' }} />
    </div>
  );
}
