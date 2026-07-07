import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <nav className="footer-nav" aria-label="Liên kết phụ">
      <Link to="/blog">Insights</Link>
      <span aria-hidden="true">·</span>
      <Link to="/about">Giới thiệu</Link>
      <span aria-hidden="true">·</span>
      <Link to="/contact">Liên hệ</Link>
    </nav>
    <p className="footer-copy">© 2026 nambac.xyz — Made for Vietnamese Gen Z with love and pixels.</p>
  </footer>
);

export default Footer;
