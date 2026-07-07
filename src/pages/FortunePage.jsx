import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Download, Share2, Heart } from 'lucide-react';
import html2canvas from 'html2canvas';
import {
  calculateTodayFortune,
  buildFortuneShareUrl,
  buildFortuneResultTitle,
  formatFortuneDateLong,
  formatFortuneDateShort,
  getDateStr,
  parseFortuneShareParams,
} from '../../shared/fortuneEngine.js';
import { FORTUNE_BRAND } from '../../shared/fortuneMeta.js';
import { fetchFortuneSceneImage, fetchFortuneStats, incrementFortuneStat } from '../lib/fortuneApi.js';
import { trackFortuneViewOnce, trackFortuneLikeOnce, hasFortuneLikedThisSession } from '../lib/fortuneStats.js';
import { copyShareLinkWithFeedback } from '../lib/copyShareLink.js';
import { buildFortuneOgImageUrl } from '../lib/siteUrl.js';
import CopyToast from '../components/CopyToast.jsx';
import { useCopyToast } from '../hooks/useCopyToast.js';
import TarotFortuneWheel from '../components/contents/TarotFortuneWheel.jsx';
import './FortunePage.css';
import './Result.css';

const NAME_KEY = 'nambac_fortune_name';

export default function FortunePage() {
  const cardRef = useRef(null);
  const [searchParams] = useSearchParams();
  const friendShare = parseFortuneShareParams(searchParams);
  const { toast, showToast } = useCopyToast();

  const [name, setName] = useState(() => {
    try {
      return localStorage.getItem(NAME_KEY) || friendShare?.friendName || '';
    } catch {
      return friendShare?.friendName || '';
    }
  });
  const [phase, setPhase] = useState('form'); // form | ritual | done
  const [showActions, setShowActions] = useState(false);
  const [result, setResult] = useState(null);
  const [imageSrc, setImageSrc] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [liked, setLiked] = useState(() => hasFortuneLikedThisSession());
  const [likeCount, setLikeCount] = useState(0);

  const pageDateLabel = friendShare?.dateLabel || getDateStr();
  const introDateLabel = formatFortuneDateLong(pageDateLabel);
  const todayLabel = result?.dateLabel
    ? formatFortuneDateLong(result.dateLabel)
    : introDateLabel;

  const handleReveal = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      localStorage.setItem(NAME_KEY, trimmed);
    } catch {
      /* private mode */
    }
    const calc = calculateTodayFortune(trimmed);
    setResult(calc);
    setImageSrc('');
    setImageError(false);
    setShowActions(false);
    setPhase('ritual');
  };

  const handleRitualComplete = () => {
    setPhase('done');
    setShowActions(true);
  };

  const handleRetry = () => {
    setPhase('form');
    setShowActions(false);
    setResult(null);
    setImageSrc('');
    setImageError(false);
  };

  useEffect(() => {
    fetchFortuneStats().then((s) => setLikeCount(s.like_count || 0)).catch(() => {});
    if (!trackFortuneViewOnce()) return;
    incrementFortuneStat('view')
      .then((data) => {
        if (typeof data.like_count === 'number') setLikeCount(data.like_count);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if ((phase !== 'ritual' && phase !== 'done') || !result) return undefined;

    let cancelled = false;
    setImageLoading(true);
    setImageError(false);

    fetchFortuneSceneImage({
      fortuneIndex: result.fortuneIndex,
      dateLabel: result.dateLabel,
    })
      .then(({ src }) => {
        if (!cancelled) setImageSrc(src);
      })
      .catch(() => {
        if (!cancelled) setImageError(true);
      })
      .finally(() => {
        if (!cancelled) setImageLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [phase, result]);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.download = `nambac-fortune-${result?.name || 'today'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      alert('Có lỗi khi tải ảnh — thử chụp màn hình nhé!');
    }
  };

  const handleShareLink = async () => {
    if (!result) return;
    const url = buildFortuneShareUrl(result.name, result.fortuneIndex, result.dateLabel);
    const ok = await copyShareLinkWithFeedback(url, showToast);
    if (ok) {
      incrementFortuneStat('share').catch(console.error);
    }
  };

  const handleLike = async () => {
    if (liked || !trackFortuneLikeOnce()) return;
    setLiked(true);
    setLikeCount((n) => n + 1);
    try {
      const data = await incrementFortuneStat('like');
      if (typeof data.like_count === 'number') setLikeCount(data.like_count);
    } catch {
      setLiked(false);
      setLikeCount((n) => Math.max(0, n - 1));
    }
  };

  const fortune = result?.fortune;
  const resultTitle = result && fortune
    ? buildFortuneResultTitle({ name: result.name, fortune, dateLabel: result.dateLabel })
    : null;
  const ogImageUrl = result
    ? buildFortuneOgImageUrl(result.name, result.fortuneIndex, result.dateLabel)
    : null;
  const sharePageUrl = result
    ? buildFortuneShareUrl(result.name, result.fortuneIndex, result.dateLabel)
    : null;

  return (
    <div className={`fortune-page${phase !== 'form' ? ' fortune-page--result' : ''}`}>
      <Helmet>
        <title>
          {resultTitle
            ? `${resultTitle} — ${FORTUNE_BRAND.label}`
            : `${FORTUNE_BRAND.kicker} ${FORTUNE_BRAND.emoji} — nambac.xyz`}
        </title>
        <meta
          name="description"
          content={
            fortune
              ? `${fortune.body.slice(0, 120)}…`
              : FORTUNE_BRAND.metaDefault
          }
        />
        {result && ogImageUrl && (
          <>
            <meta property="og:type" content="website" />
            <meta property="og:title" content={resultTitle ? `${resultTitle} — nambac.xyz` : `${FORTUNE_BRAND.labelFull} — nambac.xyz`} />
            <meta property="og:description" content={fortune?.body.slice(0, 160)} />
            <meta property="og:image" content={ogImageUrl} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:url" content={sharePageUrl} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:image" content={ogImageUrl} />
          </>
        )}
      </Helmet>

      {phase === 'form' && (
        <>
          <header className="fortune-hero">
            <p className="fortune-date-badge">📅 {introDateLabel}</p>
            <h1>{FORTUNE_BRAND.labelFull} {FORTUNE_BRAND.emoji}</h1>
            <p>{FORTUNE_BRAND.heroLine}</p>
          </header>

          {friendShare && (
            <div className="fortune-friend-banner">
              <strong>{friendShare.friendName}</strong>
              {friendShare.dateLabel && (
                <>
                  {' '}
                  · <strong>{formatFortuneDateShort(friendShare.dateLabel)}</strong>
                </>
              )}{' '}
              dính <strong>{friendShare.fortune.emoji} {friendShare.fortune.title}</strong>
              <br />
              Nhập tên bạn — xem có thoát được không 👀
            </div>
          )}

          <form className="fortune-form" onSubmit={handleReveal}>
            <input
              className="fortune-name-input"
              type="text"
              placeholder="Tên bạn (VD: Minh, Lan…)"
              maxLength={24}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="nickname"
            />
            <button type="submit" className="fortune-submit-btn" disabled={!name.trim()}>
              {FORTUNE_BRAND.submitCta}
            </button>
          </form>

          <p className="fortune-hint">
            Kết quả cố định cả ngày với cùng tên — mai quay lại sẽ khác. Không lưu máy chủ, 0 đồng.
          </p>
        </>
      )}

      {(phase === 'ritual' || phase === 'done') && result && (
        <TarotFortuneWheel
          fortune={result.fortune}
          userName={result.name}
          result={result}
          imageSrc={imageSrc}
          imageLoading={imageLoading}
          imageError={imageError}
          todayLabel={todayLabel}
          cardRef={cardRef}
          onComplete={handleRitualComplete}
        />
      )}

      {showActions && fortune && (
        <motion.div
          className="result-bottom-bar"
          initial={{ y: '150%' }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="bar-actions">
            <button type="button" className="restart-btn" onClick={handleRetry}>
              <span className="btn-label">XEM LẠI</span>
            </button>

            <button type="button" className="download-action-btn" onClick={handleDownload}>
              <Download size={20} />
              <span className="btn-label">TẢI ẢNH</span>
            </button>

            <div className="share-btn-wrap">
              <CopyToast toast={toast} anchored />
              <button
                type="button"
                className={`fortune-like-btn${liked ? ' is-liked' : ''}`}
                onClick={handleLike}
                disabled={liked}
                aria-label={liked ? 'Đã thích' : 'Thích kết quả'}
              >
                <Heart size={22} strokeWidth={2} fill={liked ? 'currentColor' : 'none'} />
                <span className="fortune-like-count">{likeCount.toLocaleString()}</span>
              </button>
              <button
                type="button"
                className="share-btn"
                onClick={handleShareLink}
                aria-label="Sao chép link chia sẻ"
              >
                <Share2 size={24} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
