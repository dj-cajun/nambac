import { useNavigate, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import NambacLogo from './NambacLogo';
import { useDrawer } from './shell/DrawerContext';
import { scrollToTop } from '../lib/scrollToTop';
import './SiteLogoBar.css';

export default function SiteLogoBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { toggleDrawer, open } = useDrawer();

  return (
    <header className="site-logo-bar">
      <button
        type="button"
        className="site-menu-btn"
        aria-label="Mở menu"
        aria-expanded={open}
        aria-controls="sidebar-drawer"
        onClick={toggleDrawer}
      >
        <Menu size={24} strokeWidth={2.25} />
      </button>
      <button type="button" className="site-logo-btn" onClick={() => { scrollToTop(); if (pathname !== '/') navigate('/'); }} aria-label="NamBắc Trang chủ">
        <NambacLogo />
      </button>
    </header>
  );
}
