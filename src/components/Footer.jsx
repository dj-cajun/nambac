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
        <span>About</span>
        <Link to="/privacy-policy" style={{ textDecoration: 'none', color: 'inherit' }}>Privacy</Link>
        <Link to="/terms-of-service" style={{ textDecoration: 'none', color: 'inherit' }}>Terms</Link>
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
            font: 'inherit'
          }}>
          Help
        </button>
      </div>
      <p className="footer-copy">© 2026 Nambac Cloud Mascot & Co. Made for Vietnamese Gen Z with love and pixels.</p>
    </footer>
  );
};
export default Footer;
