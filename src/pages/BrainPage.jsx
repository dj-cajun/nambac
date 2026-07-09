import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, RefreshCw } from 'lucide-react';
import {
  getBrainResultById,
  pickRandomBrainResult,
  buildBrainAnswerParts,
  buildBrainShareLink,
  parseBrainShareParams,
} from '../../shared/brainData.js';
import { buildBrainOgImageUrl } from '../lib/siteUrl';
import { fetchBrainSceneImage } from '../lib/brainApi';
import { incrementFeatureStat, trackFeatureViewOnce } from '../lib/featureStats';
import { markTodayDone } from '../lib/todayDone';
import ZaloShareButton from '../components/ZaloShareButton';
import SceneNameOverlay from '../components/SceneNameOverlay';
import './BrainPage.css';

const REVEAL_MS = 2600;

const LOADING_LINES = [
  'Đang quét sóng não…',
  'Giải mã suy nghĩ thầm kín…',
  'Phân tích % trong đầu…',
  'Tổng hợp kết quả…',
];

export default function BrainPage() {
  const cardRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const shared = parseBrainShareParams(searchParams);

  const [friendName, setFriendName] = useState(shared?.name || '');
  const [resultId, setResultId] = useState(shared?.resultId || '');
  const [phase, setPhase] = useState(shared ? 'reveal' : 'form'); // form | loading | reveal
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const [imageSrc, setImageSrc] = useState('');
  const [imageLoading, setImageLoading] = useState(false);

  const currentResult = getBrainResultById(resultId);
  const displayName = friendName.trim();
  const { intro: brainIntro, body: brainBody } = buildBrainAnswerParts(displayName, currentResult);
  const brainSceneLabel = displayName ? `Não ${displayName}` : '';
  const ogResultId = resultId || 'brain_01';
  const ogName = displayName || 'Bạn thân';
  const ogImageUrl = buildBrainOgImageUrl(ogResultId, ogName);
  const shareUrl = buildBrainShareLink(ogName, ogResultId);
  const ogTitle = displayName
    ? `Trong đầu ${displayName} đang nghĩ gì? 🧠`
    : 'Trong đầu bạn đang nghĩ gì? 🧠 — nambac.xyz';

  useEffect(() => {
    if (trackFeatureViewOnce('brain')) {
      incrementFeatureStat('brain', 'view').catch(() => {});
    }
  }, []);

  useEffect(() => {
    const next = parseBrainShareParams(searchParams);
    if (!next) return;
    setFriendName(next.name);
    setResultId(next.resultId);
    setPhase('reveal');
  }, [searchParams]);

  useEffect(() => {
    if (!resultId || phase === 'form') return undefined;
    let cancelled = false;
    setImageLoading(true);

    fetchBrainSceneImage(resultId)
      .then(({ src }) => {
        if (!cancelled) setImageSrc(src);
      })
      .catch(() => {
        if (!cancelled) setImageSrc('');
      })
      .finally(() => {
        if (!cancelled) setImageLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [resultId, phase]);

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
    const result = pickRandomBrainResult(resultId);
    setResultId(result.id);
    setImageSrc('');
    setPhase('loading');
    incrementFeatureStat('brain', 'like').catch(() => {});
    markTodayDone('brain');
  };

  const handleReroll = () => {
    const result = pickRandomBrainResult(resultId);
    setResultId(result.id);
    setImageSrc('');
    setPhase('loading');
  };

  const handleRetry = () => {
    navigate('/brain', { replace: true });
    setFriendName('');
    setResultId('');
    setPhase('form');
    setProgress(0);
    setImageSrc('');
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
      link.download = `nambac_brain_${displayName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      alert('Có lỗi xảy ra khi tạo ảnh — hãy thử chụp màn hình nhé!');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="brain-page">
      <Helmet>
        <title>{ogTitle}</title>
        <meta
          name="description"
          content="Nhập tên → hệ thống quét sóng não → xem % trong đầu bạn đang nghĩ gì. Vui thôi, tag bạn bè trên Zalo!"
        />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content="Quét sóng não, xem % suy nghĩ thầm kín — tag bạn bè trên Zalo!" />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:image" content={ogImageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={ogImageUrl} />
      </Helmet>

      <header className="brain-hero">
        <h1>Trong đầu bạn có gì? 🧠</h1>
        <p>Nhập tên → quét sóng não → xem % suy nghĩ thầm kín. Vui thôi nhé!</p>
      </header>

      {shared && phase === 'reveal' && (
        <div className="brain-viral-banner">
          Kết quả soi não của <strong>{shared.name}</strong>
          {currentResult && (
            <>
              {' '}
              — <strong>{currentResult.emoji} {currentResult.title}</strong>
            </>
          )}
        </div>
      )}

      <AnimatePresence mode="wait">
        {phase === 'form' && (
          <motion.form
            key="form"
            className="brain-form"
            onSubmit={handleGenerate}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <label className="brain-label" htmlFor="brain-name">
              Tên người muốn soi não
            </label>
            <input
              id="brain-name"
              className="brain-input"
              type="text"
              maxLength={15}
              value={friendName}
              onChange={(e) => setFriendName(e.target.value)}
              placeholder="Nhập tên: Phúc, Minh…"
            />
            <button type="submit" className="brain-generate-btn" disabled={!displayName}>
              🧠 Quét sóng não ngay
            </button>
            <p className="brain-form-hint">
              Hệ thống soi ngẫu nhiên 1 trong 8 kiểu não — bấm lại để đổi kết quả nhé!
            </p>
          </motion.form>
        )}

        {phase === 'loading' && (
          <motion.div
            key="loading"
            className="brain-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="brain-loading-emoji">🧠</div>
            <p className="brain-loading-name">Đang quét sóng não của {displayName}…</p>
            <div className="brain-loading-track">
              <div className="brain-loading-fill" style={{ width: `${progress}%` }} />
            </div>
            <p className="brain-loading-pct">{progress}%</p>
            <p className="brain-loading-line">
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
            <div className="brain-card-frame">
              <div ref={cardRef} className="brain-card">
                <div>
                  <p className="brain-card-kicker">Bản đồ não bộ · nambac.xyz</p>
                </div>

                <div className="brain-card-scene">
                  {imageSrc ? (
                    <>
                      <img src={imageSrc} alt={currentResult.title} className="brain-card-scene-img" crossOrigin="anonymous" />
                      <SceneNameOverlay label={brainSceneLabel} variant="brain" />
                    </>
                  ) : (
                    <div className={`brain-card-scene-fallback${imageLoading ? ' is-loading' : ''}`}>
                      <span>{currentResult.emoji}</span>
                      <SceneNameOverlay label={brainSceneLabel} variant="brain" />
                    </div>
                  )}
                </div>

                <div className="brain-card-body-panel">
                  <p className="brain-card-answer">{brainIntro}</p>

                  <div className="brain-card-bars">
                    {currentResult.segments.map((seg, i) => (
                      <div className="brain-bar-row" key={seg.label}>
                        <div className="brain-bar-head">
                          <span className="brain-bar-label">{seg.emoji} {seg.label}</span>
                          <span className="brain-bar-pct">{seg.pct}%</span>
                        </div>
                        <div className="brain-bar-track">
                          <div
                            className={`brain-bar-fill fill-${i % 3}`}
                            style={{ width: `${seg.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="brain-card-answer">{brainBody}</p>
                </div>

                <div className="brain-card-footer">
                  <span>Nambac.xyz · Hệ tâm linh AI</span>
                  <span>#SAIGON-GENZ</span>
                </div>
              </div>
            </div>

            <button type="button" className="brain-reroll-btn" onClick={handleReroll}>
              <RefreshCw size={16} />
              Quét lại kiểu khác
            </button>

            <button
              type="button"
              className="brain-download-btn"
              disabled={!displayName || isGenerating}
              onClick={handleDownload}
            >
              <Download size={20} />
              {isGenerating ? 'Đang tạo ảnh…' : 'Tải ảnh về máy'}
            </button>

            <ZaloShareButton
              url={displayName ? shareUrl : ''}
              className="zalo-share-wrap--block"
              title="Soi não — nambac"
              text="Xem kết quả soi não trên nambac!"
              onShared={() => incrementFeatureStat('brain', 'share').catch(() => {})}
            />

            <button type="button" className="brain-restart-btn" onClick={handleRetry}>
              Soi não đứa khác
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Link to="/roast-card" className="brain-link-other">
        💳 Chơi Thẻ đen bóc phốt
      </Link>
    </div>
  );
}
