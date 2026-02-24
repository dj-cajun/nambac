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
        <span>Help</span>
      </div>
      <p className="footer-copy">© 2026 Nambac Cloud Mascot & Co. Made for Vietnamese Gen Z with love and pixels.</p>
    </footer>
  );
};
export default Footer;
