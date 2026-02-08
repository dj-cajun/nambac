import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <Link to="/" className="footer-logo" style={{ textDecoration: 'none', color: 'inherit' }}>
        <span className="footer-icon">☁️</span> nambac.xyz
      </Link>
      <div className="footer-links">
        <span>About</span>
        <span>Privacy</span>
        <span>Terms</span>
        <span>Help</span>
      </div>
      <p className="footer-copy">© 2026 Nambac Cloud Mascot & Co. Made for Vietnamese Gen Z with love and pixels.</p>
    </footer>
  );
};
export default Footer;
