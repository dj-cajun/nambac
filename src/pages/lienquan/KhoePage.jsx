import { useCallback, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { HEROES } from '../../../shared/lienquan/heroes.js';
import { getHeroPortraitPath } from '../../../shared/lienquan/heroImage.js';
import { LQ_UI } from '../../../shared/lienquan/uiText.js';
import { createBoast, fetchBoasts, likeBoast, uploadKhoeImage } from '../../lib/lienquan/boastApi.js';
import { useAuth } from '../../context/AuthContext';
import GoogleLoginButton from '../../components/GoogleLoginButton';
import KhoeMasonry from './components/KhoeMasonry.jsx';
import KhoePinModal from './components/KhoePinModal.jsx';
import ShareLinkButton from './components/ShareLinkButton.jsx';
import { buildLienquanOgImageUrl, buildLienquanShareUrl } from '../../lib/siteUrl';
import './lienquan.css';

const PAGE_SIZE = 12;

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      const comma = dataUrl.indexOf(',');
      resolve(comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl);
    };
    reader.onerror = () => reject(new Error('Không đọc được ảnh'));
    reader.readAsDataURL(file);
  });
}

function resolvePinImage(boast) {
  return boast.image_url
    || getHeroPortraitPath(boast.hero_id)
    || '/images/lienquan/hub-thumb.svg';
}

function KhoePinCard({ boast, onOpen, onAspect }) {
  const pinSrc = resolvePinImage(boast);

  return (
    <button
      type="button"
      className="lq-pin-card lq-pin-thumb"
      onClick={() => onOpen(boast)}
      aria-label={boast.caption || 'Xem chiến tích'}
    >
      <img
        src={pinSrc}
        alt=""
        className="lq-pin-img"
        loading="lazy"
        onLoad={(e) => {
          const img = e.currentTarget;
          if (img.naturalWidth > 0 && img.naturalHeight > 0) {
            onAspect?.(boast.id, img.naturalWidth / img.naturalHeight);
          }
        }}
        onError={(e) => {
          const fallback = getHeroPortraitPath(boast.hero_id) || '/images/lienquan/hub-thumb.svg';
          if (fallback && !e.currentTarget.src.endsWith(fallback)) {
            e.currentTarget.src = fallback;
          }
        }}
      />
      {boast.tiktok_url ? (
        <span className="lq-pin-thumb-badge" aria-hidden="true">▶</span>
      ) : null}
    </button>
  );
}

