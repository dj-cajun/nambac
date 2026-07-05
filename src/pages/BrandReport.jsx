import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { TrendingUp, Eye, Share2, Users } from 'lucide-react';
import { apiUrl } from '../lib/apiConfig';
import './BrandReport.css';

export default function BrandReport() {
  const { quizId, token } = useParams();
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(apiUrl(`/brand/stats?quizId=${quizId}&token=${token}`));
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Not found');
        setReport(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [quizId, token]);

  if (loading) {
    return (
      <div className="brand-report-page">
        <div className="brand-report-loading">Đang tải báo cáo...</div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="brand-report-page">
        <div className="brand-report-error">
          <h2>Không tìm thấy báo cáo</h2>
          <p>Link báo cáo không hợp lệ hoặc đã hết hạn.</p>
          <Link to="/brands">Liên hệ Nambac</Link>
        </div>
      </div>
    );
  }

  const { quiz, stats } = report;

  return (
    <div className="brand-report-page">
      <Helmet>
        <title>Báo cáo chiến dịch — {quiz.title} | nambac</title>
      </Helmet>

      <div className="brand-report-glow b1" />
      <div className="brand-report-glow b2" />

      <main className="brand-report-main">
        <span className="brand-report-badge">📊 BÁO CÁO THƯƠNG HIỆU</span>
        <h1>{quiz.title}</h1>
        {quiz.brand_name && <p className="brand-name">{quiz.brand_name}</p>}

        <div className="brand-stats-grid">
          <div className="brand-stat-card">
            <Eye size={22} />
            <span className="stat-num">{stats.views.toLocaleString()}</span>
            <span className="stat-label">Lượt xem</span>
          </div>
          <div className="brand-stat-card">
            <Users size={22} />
            <span className="stat-num">{stats.participants.toLocaleString()}</span>
            <span className="stat-label">Người chơi</span>
          </div>
          <div className="brand-stat-card">
            <Share2 size={22} />
            <span className="stat-num">{stats.shares.toLocaleString()}</span>
            <span className="stat-label">Lượt chia sẻ</span>
          </div>
          <div className="brand-stat-card highlight">
            <TrendingUp size={22} />
            <span className="stat-num">{stats.share_rate_pct}%</span>
            <span className="stat-label">Tỷ lệ share</span>
          </div>
        </div>

        <div className="brand-report-meta">
          <p>Quiz ID: <code>{quiz.id}</code></p>
          <p>Loại: {quiz.quiz_type} · {quiz.category}</p>
          <p>Cập nhật realtime từ nambac.xyz</p>
        </div>

        <Link to="/brands" className="brand-report-cta">Đặt quiz mới →</Link>
      </main>
    </div>
  );
}
