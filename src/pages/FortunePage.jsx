import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Download, Share2, Heart } from 'lucide-react';
import {
  calculateTodayFortune,
  getDateStr,
  buildFortuneShareUrl,
  buildFortuneResultTitle,
  formatFortuneDateLong,
  formatFortuneDateShort,
  parseFortuneShareParams,
  buildFortuneResultFromShare,
} from '../../shared/fortuneEngine.js';
import { FORTUNE_BRAND } from '../../shared/fortuneMeta.js';
import { introFortuneIndexFromDate } from '../../shared/featureThumbnails.js';
import { fetchFortuneSceneImage, fetchFortuneStats, incrementFortuneStat } from '../lib/fortuneApi.js';
import { trackFortuneViewOnce, trackFortuneLikeOnce, hasFortuneLikedThisSession } from '../lib/fortuneStats.js';
import {
  trackFortuneDownload,
  trackFortuneLike,
  trackFortuneReveal,
  trackFortuneShare,
  trackFortuneView,
} from '../lib/analytics.js';
import { copyShareLinkWithFeedback } from '../lib/copyShareLink.js';
import { buildFortuneOgImageUrl } from '../lib/siteUrl.js';
import { markTodayDone } from '../lib/todayDone.js';
import CopyToast from '../components/CopyToast.jsx';
import ZaloShareButton from '../components/ZaloShareButton.jsx';
import { useCopyToast } from '../hooks/useCopyToast.js';
import TarotFortuneWheel from '../components/contents/TarotFortuneWheel.jsx';
import './FortunePage.css';
import './Result.css';

const NAME_KEY = 'nambac_fortune_name';

function addDays(dateLabel, days) {
  const d = new Date(`${dateLabel}T00:00:00`);
  d.setDate(d.getDate() + days);
  return getDateStr(d);
}

