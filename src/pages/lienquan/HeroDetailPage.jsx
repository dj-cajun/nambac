import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { getHero, resolveCounters } from '../../../shared/lienquan/heroes.js';
import { getGiaoAnForHero, getMatch } from '../../../shared/lienquan/giaoAns.js';
import { LQ_UI } from '../../../shared/lienquan/uiText.js';
import HeroIcon from './components/HeroIcon.jsx';
import ShareLinkButton from './components/ShareLinkButton.jsx';
import { buildLienquanOgImageUrl, buildLienquanShareUrl } from '../../lib/siteUrl';
import './lienquan.css';

export default function HeroDetailPage() {
  const { slug } = useParams();
  const hero = getHero(slug);
  const counters = hero ? resolveCounters(hero).slice(0, 3) : [];
  const giaoAn = hero ? getGiaoAnForHero(hero.id) : null;
  const match = giaoAn ? getMatch(giaoAn.matchId) : null;
  const ogImage = buildLienquanOgImageUrl({
    title: hero ? `${hero.name} — Counter & tip` : LQ_UI.hubTitle,
    subtitle: hero ? `${hero.lane} · Tier ${hero.tier}` : LQ_UI.hubSub,
  });
  const shareUrl = hero ? buildLienquanShareUrl({ heroId: hero.id }) : buildLienquanShareUrl();

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
        <title>{hero.name} — Khắc chế & tip | Liên Quân nambac</title>
        <meta name="description" content={`${hero.name} tier ${hero.tier}. ${hero.tip}`} />
        <link rel="canonical" href={`https://www.nambac.xyz/lienquan/tuong/${hero.id}`} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${hero.name} — Khắc chế & tip | Liên Quân`} />
        <meta property="og:description" content={hero.tip} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content={shareUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>

      <Link to="/lienquan" className="lq-back">← Liên Quân</Link>

      <div className="lq-detail-card">
        <div className="lq-detail-profile">
          <HeroIcon hero={hero} size="lg" />
          <div>
            <h1>{hero.name}</h1>
            {hero.title && <p className="lq-detail-title">{hero.title}</p>}
            <p className="lq-detail-lane">
              {hero.lane} · Tier <strong>{hero.tier}</strong>
            </p>
          </div>
        </div>

        <h2 className="lq-section-title">{LQ_UI.counterTitle}</h2>
        <div className="lq-counter-list">
          {counters.length === 0 && <p className="lq-detail-lane">Chưa có dữ liệu counter.</p>}
          {counters.map((c) => (
            <Link key={c.id} to={`/lienquan/tuong/${c.id}`} className="lq-counter-item">
              <HeroIcon hero={c} size="md" showName />
              <p className="lq-counter-why">{c.why}</p>
            </Link>
          ))}
        </div>

        <h2 className="lq-section-title">{LQ_UI.tipTitle}</h2>
        <p className="lq-tip">{hero.tip}</p>

        {giaoAn && (
          <>
            <h2 className="lq-section-title">{LQ_UI.buildLabel}</h2>
            <p className="lq-detail-lane">
              {giaoAn.player}
              {match ? ` · ${LQ_UI.matchLabel} ${match.title}` : ''}
            </p>
            <div className="lq-giaoan-items">
              {(giaoAn.items || []).map((item) => (
                <span key={item} className="lq-item-chip">{item}</span>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="lq-nav-chips">
        <Link
          to={giaoAn ? `/lienquan/giao-an#${giaoAn.id}` : '/lienquan/giao-an'}
          className="lq-chip"
        >
          {LQ_UI.tabGiaoAn}
        </Link>
        <ShareLinkButton heroId={hero.id} className="lq-chip lq-chip-btn" />
      </div>
    </div>
  );
}
