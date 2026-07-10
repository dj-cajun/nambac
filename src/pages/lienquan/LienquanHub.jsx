import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import SearchBar from './components/SearchBar.jsx';
import TierStrip from './components/TierStrip.jsx';
import QuizEventBanner from './components/QuizEventBanner.jsx';
import MasteryBadgeCard from './components/MasteryBadgeCard.jsx';
import GiaoAnCard from './components/GiaoAnCard.jsx';
import ShareLinkButton from './components/ShareLinkButton.jsx';
import { LQ_UI } from '../../../shared/lienquan/uiText.js';
import { getHighlightGiaoAns } from '../../../shared/lienquan/giaoAns.js';
import { incrementFeatureStat, trackFeatureViewOnce } from '../../lib/featureStats';
import { trackFeatureView } from '../../lib/analytics';
import { fetchMastery } from '../../lib/lienquan/mastery.js';
import { buildLienquanOgImageUrl, buildLienquanShareUrl } from '../../lib/siteUrl';
import './lienquan.css';

export default function LienquanHub() {
  const [mastery, setMastery] = useState(null);
  const highlights = getHighlightGiaoAns();
  const ogImage = buildLienquanOgImageUrl();
  const shareUrl = buildLienquanShareUrl();
  const metaDescription =
    'Tìm counter tướng Liên Quân trong 30 giây, sao chép giáo án pro, làm quiz Thông Thạo trên nambac.';

  useEffect(() => {
    if (trackFeatureViewOnce('lienquan')) {
      trackFeatureView('lienquan');
      incrementFeatureStat('lienquan', 'view').catch(() => {});
    }
    fetchMastery().then(setMastery).catch(() => {});
  }, []);

  return (
    <div className="lienquan-page">
      <Helmet>
        <title>{LQ_UI.hubTitle} | nambac</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href="https://www.nambac.xyz/lienquan" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${LQ_UI.hubTitle} | nambac`} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content={shareUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>

      <Link to="/" className="lq-back">← nambac</Link>

      <SearchBar />

      <header className="lq-hero-block">
        <div className="lq-hero-title-row">
          <h1>{LQ_UI.hubTitle}</h1>
          <MasteryBadgeCard mastery={mastery} variant="inline" />
        </div>
        <p>{LQ_UI.hubSub}</p>
      </header>

      <nav className="lq-nav-chips" aria-label="Liên Quân menu">
        <Link to="/lienquan/giao-an" className="lq-chip">{LQ_UI.tabGiaoAn}</Link>
        <Link to="/lienquan/khoe" className="lq-chip">{LQ_UI.tabKhoe}</Link>
        <Link to="/lienquan/tu-dien" className="lq-chip">{LQ_UI.tabTuDien}</Link>
        <Link to="/lienquan/quiz" className="lq-chip">Thi Thông Thạo</Link>
      </nav>

      <TierStrip />

      <QuizEventBanner />

      {highlights.length > 0 && (
        <section className="lq-hub-highlights">
          <div className="lq-hub-highlights-head">
            <h2 className="lq-section-title">{LQ_UI.hubGiaoAnTitle}</h2>
            <Link to="/lienquan/giao-an" className="lq-text-link">Xem tất cả →</Link>
          </div>
          {highlights.map((ga) => (
            <GiaoAnCard key={ga.id} giaoAn={ga} />
          ))}
        </section>
      )}

      <div className="lq-hub-share">
        <ShareLinkButton page="hub" />
      </div>

      <p className="lq-disclaimer">
        Meta mang tính tham khảo / giải trí. Cập nhật theo cảm nhận cộng đồng — không phải dữ liệu chính thức Garena.
      </p>
    </div>
  );
}
