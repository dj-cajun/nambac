import { User, Send, Heart } from 'lucide-react';

export default function QuizCardStats({ quiz }) {
  return (
    <div className="glass-card-stats">
      <span title="Lượt xem">
        <User size={10} aria-hidden="true" />
        {(quiz.view_count || 0).toLocaleString()}
      </span>
      <span title="Lượt chia sẻ">
        <Send size={10} aria-hidden="true" />
        {(quiz.share_count || 0).toLocaleString()}
      </span>
      <span title="Lượt thích">
        <Heart size={10} strokeWidth={2} fill="none" aria-hidden="true" />
        {(quiz.like_count || 0).toLocaleString()}
      </span>
    </div>
  );
}