export default function KhoePage() {
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const [boasts, setBoasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const sentinelRef = useRef(null);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [caption, setCaption] = useState('');
  const [heroId, setHeroId] = useState('florentino');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activePin, setActivePin] = useState(null);
  const ogImage = buildLienquanOgImageUrl({
    title: 'Góc Khoe Chiến Tích',
    subtitle: 'MVP · clip · cộng đồng Liên Quân',
  });
  const shareUrl = buildLienquanShareUrl({ page: 'khoe' });
  const metaDescription = 'Khoe MVP, quadra, clip TikTok Liên Quân — cộng đồng nambac.';

  const load = useCallback(async ({ append = false, nextOffset = 0 } = {}) => {
    if (!isLoggedIn) return;
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
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) {
      setBoasts([]);
      setLoading(false);
      setHasMore(false);
      setOffset(0);
      return;
    }
    load();
  }, [isLoggedIn, load]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Chỉ chọn file ảnh (JPG, PNG, …)');
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      setError('Ảnh tối đa 6MB');
      return;
    }
    setError('');
    setImageFile(file);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return '';
    });
  };

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore || loading || loadingMore || !isLoggedIn) return undefined;
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
  }, [hasMore, loading, loadingMore, load, offset, isLoggedIn]);

  const onLike = async (id) => {
    if (!isLoggedIn) return;
    try {
      const result = await likeBoast(id);
      const patch = (b) =>
        b.id === id
          ? {
              ...b,
              liked: true,
              like_count:
                result.like_count == null ? (b.like_count || 0) + (b.liked ? 0 : 1) : result.like_count,
            }
          : b;
      setBoasts((prev) => prev.map(patch));
      setActivePin((prev) => (prev?.id === id ? patch(prev) : prev));
    } catch (err) {
      setError(err.message || 'Không thích được bài');
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) return;
    setSubmitting(true);
    setError('');
    try {
      let uploadedImageUrl = '';
      if (imageFile) {
        const data = await fileToBase64(imageFile);
        const uploaded = await uploadKhoeImage(data);
        uploadedImageUrl = uploaded.imageUrl || '';
      }

      const { boast } = await createBoast({
        caption,
        heroId,
        tiktokUrl,
        imageUrl: uploadedImageUrl,
        displayName: user?.name || user?.email || 'Player',
      });
      setBoasts((prev) => [boast, ...prev.filter((b) => !b.seed)]);
      setCaption('');
      setTiktokUrl('');
      clearImage();
      setFormOpen(false);
    } catch (err) {
      setError(err.message || 'Đăng bài thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const pageShell = (children) => (
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

      {children}
    </div>
  );

  if (authLoading) {
    return pageShell(<p className="lq-coming">Đang kiểm tra đăng nhập…</p>);
  }

  if (!isLoggedIn) {
    return pageShell(
      <section className="lq-detail-card lq-khoe-login-gate" aria-labelledby="lq-khoe-login-title">
        <h2 id="lq-khoe-login-title" className="lq-khoe-login-gate-title">
          {LQ_UI.khoeLoginGateTitle}
        </h2>
        <p className="lq-khoe-login-gate-desc">{LQ_UI.khoeLoginHint}</p>
        <ul className="lq-khoe-login-gate-list">
          <li>Xem feed MVP · clip cộng đồng</li>
          <li>Đăng chiến tích + link TikTok</li>
          <li>Thả 🔥 cho bài hay</li>
        </ul>
        <GoogleLoginButton returnTo="/lienquan/khoe" label="Đăng nhập Google" />
      </section>,
    );
  }

  return pageShell(
    <>
      {formOpen && (
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
          <label className="lq-search-label" htmlFor="khoe-img-file">{LQ_UI.khoeImageLabel}</label>
          <p className="lq-khoe-image-hint">{LQ_UI.khoeImageHint}</p>
          <input
            id="khoe-img-file"
            className="lq-khoe-file"
            type="file"
            accept="image/*"
            onChange={onPickImage}
          />
          {imagePreview ? (
            <div className="lq-khoe-preview-wrap">
              <img src={imagePreview} alt="" className="lq-khoe-preview" />
              <button type="button" className="lq-khoe-preview-clear" onClick={clearImage}>
                Xóa ảnh
              </button>
            </div>
          ) : null}
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

      <KhoeMasonry
        items={boasts}
        renderItem={(b, registerAspect) => (
          <KhoePinCard
            key={b.id}
            boast={b}
            onOpen={setActivePin}
            onAspect={registerAspect}
          />
        )}
      />

      <KhoePinModal
        boast={activePin}
        onClose={() => setActivePin(null)}
        onLike={onLike}
      />

      {loadingMore && <p className="lq-coming">Đang tải thêm…</p>}
      {hasMore && <div ref={sentinelRef} className="lq-khoe-sentinel" aria-hidden="true" />}

      <button
        type="button"
        className={`lq-khoe-fab${formOpen ? ' is-open' : ''}`}
        onClick={() => setFormOpen((v) => !v)}
        aria-label={formOpen ? LQ_UI.khoeUploadClose : LQ_UI.khoeUploadCta}
        title={formOpen ? LQ_UI.khoeUploadClose : LQ_UI.khoeUploadCta}
      >
        {formOpen ? '✕' : '+'}
      </button>

      <div className="lq-nav-chips">
        <ShareLinkButton page="khoe" className="lq-chip lq-chip-btn" />
      </div>
    </>,
  );
}
