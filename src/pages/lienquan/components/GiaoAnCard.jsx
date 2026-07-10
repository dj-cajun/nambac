import { Link } from 'react-router-dom';
import { getHero } from '../../../../shared/lienquan/heroes.js';
import HeroIcon from './HeroIcon.jsx';
import CopyButton from './CopyButton.jsx';

export default function GiaoAnCard({ giaoAn }) {
  if (!giaoAn) return null;
  const hero = getHero(giaoAn.heroId);

  return (
    <article className="lq-giaoan-card">
      <div className="lq-giaoan-top">
        {hero && <HeroIcon hero={hero} size="md" />}
        <div>
          <h3>{giaoAn.player}</h3>
          <p className="lq-giaoan-meta">
            {hero?.name || giaoAn.heroId} · {giaoAn.team}
          </p>
        </div>
      </div>
      <div className="lq-giaoan-items">
        {(giaoAn.items || []).map((item) => (
          <span key={item} className="lq-item-chip">{item}</span>
        ))}
      </div>
      <p className="lq-giaoan-extra">
        Arcana: {giaoAn.arcana} · Spell: {giaoAn.spell}
      </p>
      <div className="lq-giaoan-actions">
        <CopyButton text={giaoAn.copyCode} />
        {hero && (
          <Link to={`/lienquan/tuong/${hero.id}`} className="lq-text-link">
            Xem tướng
          </Link>
        )}
      </div>
    </article>
  );
}
