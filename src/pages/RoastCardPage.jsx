import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, RefreshCw } from 'lucide-react';
import {
  getTraitById,
  pickRandomTrait,
  buildRoastAnswerText,
  buildRoastShareLink,
  parseRoastShareParams,
} from '../../shared/roastData.js';
import { buildRoastOgImageUrl } from '../lib/siteUrl';
import { fetchRoastSceneImage } from '../lib/roastApi';
import { incrementFeatureStat, trackFeatureViewOnce } from '../lib/featureStats';
import { trackFeatureEngage, trackFeatureShare, trackFeatureView } from '../lib/analytics';
import { markTodayDone } from '../lib/todayDone';
import ZaloShareButton from '../components/ZaloShareButton';
import SceneNameOverlay from '../components/SceneNameOverlay';
import './RoastCardPage.css';

const REVEAL_MS = 2600;

const LOADING_LINES = [
  'Đang lục hồ sơ đen…',
  'Truy vết Zalo 3 ngày ghost…',
  'Đối chiếu hóa đơn chưa trả…',
  'Xác nhận tội danh…',
];

export default function RoastCardPage() {
  const cardRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const shared = parseRoastShareParams(searchParams);

  const [friendName, setFriendName] = useState(shared?.name || '');
  const [traitId, setTraitId] = useState(shared?.traitId || '');
  const [phase, setPhase] = useState(shared ? 'reveal' : 'form'); // form | loading | reveal
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const [imageSrc, setImageSrc] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const currentTrait = getTraitById(traitId);
  const displayName = friendName.trim();
  const answerText = buildRoastAnswerText(displayName, currentTrait);

  const ogName = displayName || 'Bạn thân';
  const ogTraitId = traitId || 'trait_01';
  const ogImageUrl = buildRoastOgImageUrl(ogName, ogTraitId);
  const sharePageUrl = buildRoastShareLink(ogName, ogTraitId);
  const ogTitle = displayName
    ? `${displayName} vừa bị bóc phốt: ${currentTrait.title} 💳`
    : 'Thẻ đen bóc phốt bạn bè 💳 — nambac.xyz';

  useEffect(() => {
    if (trackFeatureViewOnce('roast')) {
      trackFeatureView('roast');
      incrementFeatureStat('roast', 'view').catch(() => {});
    }
  }, []);

  useEffect(() => {
    const next = parseRoastShareParams(searchParams);
    if (!next) return;
    setFriendName(next.name);
    setTraitId(next.traitId);
    setPhase('reveal');
  }, [searchParams]);

  // Fetch the AI scene image whenever a trait is chosen (loading or reveal)
  useEffect(() => {
    if (!traitId || phase === 'form') return undefined;
    let cancelled = false;
    setImageLoading(true);
    setImageError(false);

    fetchRoastSceneImage(traitId)
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
  }, [traitId, phase]);

  // Loading-bar animation → reveal
  useEffect(() => {
    if (phase !== 'loading') return undefined;
    setProgress(0);
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.round((elapsed / REVEAL_MS) * 100));
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(timer);
        setPhase('reveal');
      }
    }, 40);
    return () => clearInterval(timer);
  }, [phase]);

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!displayName) return;
    const trait = pickRandomTrait(traitId);
    setTraitId(trait.id);
    setImageSrc('');
    setImageError(false);
    setPhase('loading');
    trackFeatureEngage('roast', 'generate');
    incrementFeatureStat('roast', 'like').catch(() => {});
    markTodayDone('roast');
  };

  const handleRetry = () => {
    navigate('/roast-card', { replace: true });
    setFriendName('');
    setTraitId('');
    setPhase('form');
    setProgress(0);
    setImageSrc('');
    setImageError(false);
  };

  const handleReroll = () => {
    const trait = pickRandomTrait(traitId);
    setTraitId(trait.id);
    setImageSrc('');
    setImageError(false);
    setPhase('loading');
  };

  const handleDownload = async () => {
    if (!cardRef.current || !displayName) return;
    setIsGenerating(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `nambac_blacklist_${displayName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      alert('Có lỗi xảy ra khi tạo ảnh — hãy thử chụp màn hình nhé!');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="roast-generator-page">
      <Helmet>
        <title>{ogTitle}</title>
        <meta
          name="description"
          content="Nhập tên bạn thân → hệ thống soi tội ngẫu nhiên → nhận thẻ đen bóc phốt kèm ảnh, tag Zalo. Không cần đăng nhập."
        />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={ogTitle} />
        <meta
          property="og:description"
          content="Tạo thẻ đen bóc phốt bạn thân — soi tội ngẫu nhiên, tag Zalo. Vào làm thẻ trả đũa ngay!"
        />
        <meta property="og:url" content={sharePageUrl} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={ogImageUrl} />
      </Helmet>

      <header className="roast-generator-hero">
        <h1>Thẻ đen bóc phốt 💳</h1>
        <p>Nhập tên → hệ thống soi tội ngẫu nhiên → tag bạn thân trên Zalo. Vui thôi nhé!</p>
      </header>

      {shared && phase === 'reveal' && (
        <div className="roast-viral-banner">
          Thẻ đen của <strong>{shared.name}</strong>
          {currentTrait && (
            <>
              {' '}
              — <strong>{currentTrait.emoji} {currentTrait.title}</strong>
            </>
          )}
        </div>
      )}

      <AnimatePresence mode="wait">
        {phase === 'form' && (
          <motion.form
            key="form"
            className="roast-generator-form"
            onSubmit={handleGenerate}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <label className="roast-generator-label" htmlFor="roast-friend-name">
              Tên đứa bạn muốn bóc phốt
            </label>
            <input
              id="roast-friend-name"
              className="roast-generator-input"
              type="text"
              maxLength={15}
              value={friendName}
              onChange={(e) => setFriendName(e.target.value)}
              placeholder="Nhập tên: Phúc, Minh…"
            />
            <button type="submit" className="roast-generate-btn" disabled={!displayName}>
              🔍 Soi tội ngay
            </button>
            <p className="roast-form-hint">
              Hệ thống sẽ soi ngẫu nhiên 1 trong 30 tội danh — bấm lại để đổi tội nhé!
            </p>
          </motion.form>
        )}

        {phase === 'loading' && (
          <motion.div
            key="loading"
            className="roast-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="roast-loading-emoji">🕵️</div>
            <p className="roast-loading-name">Đang soi hồ sơ của {displayName}…</p>
            <div className="roast-loading-track">
              <div className="roast-loading-fill" style={{ width: `${progress}%` }} />
            </div>
            <p className="roast-loading-pct">{progress}%</p>
            <p className="roast-loading-line">
              {LOADING_LINES[Math.min(LOADING_LINES.length - 1, Math.floor((progress / 100) * LOADING_LINES.length))]}
            </p>
          </motion.div>
        )}

        {phase === 'reveal' && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 240, damping: 22 }}
          >
            <div className="roast-card-frame">
              <div ref={cardRef} className="roast-blacklist-card">
                <span className="roast-danger-badge">⚠️ Độc hại</span>

                <div>
                  <p className="roast-card-header-kicker">Danh sách đen Sài Gòn</p>
                  <h2 className="roast-card-header-title">THẺ ĐEN BÓC PHỐT</h2>
                </div>

                <div className="roast-card-scene">
                  {imageSrc ? (
                    <>
                      <img src={imageSrc} alt={currentTrait.title} className="roast-card-scene-img" crossOrigin="anonymous" />
                      <SceneNameOverlay label={displayName} variant="roast" />
                    </>
                  ) : (
                    <div className={`roast-card-scene-fallback${imageLoading ? ' is-loading' : ''}`}>
                      <span>{currentTrait.emoji}</span>
                      <SceneNameOverlay label={displayName} variant="roast" />
                    </div>
                  )}
                </div>

                <div className="roast-card-body-panel">
                  <p className="roast-card-answer">{answerText}</p>
                </div>

                <div className="roast-card-footer-row">
                  <span>Nambac.xyz · Hệ tâm linh AI</span>
                  <span>#SAIGON-GENZ-2026</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="roast-reroll-btn"
              onClick={handleReroll}
            >
              <RefreshCw size={16} />
              Soi lại tội khác
            </button>

            <button
              type="button"
              className="roast-download-btn"
              disabled={!displayName || isGenerating}
              onClick={handleDownload}
            >
              <Download size={20} />
              {isGenerating ? 'Đang tạo ảnh…' : 'Tải ảnh dìm về máy'}
            </button>

            <ZaloShareButton
              url={displayName ? sharePageUrl : ''}
              className="zalo-share-wrap--block"
              title="Thẻ đen bóc phốt — nambac"
              text="Xem thẻ đen này trên nambac!"
              onShared={() => {
                trackFeatureShare('roast');
                incrementFeatureStat('roast', 'share').catch(() => {});
              }}
            />

            <button type="button" className="roast-restart-btn" onClick={handleRetry}>
              Bóc phốt đứa khác
            </button>

            <p className="roast-zalo-hint">
              Nếu không tải được, hãy chụp màn hình lại nhé! (Zalo in-app đôi khi chặn download)
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <Link to="/balance" className="roast-link-balance">
        ⚖️ Chơi Chọn 1 trong 2
      </Link>
    </div>
  );
}
