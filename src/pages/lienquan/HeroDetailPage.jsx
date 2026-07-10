import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { getHero, resolveCounters } from '../../../shared/lienquan/heroes.js';
import HeroIcon from './components/HeroIcon.jsx';
import './lienquan.css';

export default function HeroDetailPage() {
  const { slug } = useParams();
  const hero = getHero(slug);
  const counters = hero ? resolveCounters(hero) : [];

  if (!hero) {
    return (
      <div className="lienquan-page">
        <Link to="/lienquan" className="lq-back">← Liên Quân</Link>
        <p className="lq-coming">Không tìm thấy tướng.</p>
        <Link to="/lienquan" className="lq-chip">Về trang chủ Liên Quân</Link>
      </div>
    );
  }

  return (
    <div className="lienquan-page">
      <Helmet>
        <title>{hero.name} — Counter & tip | Liên Quân nambac</title>
        <meta name="description" content={`${hero.name} tier ${hero.tier}. ${hero.tip}`} />
      </Helmet>

      <Link to="/lienquan" className="lq-back">← Liên Quân</Link>

      <div className="lq-detail-card">
        <div className="lq-detail-profile">
          <HeroIcon hero={hero} size="lg" />
          <div>
            <h1>{hero.name}</h1>
            <p className="lq-detail-lane">
              {hero.lane} · Tier <strong>{hero.tier}</strong>
            </p>
          </div>
        </div>

        <h2 className="lq-section-title">Counter mạnh</h2>
        <div className="lq-counter-row">
          {counters.length === 0 && <p className="lq-detail-lane">Chưa có dữ liệu counter.</p>}
          {counters.map((c) => (
            <HeroIcon key={c.id} hero={c} size="md" showName to={`/lienquan/tuong/${c.id}`} />
          ))}
        </div>

        <h2 className="lq-section-title">Tip một dòng</h2>
        <p className="lq-tip">{hero.tip}</p>
      </div>

      <div className="lq-nav-chips">
        <Link to="/lienquan/giao-an" className="lq-chip">Xem Giáo Án Pro</Link>
      </div>
    </div>
  );
}
