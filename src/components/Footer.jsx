import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <Link to="/" className="footer-logo">
        <img src="/images/logo.png" alt="NamBắc Logo" className="footer-logo-img" />
      </Link>
      <div className="footer-links">
        <Link to="/about" style={{ textDecoration: 'none', color: 'inherit' }}>Giới thiệu</Link>
        <Link to="/brands" style={{ textDecoration: 'none', color: '#FFD700', fontWeight: 'bold' }}>Hợp tác thương hiệu 🎯</Link>
        <Link to="/privacy-policy" style={{ textDecoration: 'none', color: 'inherit' }}>Bảo mật</Link>
        <Link to="/terms-of-service" style={{ textDecoration: 'none', color: 'inherit' }}>Điều khoản</Link>
        <button
          data-tally-open="lbd9N5"
          data-tally-layout="modal"
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            textDecoration: 'none',
            color: 'inherit',
            font: 'inherit',
          }}>
          Hỗ trợ
        </button>
      </div>
      <p className="footer-copy">© 2026 nambac.xyz — Made for Vietnamese Gen Z with love and pixels.</p>
    </footer>
  );
};
export default Footer;
