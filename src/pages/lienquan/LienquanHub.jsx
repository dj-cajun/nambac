import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import SearchBar from './components/SearchBar.jsx';
import TierStrip from './components/TierStrip.jsx';
import QuizEventBanner from './components/QuizEventBanner.jsx';
import { incrementFeatureStat, trackFeatureViewOnce } from '../../lib/featureStats';
import { trackFeatureView } from '../../lib/analytics';
import { fetchMastery } from '../../lib/lienquan/mastery.js';
import './lienquan.css';

export default function LienquanHub() {
  const [mastery, setMastery] = useState(null);

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
        <title>Liên Quân — Counter & Giáo Án Pro | nambac</title>
        <meta
          name="description"
          content="Tìm counter tướng Liên Quân trong 30 giây, sao chép giáo án pro, làm quiz Thông Thạo trên nambac."
        />
        <link rel="canonical" href="https://www.nambac.xyz/lienquan" />
      </Helmet>

      <Link to="/" className="lq-back">← nambac</Link>

      <header className="lq-hero-block">
        <h1>Liên Quân</h1>
        <p>Tìm counter trong 30 giây · Giáo án pro · Meta AOG</p>
        {mastery && (
          <div className={`lq-mastery-chip${mastery.level >= 7 ? ' gold' : ''}`}>
            Mark: {mastery.label}
          </div>
        )}
      </header>

      <SearchBar />

      <nav className="lq-nav-chips" aria-label="Liên Quân menu">
        <Link to="/lienquan/giao-an" className="lq-chip">Giáo Án Pro</Link>
        <Link to="/lienquan/khoe" className="lq-chip">Góc Khoe</Link>
        <Link to="/lienquan/quiz" className="lq-chip">Thi Thông Thạo</Link>
      </nav>

      <TierStrip />

      <QuizEventBanner />

      <p className="lq-disclaimer">
        Meta mang tính tham khảo / giải trí. Cập nhật theo cảm nhận cộng đồng — không phải dữ liệu chính thức Garena.
      </p>
    </div>
  );
}
