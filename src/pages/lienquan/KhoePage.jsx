import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { HEROES, getHero } from '../../../shared/lienquan/heroes.js';
import { createBoast, fetchBoasts, likeBoast } from '../../lib/lienquan/boastApi.js';
import { useAuth } from '../../context/AuthContext';
import GoogleLoginButton from '../../components/GoogleLoginButton';
import HeroIcon from './components/HeroIcon.jsx';
import './lienquan.css';

export default function KhoePage() {
  const { user, isLoggedIn } = useAuth();
  const [boasts, setBoasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [caption, setCaption] = useState('');
  const [heroId, setHeroId] = useState('florentino');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchBoasts({ limit: 40 });
      setBoasts(data.boasts || []);
    } catch (err) {
      setError(err.message || 'Không tải được feed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onLike = async (id) => {
    try {
      const result = await likeBoast(id);
      setBoasts((prev) =>
        prev.map((b) =>
          b.id === id
            ? {
                ...b,
                liked: true,
                like_count:
                  result.like_count == null ? (b.like_count || 0) + (b.liked ? 0 : 1) : result.like_count,
              }
            : b,
        ),
      );
    } catch {
      /* ignore */
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) return;
    setSubmitting(true);
    setError('');
    try {
      const { boast } = await createBoast({
        caption,
        heroId,
        tiktokUrl,
        imageUrl,
        displayName: user?.name || user?.email || 'Player',
      });
      setBoasts((prev) => [boast, ...prev.filter((b) => !b.seed)]);
      setCaption('');
      setTiktokUrl('');
      setImageUrl('');
      setFormOpen(false);
    } catch (err) {
      setError(err.message || 'Đăng bài thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="lienquan-page">
      <Helmet>
        <title>Góc Khoe Chiến Tích | Liên Quân nambac</title>
        <meta name="description" content="Khoe MVP, quadra, clip TikTok Liên Quân — cộng đồng nambac." />
      </Helmet>

      <Link to="/lienquan" className="lq-back">← Liên Quân</Link>

      <header className="lq-hero-block">
        <h1>Góc Khoe</h1>
        <p>Đăng MVP · clip TikTok · thả 🔥</p>
      </header>

      <div className="lq-khoe-toolbar">
        {isLoggedIn ? (
          <button type="button" className="lq-copy-btn" onClick={() => setFormOpen((v) => !v)}>
            {formOpen ? 'Đóng form' : '+ Đăng chiến tích'}
          </button>
        ) : (
          <div className="lq-khoe-login">
            <span>Đăng nhập Google để đăng bài</span>
            <GoogleLoginButton returnTo="/lienquan/khoe" label="Đăng nhập" />
          </div>
        )}
      </div>

      {formOpen && isLoggedIn && (
        <form className="lq-detail-card lq-khoe-form" onSubmit={onSubmit}>
          <label className="lq-search-label" htmlFor="khoe-caption">Caption</label>
          <textarea
            id="khoe-caption"
            className="lq-khoe-textarea"
            rows={3}
            maxLength={280}
            required
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Hôm nay Flo quadra hard carry…"
          />
          <label className="lq-search-label" htmlFor="khoe-hero">Tướng</label>
          <select
            id="khoe-hero"
            className="lq-khoe-select"
            value={heroId}
            onChange={(e) => setHeroId(e.target.value)}
          >
            {HEROES.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
          <label className="lq-search-label" htmlFor="khoe-tiktok">TikTok (https, tùy chọn)</label>
          <input
            id="khoe-tiktok"
            className="lq-search-input"
            type="url"
            value={tiktokUrl}
            onChange={(e) => setTiktokUrl(e.target.value)}
            placeholder="https://www.tiktok.com/…"
          />
          <label className="lq-search-label" htmlFor="khoe-img">Ảnh HTTPS (tùy chọn)</label>
          <input
            id="khoe-img"
            className="lq-search-input"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://…"
          />
          <button type="submit" className="lq-copy-btn" disabled={submitting}>
            {submitting ? 'Đang đăng…' : 'Đăng bài'}
          </button>
        </form>
      )}

      {error && <p className="lq-khoe-error">{error}</p>}
      {loading && <p className="lq-coming">Đang tải feed…</p>}

      <div className="lq-khoe-feed">
        {boasts.map((b) => {
          const hero = getHero(b.hero_id);
          return (
            <article key={b.id} className="lq-khoe-card">
              <div className="lq-khoe-card-top">
                {hero && <HeroIcon hero={hero} size="sm" />}
                <div>
                  <strong>{b.display_name}</strong>
                  <span className="lq-khoe-hero-tag">{hero?.name || b.hero_id || 'Liên Quân'}</span>
                </div>
              </div>
              <p className="lq-khoe-caption">{b.caption}</p>
              {b.image_url ? (
                <img src={b.image_url} alt="" className="lq-khoe-img" loading="lazy" />
              ) : null}
              {b.tiktok_url ? (
                <a href={b.tiktok_url} target="_blank" rel="noopener noreferrer" className="lq-text-link">
                  Xem trên TikTok →
                </a>
              ) : null}
              <button
                type="button"
                className={`lq-like-btn${b.liked ? ' on' : ''}`}
                onClick={() => onLike(b.id)}
                disabled={b.liked}
              >
                🔥 {b.like_count || 0}
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
