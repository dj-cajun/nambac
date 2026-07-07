import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './Home.css';
import { fetchQuizzes, incrementQuizStat } from '../lib/quizApi';
import { sortByViralScore, trackQuizViewOnce } from '../lib/quizRanking';
import QuizImage from '../components/QuizImage';
import QuizCardStats from '../components/QuizCardStats';

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

      <div className="mt-6">
        <h3 className="glass-section-title">🏆 BXH Hot</h3>
        <p className="page-list-subtitle">Top quiz hay chơi &amp; hay share nhất</p>

        <div className="glass-list grid-cols-2">
          {ranked.length === 0 ? (
            <div className="text-center p-8 text-gray-500 font-bold col-span-2">Chưa có quiz nào hết trơn á! 🕸️</div>
          ) : (
            ranked.map((quiz, index) => (
              <div
                key={quiz.id}
                className="glass-card square-card leaderboard-card"
                onClick={() => handleQuizClick(quiz.id)}
              >
                {index < 99 && (
                  <span className={`leaderboard-rank-badge${index < 3 ? ' top-rank' : ''}`}>
                    {index + 1}
                  </span>
                )}
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

      <div style={{ marginBottom: '100px' }} />
    </div>
  );
}
