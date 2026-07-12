import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GoogleLoginButton from '../components/GoogleLoginButton';
import { getDailyStreak } from '../lib/dailyStreak';
import { fetchPlayerGrade } from '../lib/playerGrade';
import { fetchMastery } from '../lib/lienquan/mastery';
import { readTodayDone } from '../lib/todayDone';
import { scrollToTop } from '../lib/scrollToTop';
import './MePage.css';
import './Home.css';

const TODAY_ITEMS = [
  { id: 'sbti', label: 'VBTI', to: '/vbti' },
  { id: 'lienquan', label: 'Liên Quân', to: '/lienquan' },
  { id: 'roast', label: 'Bóc phốt', to: '/roast-card' },
  { id: 'brain', label: 'Não bạn', to: '/brain' },
  { id: 'balance', label: 'Cân não', to: '/balance' },
  { id: 'fortune', label: 'Tử vi', to: '/fortune' },
  { id: 'quiz', label: 'Quiz', to: '/explore' },
];

export default function MePage() {
  const { user, loading: authLoading, logout } = useAuth();
  const [streak, setStreak] = useState({ streak: 0, best: 0 });
  const [playerGrade, setPlayerGrade] = useState(null);
  const [lqMastery, setLqMastery] = useState(null);
  const [doneToday, setDoneToday] = useState(() => readTodayDone());

  useEffect(() => {
    scrollToTop();
    setStreak(getDailyStreak());
    setDoneToday(readTodayDone());
    fetchPlayerGrade().then((data) => {
      if (data?.grade?.level > 0) setPlayerGrade(data.grade);
    });
    fetchMastery().then(setLqMastery).catch(() => {});
  }, [user?.id]);

  useEffect(() => {
    const refresh = () => setDoneToday(readTodayDone());
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const doneCount = TODAY_ITEMS.filter((item) => doneToday.has(item.id)).length;

  return (
    <div className="home-container me-page">
      <Helmet>
        <title>Tài khoản — nambac.xyz</title>
        <meta name="description" content="Streak, hạng, VBTI & game của bạn trên nambac.xyz" />
      </Helmet>

      <section className="me-card me-profile">
        {authLoading ? (
          <p className="me-loading">Đang tải...</p>
        ) : user ? (
          <>
            <div className="me-profile-row">
              {user.picture_url ? (
                <img src={user.picture_url} alt="" className="me-avatar" />
              ) : (
                <span className="me-avatar me-avatar--fallback">
                  {(user.name || user.email || '?')[0]}
                </span>
              )}
              <div className="me-profile-text">
                <h1 className="me-name">{user.name || 'Bạn'}</h1>
                <p className="me-email">{user.email}</p>
              </div>
            </div>
            <button type="button" className="me-logout-btn" onClick={handleLogout}>
              <LogOut size={16} aria-hidden />
              Đăng xuất
            </button>
          </>
        ) : (
          <div className="me-guest">
            <h1 className="me-name">Tài khoản của tôi</h1>
            <p className="me-guest-hint">Đăng nhập để lưu tiến độ trên nhiều máy</p>
            <GoogleLoginButton returnTo="/me" label="Đăng nhập Google" />
          </div>
        )}
      </section>

      <section className="me-card me-stats" aria-label="Thống kê">
        <h2 className="me-section-title">Tiến độ</h2>
        <div className="me-stat-grid">
          <div className="me-stat">
            <span className="me-stat-value">🔥 {streak.streak || 0}</span>
            <span className="me-stat-label">Chuỗi ngày</span>
            {streak.best > 0 && (
              <span className="me-stat-meta">Best {streak.best}</span>
            )}
          </div>
          <div className="me-stat">
            <span className="me-stat-value">
              {playerGrade ? `${playerGrade.emoji} ${playerGrade.label}` : '—'}
            </span>
            <span className="me-stat-label">Hạng quiz</span>
          </div>
          <div className="me-stat">
            <span className="me-stat-value">
              {lqMastery?.level > 0 ? `⚔️ TT${lqMastery.level}` : '—'}
            </span>
            <span className="me-stat-label">Liên Quân</span>
            {lqMastery?.label && (
              <span className="me-stat-meta">{lqMastery.label}</span>
            )}
          </div>
        </div>
      </section>

      <section className="me-card" aria-label="Hôm nay">
        <div className="me-section-head">
          <h2 className="me-section-title">Hôm nay</h2>
          <span className="me-done-count">{doneCount}/{TODAY_ITEMS.length}</span>
        </div>
        <ul className="me-today-list">
          {TODAY_ITEMS.map((item) => {
            const done = doneToday.has(item.id);
            return (
              <li key={item.id}>
                <Link to={item.to} className={`me-today-item${done ? ' is-done' : ''}`}>
                  <span className="me-today-check" aria-hidden>{done ? '✓' : '○'}</span>
                  <span>{item.label}</span>
                  <span className="me-today-go">{done ? 'Đã chơi' : 'Chơi →'}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="me-card me-shortcuts" aria-label="Chơi nhanh">
        <h2 className="me-section-title">Chơi nhanh</h2>
        <div className="me-shortcut-grid">
          <Link to="/vbti" className="me-shortcut">🎭 VBTI</Link>
          <Link to="/lienquan" className="me-shortcut">⚔️ Liên Quân</Link>
          <Link to="/fortune" className="me-shortcut">✨ Tử vi</Link>
          <Link to="/explore" className="me-shortcut">🧭 Khám phá</Link>
          <Link to="/leaderboard" className="me-shortcut">🏆 BXH</Link>
        </div>
      </section>
    </div>
  );
}
