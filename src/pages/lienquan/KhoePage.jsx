import { useCallback, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { HEROES, getHero } from '../../../shared/lienquan/heroes.js';
import { getHeroPortraitPath } from '../../../shared/lienquan/heroImage.js';
import { LQ_UI } from '../../../shared/lienquan/uiText.js';
import { createBoast, fetchBoasts, likeBoast } from '../../lib/lienquan/boastApi.js';
import { useAuth } from '../../context/AuthContext';
import GoogleLoginButton from '../../components/GoogleLoginButton';
import HeroIcon from './components/HeroIcon.jsx';
import ShareLinkButton from './components/ShareLinkButton.jsx';
import { buildLienquanOgImageUrl, buildLienquanShareUrl } from '../../lib/siteUrl';
import './lienquan.css';

const PAGE_SIZE = 12;

export default function KhoePage() {
  const { user, isLoggedIn } = useAuth();
  const [boasts, setBoasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const sentinelRef = useRef(null);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [caption, setCaption] = useState('');
  const [heroId, setHeroId] = useState('florentino');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const ogImage = buildLienquanOgImageUrl({
    title: 'Góc Khoe Chiến Tích',
    subtitle: 'MVP · clip · cộng đồng Liên Quân',
  });
  const shareUrl = buildLienquanShareUrl({ page: 'khoe' });
  const metaDescription = 'Khoe MVP, quadra, clip TikTok Liên Quân — cộng đồng nambac.';

  const load = useCallback(async ({ append = false, nextOffset = 0 } = {}) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError('');
    try {
      const data = await fetchBoasts({ limit: PAGE_SIZE, offset: nextOffset });
      const rows = data.boasts || [];
      setBoasts((prev) => (append ? [...prev, ...rows] : rows));
      setOffset(nextOffset + rows.length);
      setHasMore(rows.length === PAGE_SIZE);
    } catch (err) {
      setError(err.message || 'Không tải được feed');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore || loading || loadingMore) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          load({ append: true, nextOffset: offset });
        }
      },
      { rootMargin: '120px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, load, offset]);

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
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href="https://www.nambac.xyz/lienquan/khoe" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Góc Khoe Chiến Tích | Liên Quân" />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content={shareUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>

      <Link to="/lienquan" className="lq-back">← Liên Quân</Link>

      <header className="lq-hero-block">
        <h1>Góc Khoe</h1>
        <p>{LQ_UI.khoeSub}</p>
      </header>

      <div className="lq-khoe-toolbar">
        {isLoggedIn ? (
          <button type="button" className="lq-copy-btn" onClick={() => setFormOpen((v) => !v)}>
            {formOpen ? LQ_UI.khoeUploadClose : LQ_UI.khoeUploadCta}
          </button>
        ) : (
          <div className="lq-khoe-login">
            <span>{LQ_UI.khoeLoginHint}</span>
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
            placeholder={LQ_UI.khoeCaptionPlaceholder}
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
      {!loading && boasts.length === 0 && (
        <p className="lq-tip">{LQ_UI.khoeEmptyHint}</p>
      )}

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
                <img
                  src={b.image_url}
                  alt=""
                  className="lq-khoe-img"
                  loading="lazy"
                  onError={(e) => {
                    const fallback = getHeroPortraitPath(b.hero_id);
                    if (fallback && !e.currentTarget.src.endsWith(fallback)) {
                      e.currentTarget.src = fallback;
                      return;
                    }
                    e.currentTarget.style.display = 'none';
                  }}
                />
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

      {loadingMore && <p className="lq-coming">Đang tải thêm…</p>}
      {hasMore && <div ref={sentinelRef} className="lq-khoe-sentinel" aria-hidden="true" />}

      <div className="lq-nav-chips">
        <ShareLinkButton page="khoe" className="lq-chip lq-chip-btn" />
      </div>
    </div>
  );
}
