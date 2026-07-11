import SiteIntroBox from './SiteIntroBox';
import './Footer.css';

export default function Footer({ withBottomNav = false }) {
  return (
    <footer className={`footer${withBottomNav ? ' footer--with-bottom-nav' : ''}`}>
      <SiteIntroBox />
      <p className="footer-contact">
        <a href="mailto:contact@nambac.xyz">contact@nambac.xyz</a>
      </p>
      <p className="footer-copy">
        © 2026 nambac.xyz — Trắc nghiệm AI giải trí cho Gen Z Việt Nam.
      </p>
    </footer>
  );
}
