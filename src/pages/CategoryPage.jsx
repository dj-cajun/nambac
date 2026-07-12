import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getCategoryMeta, matchesCategory } from '../constants/categories';
import { fetchQuizzes, incrementQuizStat } from '../lib/quizApi';
import { sortByViralScore, trackQuizViewOnce } from '../lib/quizRanking';
import { scrollToTop } from '../lib/scrollToTop';
import QuizCardThumb from '../components/QuizCardThumb';
import QuizCardTitle from '../components/QuizCardTitle';
import QuizCardStats from '../components/QuizCardStats';
import './Home.css';

export default function CategoryPage() {
  const { categoryId } = useParams();
  const category = getCategoryMeta(categoryId);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    scrollToTop();
  }, [categoryId]);

  useEffect(() => {
    if (!category) return;
    setLoading(true);
    fetchQuizzes()
      .then(setQuizzes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category]);

  const filtered = useMemo(() => {
    if (!category) return [];
    return sortByViralScore(quizzes.filter((q) => matchesCategory(q.category, category.id)));
  }, [quizzes, category]);

  const trackView = (quizId) => {
    if (trackQuizViewOnce(quizId)) {
      incrementQuizStat(quizId, 'view').catch(console.error);
    }
  };

  if (!category) {
    return <Navigate to="/explore" replace />;
  }

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
        <title>{category.label} — nambac.xyz</title>
        <meta
          name="description"
          content={`Trắc nghiệm ${category.labelKo || category.id} — quiz Gen Z Sài Gòn trên nambac.xyz`}
        />
        <link rel="canonical" href={`https://www.nambac.xyz/category/${category.id}`} />
      </Helmet>

      <div className="mt-6">
        <h3 className="glass-section-title">{category.label}</h3>
        <p className="page-list-subtitle">Chọn bài bạn thích!</p>

        <div className="glass-list grid-cols-2">
          {filtered.length === 0 ? (
            <div className="text-center p-8 text-gray-500 font-bold col-span-2">
              Chưa có quiz nào trong mục này 🕸️
            </div>
          ) : (
            filtered.map((quiz) => (
              <Link
                key={quiz.id}
                to={`/quiz/${quiz.id}`}
                className="glass-card square-card"
                onClick={() => trackView(quiz.id)}
              >
                <QuizCardThumb
                  src={quiz.image_url}
                  seed={quiz.id}
                  alt={quiz.title}
                  typeLabel={category.label}
                />
                <div className="glass-card-info-bottom">
                  <QuizCardTitle title={quiz.title} />
                  <QuizCardStats quiz={quiz} />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      <div style={{ marginBottom: '100px' }} />
    </div>
  );
}
