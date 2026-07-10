import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import './lienquan.css';

/** Phase 2 placeholder */
export default function KhoePage() {
  return (
    <div className="lienquan-page">
      <Helmet>
        <title>Góc Khoe Chiến Tích | Liên Quân nambac</title>
      </Helmet>
      <Link to="/lienquan" className="lq-back">← Liên Quân</Link>
      <header className="lq-hero-block">
        <h1>Góc Khoe</h1>
        <p>Sắp ra mắt — đăng MVP & clip TikTok</p>
      </header>
      <p className="lq-coming">
        Đang mở phòng khoe chiến tích. Quay lại sau nhé — hoặc làm quiz Thông Thạo trước!
      </p>
      <div className="lq-nav-chips">
        <Link to="/lienquan" className="lq-chip">Về hub</Link>
        <Link to="/explore" className="lq-chip">Làm quiz</Link>
      </div>
    </div>
  );
}
