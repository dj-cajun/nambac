import { Link } from 'react-router-dom';
import { User, Send, Heart } from 'lucide-react';
import QuizImage from './QuizImage';

export default function FeatureThumbCard({ to, label, typeLabel, imageSrc, imageSeed, stats }) {
  return (
    <Link to={to} className="feature-thumb-card">
      <div className="feature-thumb-card-image">
        <QuizImage src={imageSrc} alt="" seed={imageSeed} />
      </div>
      <div className="feature-thumb-card-info">
        {typeLabel && <span className="quiz-card-type">{typeLabel}</span>}
        <span className="feature-thumb-card-label">{label}</span>
        {stats && (
          <div className="home-fortune-card-stats">
            <span title="Lượt xem">
              <User size={11} aria-hidden="true" />
              {(stats.view_count || 0).toLocaleString()}
            </span>
            <span title="Lượt chia sẻ">
              <Send size={11} aria-hidden="true" />
              {(stats.share_count || 0).toLocaleString()}
            </span>
            <span title="Lượt thích">
              <Heart size={11} strokeWidth={2} aria-hidden="true" />
              {(stats.like_count || 0).toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
