import QuizImage from './QuizImage';

export default function QuizCardThumb({ src, seed, alt = '', typeLabel = 'Quiz' }) {
  return (
    <div className="glass-card-thumb-large">
      {typeLabel && <span className="glass-card-type-badge">{typeLabel}</span>}
      <QuizImage src={src} alt={alt} seed={seed} />
    </div>
  );
}
