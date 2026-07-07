import { useNavigate } from 'react-router-dom';
import './SiteLogoBar.css';

/** Top logo only — rendered once from App.jsx */
export default function SiteLogoBar() {
  const navigate = useNavigate();

  return (
    <header className="site-logo-bar">
      <button type="button" className="site-logo-btn" onClick={() => navigate('/')} aria-label="NamBắc Trang chủ">
        <NambacLogo />
      </button>
    </header>
  );
}
