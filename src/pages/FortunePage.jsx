import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Download, Share2, Heart } from 'lucide-react';
import html2canvas from 'html2canvas';
import {
  calculateTodayFortune,
  getDateStr,
  buildFortuneShareUrl,
  buildFortuneResultTitle,
  formatFortuneDateLong,
  formatFortuneDateShort,
  parseFortuneShareParams,
} from '../../shared/fortuneEngine.js';
import { FORTUNE_COUNT } from '../../shared/fortuneData.js';
import { FORTUNE_BRAND } from '../../shared/fortuneMeta.js';
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
import CopyToast from '../components/CopyToast.jsx';
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

function introIndexFromDate(dateLabel) {
  let hash = 2166136261;
  for (let i = 0; i < dateLabel.length; i += 1) {
    hash ^= dateLabel.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return Math.abs(hash) % FORTUNE_COUNT;
}

export default function FortunePage({ dayOffset = 0 }) {
  const cardRef = useRef(null);
  const [searchParams] = useSearchParams();
  const friendShare = parseFortuneShareParams(searchParams);
  const { toast, showToast } = useCopyToast();

  const isTomorrow = dayOffset === 1;
  const dayLabel = isTomorrow ? 'Ngày mai' : 'Hôm nay';
  const baseDateObj = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    return d;
  }, [dayOffset]);

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
    trackFortuneView('love');
    incrementFortuneStat('view')
      .then((data) => {
        if (typeof data.like_count === 'number') setLikeCount(data.like_count);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const today = getDateStr();
    const tomorrow = addDays(today, 1);
    const todayIdx = introIndexFromDate(today);
    const tomorrowIdx = introIndexFromDate(tomorrow);
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

  const handleShareLink = async () => {
    if (!result) return;
    const url = buildFortuneShareUrl(result.name, result.fortuneIndex, result.dateLabel);
    const ok = await copyShareLinkWithFeedback(url, showToast);
    if (ok) {
      trackFortuneShare('love');
      incrementFortuneStat('share').catch(console.error);
    }
  };

  const handleTagFriends = async () => {
    if (!result) return;
    const url = buildFortuneShareUrl(result.name, result.fortuneIndex, result.dateLabel);
    const fortuneTitle = result.fortune?.title || 'Vận mệnh hôm nay';
    const text = `Vận mệnh hôm nay của mình: "${fortuneTitle}" 🔮 Xem của bạn rồi tag 3 người nhé!\n${url}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${result.name} — ${FORTUNE_BRAND.label}`,
          text,
          url,
        });
        trackFortuneShare('tag_friends');
        incrementFortuneStat('share').catch(console.error);
        return;
      } catch {
        // fall through to clipboard
      }
    }
    const ok = await copyShareLinkWithFeedback(text, showToast);
    if (ok) {
      trackFortuneShare('tag_friends');
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

          <section className="fortune-intro-grid" aria-label="Tử vi hôm nay và ngày mai">
            <article className="fortune-intro-card">
              <p className="fortune-intro-card-kicker">Hôm nay</p>
              {introTodayImage ? (
                <img src={introTodayImage} alt="Tử vi tình yêu hôm nay" className="fortune-intro-card-image" />
              ) : (
                <div className="fortune-intro-card-skeleton" aria-hidden="true" />
              )}
            </article>
            <article className="fortune-intro-card">
              <p className="fortune-intro-card-kicker">Ngày mai</p>
              {introTomorrowImage ? (
                <img src={introTomorrowImage} alt="Tử vi tình yêu ngày mai" className="fortune-intro-card-image" />
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
            {isTomorrow
              ? 'Kết quả cố định cho ngày mai với cùng tên. Không lưu máy chủ, 0 đồng.'
              : 'Kết quả cố định cả ngày với cùng tên — mai quay lại sẽ khác. Không lưu máy chủ, 0 đồng.'}
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

            <button type="button" className="tag-friends-btn" onClick={handleTagFriends}>
              <span className="btn-label">TAG 3 BẠN</span>
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
