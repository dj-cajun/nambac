import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import SearchBar from './components/SearchBar.jsx';
import TierStrip from './components/TierStrip.jsx';
import QuizEventBanner from './components/QuizEventBanner.jsx';
import { incrementFeatureStat, trackFeatureViewOnce } from '../../lib/featureStats';
import { trackFeatureView } from '../../lib/analytics';
import './lienquan.css';

export default function LienquanHub() {
  useEffect(() => {
    if (trackFeatureViewOnce('lienquan')) {
      trackFeatureView('lienquan');
      incrementFeatureStat('lienquan', 'view').catch(() => {});
    }
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
      </header>

      <SearchBar />

      <nav className="lq-nav-chips" aria-label="Liên Quân menu">
        <Link to="/lienquan/giao-an" className="lq-chip">Giáo Án Pro</Link>
        <Link to="/lienquan/khoe" className="lq-chip">Góc Khoe</Link>
      </nav>

      <TierStrip />

      <QuizEventBanner />

      <p className="lq-disclaimer">
        Meta mang tính tham khảo / giải trí. Cập nhật theo cảm nhận cộng đồng — không phải dữ liệu chính thức Garena.
      </p>
    </div>
  );
}
