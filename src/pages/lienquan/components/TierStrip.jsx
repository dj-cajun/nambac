import { useState } from 'react';
import { LQ_UI } from '../../../../shared/lienquan/uiText.js';
import { LANES, getLaneHeroIds, TIER_BOARD } from '../../../../shared/lienquan/tiers.js';
import { getHero } from '../../../../shared/lienquan/heroes.js';
import HeroIcon from './HeroIcon.jsx';

export default function TierStrip() {
  const [lane, setLane] = useState('top');
  const ids = getLaneHeroIds(lane);
  const heroes = ids.map((id) => getHero(id)).filter(Boolean);

  return (
    <section className="lq-tier">
      <div className="lq-tier-head">
        <h2>{LQ_UI.tabCounterTier}</h2>
        <span className="lq-tier-date">{TIER_BOARD.label} · {TIER_BOARD.updatedAt}</span>
      </div>
      <p className="lq-tier-lane-label">{LQ_UI.lanePick}</p>
      <div className="lq-tier-tabs" role="tablist" aria-label={LQ_UI.lanePick}>
        {LANES.map((l) => (
          <button
            key={l.id}
            type="button"
            role="tab"
            aria-selected={lane === l.id}
            className={`lq-tier-tab${lane === l.id ? ' active' : ''}`}
            onClick={() => setLane(l.id)}
          >
            {l.label}
          </button>
        ))}
      </div>
      <div className="lq-tier-strip" role="list">
        {heroes.map((hero) => (
          <div key={hero.id} className="lq-tier-item" role="listitem">
            <HeroIcon hero={hero} size="lg" showName to={`/lienquan/tuong/${hero.id}`} />
            <span className="lq-tier-badge">{hero.tier}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
