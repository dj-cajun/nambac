import { Link } from 'react-router-dom';
import './Footer.css';

const FOOTER_LINKS = [
  { to: '/about', label: 'Giới thiệu' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Liên hệ' },
  { to: '/privacy-policy', label: 'Bảo mật' },
  { to: '/cookie-policy', label: 'Cookie' },
  { to: '/terms-of-service', label: 'Điều khoản' },
  { to: '/editorial-policy', label: 'Biên tập' },
  { to: '/blog', label: 'Insights' },
];

export default function Footer({ withBottomNav = false }) {
  return (
    <footer className={`footer${withBottomNav ? ' footer--with-bottom-nav' : ''}`}>
      <nav className="footer-nav" aria-label="Liên kết pháp lý và thông tin">
        {FOOTER_LINKS.map((item, i) => (
          <span key={item.to} className="footer-nav-item">
            {i > 0 && <span className="footer-nav-sep" aria-hidden="true">·</span>}
            <Link to={item.to}>{item.label}</Link>
          </span>
        ))}
      </nav>
      <p className="footer-contact">
        <a href="mailto:contact@nambac.xyz">contact@nambac.xyz</a>
      </p>
      <p className="footer-copy">
        © 2026 nambac.xyz — Trắc nghiệm AI giải trí cho Gen Z Việt Nam.
      </p>
    </footer>
  );
}
