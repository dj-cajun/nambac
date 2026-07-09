import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, LogOut } from 'lucide-react';
import NambacLogo from './NambacLogo';
import GoogleLoginButton from './GoogleLoginButton';
import { useAuth } from '../context/AuthContext';
import { useDrawer } from './shell/DrawerContext';
import { scrollToTop } from '../lib/scrollToTop';
import { recordDailyVisit } from '../lib/dailyStreak';
import { recordSiteVisit } from '../lib/siteVisit';
import { fetchPlayerGrade } from '../lib/playerGrade';
import './SiteLogoBar.css';

const POPUP_SESSION_KEY = 'nambac_streak_popup_shown';

export default function SiteLogoBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { toggleDrawer, open } = useDrawer();
  const { user, logout } = useAuth();
  const [streak, setStreak] = useState(0);
  const [playerGrade, setPlayerGrade] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const loadGrade = () => {
      fetchPlayerGrade().then((data) => {
        if (data?.grade?.level > 0) setPlayerGrade(data.grade);
      });
    };
    const onGradeUpdated = (event) => {
      if (event.detail?.grade?.level > 0) {
        setPlayerGrade(event.detail.grade);
        return;
      }
      loadGrade();
    };
    loadGrade();
    window.addEventListener('nambac:grade-updated', onGradeUpdated);
    return () => window.removeEventListener('nambac:grade-updated', onGradeUpdated);
  }, [user?.id]);

  useEffect(() => {
    recordSiteVisit();
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
      {playerGrade && (
        <span className="site-grade-badge" aria-label={`Hạng ${playerGrade.label}`}>
          {playerGrade.emoji} {playerGrade.label}
        </span>
      )}

      <div className="site-auth-slot">
        {user ? (
          <button type="button" className="site-auth-user" onClick={logout} title={`${user.email} — 로그아웃`}>
            {user.picture_url ? (
              <img src={user.picture_url} alt="" className="site-auth-avatar" />
            ) : (
              <span className="site-auth-avatar site-auth-avatar--fallback">{(user.name || user.email || '?')[0]}</span>
            )}
            <LogOut size={14} aria-hidden="true" />
          </button>
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
    </header>
  );
}
