import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import NambacLogo from './NambacLogo';
import { useDrawer } from './shell/DrawerContext';
import { scrollToTop } from '../lib/scrollToTop';
import { recordDailyVisit } from '../lib/dailyStreak';
import './SiteLogoBar.css';

const POPUP_SESSION_KEY = 'nambac_streak_popup_shown';

export default function SiteLogoBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { toggleDrawer, open } = useDrawer();
  const [streak, setStreak] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const { streak: current } = recordDailyVisit();
    setStreak(current);
    if (current <= 0) return undefined;

    let shownThisSession = false;
    try {
      shownThisSession = Boolean(sessionStorage.getItem(POPUP_SESSION_KEY));
    } catch {
      /* private mode */
    }
    if (shownThisSession) return undefined;

    try {
      sessionStorage.setItem(POPUP_SESSION_KEY, '1');
    } catch {
      /* private mode */
    }
    setShowPopup(true);
    const timer = setTimeout(() => setShowPopup(false), 3200);
    return () => clearTimeout(timer);
  }, []);

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
        <Menu size={16} strokeWidth={2.25} />
      </button>
      <button type="button" className="site-logo-btn" onClick={() => { scrollToTop(); if (pathname !== '/') navigate('/'); }} aria-label="NamBắc Trang chủ">
        <NambacLogo />
      </button>
      {streak > 0 && (
        <span className="site-streak-badge" aria-label={`Điểm danh ngày thứ ${streak} liên tiếp`}>
          🔥 Ngày {streak}
        </span>
      )}

      {showPopup && streak > 0 && (
        <div className="streak-popup" role="status">
          <span className="streak-popup-emoji">🔥</span>
          <div className="streak-popup-text">
            <strong>Ngày thứ {streak} điểm danh!</strong>
            <span>Vào mỗi ngày để giữ chuỗi nhé 💪</span>
          </div>
        </div>
      )}
    </header>
  );
}
