import { useState, useEffect, useMemo } from 'react';
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
import { pickDailyBalanceQuestion } from '../../shared/dailyPicks.js';
import './MePage.css';
import './Home.css';

function buildTodayItems(todayBalance) {
  return [
    { id: 'sbti', label: 'VBTI', to: '/vbti', emoji: '🎭' },
    { id: 'lienquan', label: 'Liên Quân', to: '/lienquan', emoji: '⚔️' },
    { id: 'roast', label: 'Bóc phốt', to: '/roast-card', emoji: '💳' },
    { id: 'brain', label: 'Não bạn', to: '/brain', emoji: '🧠' },
    { id: 'balance', label: 'Cân não', to: `/balance/${todayBalance.id}`, emoji: todayBalance.emoji || '⚖️' },
    { id: 'fortune', label: 'Tử vi', to: '/fortune', emoji: '✨' },
    { id: 'quiz', label: 'Quiz', to: '/explore', emoji: '🎯' },
  ];
}

export default function MePage() {
  const { user, loading: authLoading, logout, authError, clearAuthError } = useAuth();
  const [streak, setStreak] = useState({ streak: 0, best: 0 });
  const [playerGradeData, setPlayerGradeData] = useState(null);
  const [lqMastery, setLqMastery] = useState(null);
  const [doneToday, setDoneToday] = useState(() => readTodayDone());
  const todayBalance = useMemo(() => pickDailyBalanceQuestion(), []);
  const todayItems = useMemo(() => buildTodayItems(todayBalance), [todayBalance]);

  useEffect(() => {
    scrollToTop();
    setStreak(getDailyStreak());
    setDoneToday(readTodayDone());
    fetchPlayerGrade().then((data) => {
      if (data?.grade) setPlayerGradeData(data);
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

  const doneCount = todayItems.filter((item) => doneToday.has(item.id)).length;
  const todayProgress = Math.round((doneCount / todayItems.length) * 100);
  const nextTodayItem = todayItems.find((item) => !doneToday.has(item.id)) || null;
  const playerGrade = playerGradeData?.grade?.level > 0 ? playerGradeData.grade : null;
  const uniqueQuizzes = playerGradeData?.uniqueQuizzes || 0;
  const nextGrade = playerGradeData?.nextGrade;
  const gradeProgress = playerGradeData?.progressPercent || 0;

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
            <p className="me-guest-hint">
              Đăng nhập để giữ hạng quiz và tiến độ game khi đổi máy.
            </p>
            {authError && (
              <div className="me-auth-error" role="alert">
                <span>{authError}</span>
                <button type="button" onClick={clearAuthError}>Đóng</button>
              </div>
            )}
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
            <span className="me-stat-meta">
              {uniqueQuizzes > 0 ? `${uniqueQuizzes} quiz` : 'Chưa chơi quiz'}
            </span>
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
        <div className="me-grade-progress" aria-label="Tiến độ hạng quiz">
          <div className="me-grade-progress-head">
            <span>{nextGrade ? `Còn ${nextGrade.remaining} quiz` : 'Đã max hạng'}</span>
            <span>{nextGrade ? `${nextGrade.emoji} ${nextGrade.label}` : 'Huyền thoại'}</span>
          </div>
          <div className="me-progress-track" aria-hidden="true">
            <span style={{ width: `${gradeProgress}%` }} />
          </div>
        </div>
      </section>

      <section className="me-card" aria-label="Hôm nay">
        <div className="me-section-head">
          <h2 className="me-section-title">Hôm nay</h2>
          <span className="me-done-count">{doneCount}/{todayItems.length}</span>
        </div>
        <div className="me-today-progress" aria-label={`Đã hoàn thành ${doneCount} trên ${todayItems.length}`}>
          <div className="me-progress-track" aria-hidden="true">
            <span style={{ width: `${todayProgress}%` }} />
          </div>
          <p>{doneCount === todayItems.length ? 'Full combo hôm nay rồi.' : 'Làm thêm một mục để giữ nhịp chơi.'}</p>
        </div>
        <ul className="me-today-list">
          {todayItems.map((item) => {
            const done = doneToday.has(item.id);
            return (
              <li key={item.id}>
                <Link to={item.to} className={`me-today-item${done ? ' is-done' : ''}`}>
                  <span className="me-today-check" aria-hidden>{done ? '✓' : '○'}</span>
                  <span>{item.emoji} {item.label}</span>
                  <span className="me-today-go">{done ? 'Đã chơi' : 'Chơi →'}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="me-card me-shortcuts" aria-label="Chơi nhanh">
        <h2 className="me-section-title">Tiếp tục</h2>
        <Link
          to={nextTodayItem?.to || '/explore'}
          className="me-continue-primary"
        >
          <span>{nextTodayItem ? `${nextTodayItem.emoji} ${nextTodayItem.label}` : '🧭 Khám phá thêm'}</span>
          <strong>{nextTodayItem ? 'Chơi mục tiếp theo →' : 'Tìm trò mới →'}</strong>
        </Link>
        <div className="me-shortcut-grid">
          {todayItems.filter((item) => !doneToday.has(item.id)).slice(0, 4).map((item) => (
            <Link key={item.id} to={item.to} className="me-shortcut">
              {item.emoji} {item.label}
            </Link>
          ))}
          <Link to="/leaderboard" className="me-shortcut">🏆 BXH</Link>
        </div>
      </section>
    </div>
  );
}
