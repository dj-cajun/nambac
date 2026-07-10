import { Link } from 'react-router-dom';

const TIER_CLASS = {
  'S+': 'lq-tier-splus',
  S: 'lq-tier-s',
  A: 'lq-tier-a',
  B: 'lq-tier-b',
};

export default function HeroIcon({ hero, size = 'md', showName = false, to }) {
  if (!hero) return null;
  const initial = (hero.name || '?').slice(0, 1).toUpperCase();
  const tierClass = TIER_CLASS[hero.tier] || 'lq-tier-a';
  const inner = (
    <span className={`lq-hero-icon lq-hero-icon--${size}`}>
      <span className={`lq-hero-face ${tierClass}`} aria-hidden="true">
        {initial}
      </span>
      {showName && <span className="lq-hero-name">{hero.name}</span>}
    </span>
  );
  if (to) {
    return (
      <Link to={to} className="lq-hero-link">
        {inner}
      </Link>
    );
  }
  return inner;
}
