import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './ComingSoonPage.css';

export default function ComingSoonPage({ title, emoji = '🚧' }) {
  return (
    <div className="coming-soon-page">
      <Helmet>
        <title>{title} — Đang xây dựng — nambac.xyz</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="coming-soon-card">
        <p className="coming-soon-emoji">{emoji}</p>
        <h1 className="coming-soon-title">{title}</h1>
        <p className="coming-soon-badge">🚧 Đang xây dựng</p>
        <p className="coming-soon-desc">
          Tính năng đang được hoàn thiện — quay lại sau nhé!
        </p>
        <Link to="/" className="coming-soon-home-btn">
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
