import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import NambacLogo from './NambacLogo';
import GoogleLoginButton from './GoogleLoginButton';
import { useAuth } from '../context/AuthContext';
import { useDrawer } from './shell/DrawerContext';
import { scrollToTop } from '../lib/scrollToTop';
import { recordDailyVisit } from '../lib/dailyStreak';
import { recordSiteVisit } from '../lib/siteVisit';
import './SiteLogoBar.css';

const POPUP_SESSION_KEY = 'nambac_streak_popup_shown';

export default function SiteLogoBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { toggleDrawer, open } = useDrawer();
  const { user, loading: authLoading, authError, clearAuthError } = useAuth();
  const [streak, setStreak] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    recordSiteVisit({ force: user?.role === 'admin' });
  }, [authLoading, user?.role]);

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
        <Link
          to="/me"
          className="site-streak-badge"
          aria-label={`Điểm danh ngày thứ ${streak} liên tiếp`}
        >
          🔥 {streak}
        </Link>
      )}

      <div className="site-auth-slot">
        {user ? (
          <Link to="/me" className="site-auth-user" title={user.name || user.email || 'Tài khoản'}>
            {user.picture_url ? (
              <img src={user.picture_url} alt="" className="site-auth-avatar" />
            ) : (
              <span className="site-auth-avatar site-auth-avatar--fallback">{(user.name || user.email || '?')[0]}</span>
            )}
          </Link>
        ) : (
          <GoogleLoginButton compact returnTo={pathname} label="Đăng nhập" />
        )}
      </div>

      {showPopup && streak > 0 && (
        <div className="streak-popup" role="status">
          <span className="streak-popup-emoji">🔥</span>
          <div className="streak-popup-text">
            <strong>Ngày thứ {streak} điểm danh!</strong>
            <span>Vào mỗi ngày để giữ chuỗi nhé 💪</span>
          </div>
        </div>
      )}

      {authError && (
        <div className="site-auth-error" role="alert">
          <span>{authError}</span>
          <button type="button" onClick={clearAuthError} aria-label="Đóng thông báo">×</button>
        </div>
      )}
    </header>
  );
}
