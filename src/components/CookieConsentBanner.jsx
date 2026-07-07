import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import {
  getCookieConsent,
  setCookieConsent,
} from '../lib/cookieConsent';
import { loadAdSenseScript } from '../lib/adsConfig';
import './CookieConsentBanner.css';

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!getCookieConsent());
  }, []);

  const acceptAll = () => {
    setCookieConsent('all');
    loadAdSenseScript();
    setVisible(false);
  };

  const essentialOnly = () => {
    setCookieConsent('essential');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="cookie-consent-banner"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-consent-title"
    >
      <div className="cookie-consent-inner">
        <button
          type="button"
          className="cookie-consent-close"
          onClick={essentialOnly}
          aria-label="Chỉ dùng cookie cần thiết"
        >
          <X size={18} />
        </button>

        <h2 id="cookie-consent-title" className="cookie-consent-title">
          Cookie &amp; quyền riêng tư 🍪
        </h2>
        <p className="cookie-consent-text">
          nambac.xyz dùng cookie cần thiết để vận hành trang. Với sự đồng ý của bạn, chúng tôi cũng dùng
          cookie phân tích (Google Analytics, Vercel) và quảng cáo (Google AdSense) để cải thiện trải nghiệm.
        </p>
        <p className="cookie-consent-links">
          <Link to="/cookie-policy" onClick={() => setVisible(false)}>
            Chính sách Cookie
          </Link>
          {' · '}
          <Link to="/privacy-policy" onClick={() => setVisible(false)}>
            Bảo mật
          </Link>
        </p>

        <div className="cookie-consent-actions">
          <button type="button" className="cookie-consent-btn secondary" onClick={essentialOnly}>
            Chỉ cookie cần thiết
          </button>
          <button type="button" className="cookie-consent-btn primary" onClick={acceptAll}>
            Chấp nhận tất cả
          </button>
        </div>
      </div>
    </div>
  );
}