export default function FortunePage({ dayOffset = 0 }) {
  const cardRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const friendShare = parseFortuneShareParams(searchParams);
  const sharedResult = friendShare ? buildFortuneResultFromShare(friendShare) : null;
  const { toast, showToast } = useCopyToast();

  const isTomorrow = dayOffset === 1;
  const dayLabel = isTomorrow ? 'Ngày mai' : 'Hôm nay';
  const baseDateObj = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    return d;
  }, [dayOffset]);

  const [name, setName] = useState(() => {
    if (friendShare) return friendShare.friendName;
    try {
      return localStorage.getItem(NAME_KEY) || '';
    } catch {
      return '';
    }
  });
  const [phase, setPhase] = useState(sharedResult ? 'done' : 'form'); // form | ritual | done
  const [showActions, setShowActions] = useState(!!sharedResult);
  const [result, setResult] = useState(sharedResult);
  const [imageSrc, setImageSrc] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [introTodayImage, setIntroTodayImage] = useState('');
  const [introTomorrowImage, setIntroTomorrowImage] = useState('');
  const [liked, setLiked] = useState(() => hasFortuneLikedThisSession());
  const [likeCount, setLikeCount] = useState(0);

  const pageDateLabel = friendShare?.dateLabel || getDateStr(baseDateObj);
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
    const calc = calculateTodayFortune(trimmed, baseDateObj);
    setResult(calc);
    trackFortuneReveal('love');
    setImageSrc('');
    setImageError(false);
    setShowActions(false);
    setPhase('ritual');
  };

  const handleRitualComplete = () => {
    setPhase('done');
    setShowActions(true);
    if (dayOffset === 0) markTodayDone('fortune');
  };

  const handleRetry = () => {
    if (friendShare) {
      navigate(dayOffset === 1 ? '/fortune/tomorrow' : '/fortune', { replace: true });
    }
    setPhase('form');
    setShowActions(false);
    setResult(null);
    setName(() => {
      try {
        return localStorage.getItem(NAME_KEY) || '';
      } catch {
        return '';
      }
    });
    setImageSrc('');
    setImageError(false);
  };

  useEffect(() => {
    fetchFortuneStats().then((s) => setLikeCount(s.like_count || 0)).catch(() => {});
    if (!trackFortuneViewOnce()) return;
    trackFortuneView('love');
    incrementFortuneStat('view')
      .then((data) => {
        if (typeof data.like_count === 'number') setLikeCount(data.like_count);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const share = parseFortuneShareParams(searchParams);
    if (!share) return;
    const next = buildFortuneResultFromShare(share);
    if (!next) return;
    setName(share.friendName);
    setResult(next);
    setPhase('done');
    setShowActions(true);
  }, [searchParams]);

  useEffect(() => {
    const today = getDateStr();
    const tomorrow = addDays(today, 1);
    const todayIdx = introFortuneIndexFromDate(today);
    const tomorrowIdx = introFortuneIndexFromDate(tomorrow);
    let cancelled = false;

    Promise.allSettled([
      fetchFortuneSceneImage({ fortuneIndex: todayIdx, dateLabel: today }),
      fetchFortuneSceneImage({ fortuneIndex: tomorrowIdx, dateLabel: tomorrow }),
    ]).then(([todayRes, tomorrowRes]) => {
      if (cancelled) return;
      if (todayRes.status === 'fulfilled') setIntroTodayImage(todayRes.value.src);
      if (tomorrowRes.status === 'fulfilled') setIntroTomorrowImage(tomorrowRes.value.src);
    });

    return () => {
      cancelled = true;
    };
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
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.download = `nambac-fortune-${result?.name || 'today'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      trackFortuneDownload('love');
    } catch {
      alert('Có lỗi khi tải ảnh — thử chụp màn hình nhé!');
    }
  };

  const handleZaloShare = () => {
    if (!result) return;
    trackFortuneShare('tag_friends');
    incrementFortuneStat('share').catch(console.error);
  };

  const handleShareLink = async () => {
    if (!result) return;
    const url = buildFortuneShareUrl(result.name, result.fortuneIndex, result.dateLabel);
    const ok = await copyShareLinkWithFeedback(url, showToast);
    if (ok) {
      trackFortuneShare('love');
      incrementFortuneStat('share').catch(console.error);
    }
  };

  const handleLike = async () => {
    if (liked || !trackFortuneLikeOnce()) return;
    trackFortuneLike('love');
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
            : `${FORTUNE_BRAND.labelFull} ${isTomorrow ? 'ngày mai' : 'hôm nay'} ${FORTUNE_BRAND.emoji} — nambac.xyz`}
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
            <p className="fortune-date-badge">📅 {dayLabel} · {introDateLabel}</p>
            <h1>{FORTUNE_BRAND.labelFull} {isTomorrow ? 'ngày mai' : 'hôm nay'} {FORTUNE_BRAND.emoji}</h1>
            <p>{isTomorrow ? 'Xem trước vận tình yêu ngày mai — chuẩn bị tinh thần nhé!' : FORTUNE_BRAND.heroLine}</p>
          </header>

          <section className="fortune-intro-grid fortune-intro-grid--single" aria-label={`Tử vi tình yêu ${dayLabel.toLowerCase()}`}>
            <article className="fortune-intro-card fortune-intro-card--single">
              <p className="fortune-intro-card-kicker">{dayLabel}</p>
              {(isTomorrow ? introTomorrowImage : introTodayImage) ? (
                <img
                  src={isTomorrow ? introTomorrowImage : introTodayImage}
                  alt={`Tử vi tình yêu ${dayLabel.toLowerCase()}`}
                  className="fortune-intro-card-image"
                />
              ) : (
                <div className="fortune-intro-card-skeleton" aria-hidden="true" />
              )}
            </article>
          </section>

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
              Nhập tên bạn — xem vận của mình có giống không 👀
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
            {isTomorrow
              ? 'Kết quả cố định cho ngày mai với cùng tên. Không lưu máy chủ, 0 đồng.'
              : 'Kết quả cố định cả ngày với cùng tên — mai quay lại sẽ khác. Không lưu máy chủ, 0 đồng.'}
          </p>
        </>
      )}

      {friendShare && (phase === 'ritual' || phase === 'done') && result && (
        <div className="fortune-friend-banner fortune-friend-banner--viewing">
          Bạn đang xem tử vi của <strong>{friendShare.friendName}</strong>
          {friendShare.dateLabel && (
            <>
              {' '}
              · <strong>{formatFortuneDateShort(friendShare.dateLabel)}</strong>
            </>
          )}
        </div>
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
          startExpanded={!!friendShare}
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

            <div className="tag-friends-zalo-wrap" aria-label="Chia sẻ Zalo — tag 3 bạn">
              {result && (
                <ZaloShareButton
                  fillParent
                  url={buildFortuneShareUrl(result.name, result.fortuneIndex, result.dateLabel)}
                  label="TAG 3 BẠN"
                  title="Tử vi tình yêu — nambac"
                  text="Xem tử vi này trên nambac — tag 3 bạn ngay!"
                  onShared={handleZaloShare}
                  onToast={showToast}
                />
              )}
            </div>

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
