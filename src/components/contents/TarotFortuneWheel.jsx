import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { buildFortuneResultTitle } from '../../../shared/fortuneEngine.js';
import { getFortuneBrand } from '../../../shared/fortuneMeta.js';
import './TarotFortuneWheel.css';

const CARD_COUNT = 20;
const GRID_COLS = 5;
const GRID_ROWS = 4;
const CARD_MID = (CARD_COUNT - 1) / 2;
const GATHER_SPRING_MS = 1800;
const GRID_PAUSE_MS = 400;
const ZOOM_TO_FLIP_MS = 600;
const FLIP_TO_REVEAL_MS = 1300;
const REVEAL_TO_SOLO_MS = 280;
const SOLO_PAUSE_MS = 400;
const GROW_MS = 1100;
const VANISH_MS = 700;

/** 뒤집힌 뒤 선택 카드 고정 위치 */
const PICKED_CARD_X = 0;
const PICKED_CARD_Y = -50;
const PICKED_CARD_SCALE_START = 1.4;
const PICKED_GROW_SCALE = PICKED_CARD_SCALE_START * 3;

const gridSpring = { type: 'spring', stiffness: 420, damping: 28 };
const TABLE_TILT = 48;
const GRID_CELL_W = 54;
const GRID_CELL_H = 72;

function gridCoords(index) {
  const col = index % GRID_COLS;
  const row = Math.floor(index / GRID_COLS);
  return {
    x: (col - (GRID_COLS - 1) / 2) * GRID_CELL_W,
    y: (row - (GRID_ROWS - 1) / 2) * GRID_CELL_H,
    rotate: 0,
    scale: 0.58,
  };
}

function scatteredCoords(index) {
  const t = index / (CARD_COUNT - 1);
  return {
    x: (t - 0.5) * 250 + Math.sin(index * 1.4) * 20,
    y: 72 + Math.cos(index * 0.75) * 26 + (index % 4) * 6,
    rotate: (t - 0.5) * 48 + ((index % 7) - 3) * 9,
  };
}

function CardFaces({ frontMode = 'default', brand: brandProp }) {
  const brand = brandProp || getFortuneBrand('love');
  return (
    <>
      <div className="tarot-wheel-card-face tarot-wheel-card-back tarot-wheel-card-back--comic">
        <div className="tarot-wheel-comic-back-inner">
          <span className="tarot-wheel-comic-bolt">⚡</span>
          <span className="tarot-wheel-comic-logo">nambac</span>
        </div>
      </div>

      <div className="tarot-wheel-card-face tarot-wheel-card-front tarot-wheel-card-front--comic">
        {frontMode === 'blank' ? (
          <div className="tarot-wheel-front-blank" aria-hidden="true" />
        ) : frontMode === 'skeleton' ? (
          <div className="tarot-wheel-text-skeleton tarot-wheel-text-skeleton--full" aria-hidden="true">
            <div className="tarot-wheel-sk-line tarot-wheel-sk-line--lg" />
            <div className="tarot-wheel-sk-line" />
            <div className="tarot-wheel-sk-line" />
            <div className="tarot-wheel-sk-line tarot-wheel-sk-line--md" />
            <div className="tarot-wheel-sk-line tarot-wheel-sk-line--sm" />
          </div>
        ) : (
          <>
            <div className="tarot-wheel-comic-front-head">
              <span>BÀI TỬ VI TÌNH YÊU</span>
              <span className="tarot-wheel-comic-year">#2026</span>
            </div>
            <div className="tarot-wheel-comic-front-body">
              <div className="tarot-wheel-text-skeleton" aria-hidden="true">
                <div className="tarot-wheel-sk-line tarot-wheel-sk-line--lg" />
                <div className="tarot-wheel-sk-line" />
                <div className="tarot-wheel-sk-line tarot-wheel-sk-line--md" />
              </div>
            </div>
            <div className="tarot-wheel-comic-badge">{brand.cardBadge}</div>
          </>
        )}
      </div>
    </>
  );
}

function pickedFrontMode(phase) {
  if (phase === 'flipped') return 'blank';
  if (
    phase === 'revealed' ||
    phase === 'solo' ||
    phase === 'growing' ||
    phase === 'vanish'
  ) {
    return 'skeleton';
  }
  return 'default';
}

/**
 * awaitingGather → gathered → grid → pick → flip → revealed
 * → solo → growing → vanish → expanded
 */
export default function TarotFortuneWheel({
  fortune,
  result,
  imageSrc,
  imageLoading,
  imageError,
  todayLabel,
  cardRef,
  onComplete,
  startExpanded = false,
  brand: brandProp,
}) {
  const brand = brandProp || getFortuneBrand(result?.axis);
  const [phase, setPhase] = useState(startExpanded ? 'expanded' : 'awaitingGather');
  const [pickedIndex, setPickedIndex] = useState(null);

  const handleGather = useCallback(() => {
    if (phase !== 'awaitingGather') return;
    setPhase('gathered');
    setTimeout(() => setPhase('grid'), GATHER_SPRING_MS + GRID_PAUSE_MS);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'expanded') return undefined;
    const doneTimer = setTimeout(() => onComplete?.(), 900);
    return () => clearTimeout(doneTimer);
  }, [phase, onComplete]);

  const handleCardClick = (index) => {
    if (phase !== 'grid') return;
    setPickedIndex(index);
    setPhase('zoomed');

    const tReveal = FLIP_TO_REVEAL_MS;
    const tSolo = tReveal + REVEAL_TO_SOLO_MS;
    const tGrow = tSolo + SOLO_PAUSE_MS;
    const tVanish = tGrow + GROW_MS;
    const tExpanded = tVanish + VANISH_MS;

    setTimeout(() => setPhase('flipped'), ZOOM_TO_FLIP_MS);
    setTimeout(() => setPhase('revealed'), tReveal);
    setTimeout(() => setPhase('solo'), tSolo);
    setTimeout(() => setPhase('growing'), tGrow);
    setTimeout(() => setPhase('vanish'), tVanish);
    setTimeout(() => setPhase('expanded'), tExpanded);
  };

  const displayImage = imageSrc || '/images/default_cover.png';
  const isExpanded = phase === 'expanded';
  const isSoloSequence = phase === 'solo' || phase === 'growing' || phase === 'vanish';
  const isPostReveal = phase === 'revealed' || isSoloSequence;
  const isPicking = pickedIndex !== null && !isExpanded;
  const isGridPhase = phase === 'grid';
  const tableTilt = isPicking || isSoloSequence ? 0 : isGridPhase ? 8 : TABLE_TILT;

  const headerTitle =
    phase === 'awaitingGather'
      ? 'BÀI ĐANG RẢI RÁC 🃏'
      : isGridPhase
        ? 'CHỌN 1 LÁ BÀI 🃏'
        : phase === 'gathered'
          ? 'ĐANG GOM BÀI…'
          : isSoloSequence
            ? 'KẾT QUẢ CỦA BẠN ✨'
            : isPicking
              ? 'ĐANG MỞ LÁ BÀI…'
              : 'ĐANG XẾP BÀI… 💘';

  const hintText =
    phase === 'awaitingGather'
      ? '👇 Chạm để gom bài lại'
      : isGridPhase
        ? 'Chạm 1 lá bài úp trên bàn 👆'
        : phase === 'gathered'
          ? 'Đang gom bài…'
          : isPicking
            ? 'Đừng chớp mắt…'
            : '';

  const resultHeadline = buildFortuneResultTitle({
    name: result.name,
    fortune,
    dateLabel: result.dateLabel,
  });

  const resultCard = (
    <div className="result-unified-card" ref={cardRef}>
      <div className="result-image-wrap">
        {imageLoading ? (
          <div className="fortune-image-skeleton" aria-hidden="true" />
        ) : (
          <img
            src={displayImage}
            alt=""
            className="result-full-img"
            onError={(e) => {
              e.target.src = '/images/default_cover.png';
            }}
          />
        )}
      </div>

      <div className="result-text-panel">
        <div className="result-title-badge">
          {resultHeadline}
        </div>
        <p className="result-description-text">{fortune.body}</p>
        <div className="fortune-remedy-in-panel">
          <span className="fortune-remedy-in-panel-label">💊 Đơn thuốc</span>
          <p className="fortune-remedy-in-panel-text">{fortune.remedy}</p>
        </div>

        <div className="fortune-compat-box">
          <p className="fortune-compat-title">{brand.compatTitle}</p>
          <p className="fortune-compat-line fortune-compat-good">
            <strong>Cứu tinh (chỉ số trạng thái hôm nay {result.soulmateIndex}) 🌟:</strong>{' '}
            {result.soulmate.emoji} {result.soulmate.title}
          </p>
          <p className="fortune-compat-line fortune-compat-bad">
            <strong>Báo thủ (chỉ số trạng thái hôm nay {result.rivalIndex}) ⚠️:</strong>{' '}
            {result.rival.emoji} {result.rival.title}
          </p>
          <p className="fortune-compat-cta">
            Nhắn ngay đứa &quot;Báo thủ&quot; hoặc &quot;Cứu tinh&quot; của bạn vào đây! 💬
          </p>
        </div>

        <p className="fortune-result-date">{todayLabel}</p>
      </div>
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {isExpanded && (
          <motion.main
            key="fortune-result"
            className="fortune-result-main"
            initial={{ opacity: 0, filter: 'blur(16px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.85, ease: 'easeOut' }}
          >
            {resultCard}
            {imageError && (
              <p className="fortune-image-error">
                Không tải được ảnh — vẫn có thể tải thẻ bên dưới nhé.
              </p>
            )}
          </motion.main>
        )}
      </AnimatePresence>

      {!isExpanded && (
    <motion.div
      className={[
        'tarot-wheel-stage',
        isGridPhase ? 'tarot-wheel-stage--grid' : '',
        isSoloSequence ? 'tarot-wheel-stage--solo' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <AnimatePresence>
        {!isPostReveal && (
          <motion.div
            className="tarot-wheel-vignette"
            aria-hidden="true"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isPostReveal && (
          <motion.div
            className="tarot-wheel-header"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <p className="tarot-wheel-kicker">{brand.kicker}</p>
            <h2 className="tarot-wheel-title">{headerTitle}</h2>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`tarot-table-view tarot-table-view--grid${phase === 'awaitingGather' ? ' tarot-table-view--tap' : ''}${isPostReveal ? ' tarot-table-view--solo' : ''}`}
        onClick={phase === 'awaitingGather' ? handleGather : undefined}
        onKeyDown={
          phase === 'awaitingGather'
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') handleGather();
              }
            : undefined
        }
        role={phase === 'awaitingGather' ? 'button' : undefined}
        tabIndex={phase === 'awaitingGather' ? 0 : undefined}
        aria-label={phase === 'awaitingGather' ? 'Gom bài' : undefined}
      >
        <>
            <motion.div
              className="tarot-table-surface"
              aria-hidden="true"
              animate={{ opacity: isPostReveal ? 0 : 1 }}
              transition={{ duration: 0.35 }}
            />
            {isGridPhase && <div className="tarot-grid-board" aria-hidden="true" />}
        </>

        <motion.div
          className="tarot-wheel-deck tarot-wheel-deck--20"
          animate={{ rotateX: tableTilt }}
          transition={{ type: 'spring', stiffness: 200, damping: 26 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
              {Array.from({ length: CARD_COUNT }, (_, index) => {
                const isPicked = pickedIndex === index;
                const scattered = scatteredCoords(index);
                const grid = gridCoords(index);

                let animateProps;
                if (phase === 'awaitingGather') {
                  animateProps = {
                    x: scattered.x,
                    y: scattered.y,
                    rotate: scattered.rotate,
                    rotateY: 0,
                    scale: 0.82,
                    opacity: 1,
                    zIndex: index,
                  };
                } else if (phase === 'gathered') {
                  animateProps = {
                    x: 0,
                    y: 0,
                    rotate: (index - CARD_MID) * 0.4,
                    rotateY: 0,
                    scale: 1,
                    opacity: 1,
                    zIndex: index,
                    transition: { type: 'spring', duration: 1.8, bounce: 0.1 },
                  };
                } else if (phase === 'grid') {
                  animateProps = {
                    x: grid.x,
                    y: grid.y,
                    rotate: grid.rotate,
                    rotateY: 0,
                    scale: grid.scale,
                    opacity: 1,
                    zIndex: index,
                    transition: gridSpring,
                  };
                } else if (
                  isPicked &&
                  (phase === 'zoomed' ||
                    phase === 'flipped' ||
                    phase === 'revealed' ||
                    phase === 'solo' ||
                    phase === 'growing' ||
                    phase === 'vanish')
                ) {
                  let scale = PICKED_CARD_SCALE_START;
                  let opacity = 1;
                  let filter = 'blur(0px)';
                  let transition = { duration: 0.5, ease: 'easeInOut' };

                  if (phase === 'growing') {
                    scale = PICKED_GROW_SCALE;
                    transition = { duration: GROW_MS / 1000, ease: 'easeInOut' };
                  } else if (phase === 'vanish') {
                    scale = PICKED_GROW_SCALE * 1.05;
                    opacity = 0;
                    filter = 'blur(8px)';
                    transition = { duration: VANISH_MS / 1000, ease: 'easeIn' };
                  }

                  animateProps = {
                    x: PICKED_CARD_X,
                    y: PICKED_CARD_Y,
                    rotate: 0,
                    scale,
                    opacity,
                    filter,
                    zIndex: 100,
                    transition,
                  };
                } else if (isPicking) {
                  animateProps = {
                    opacity: 0,
                    y: 200,
                    scale: 0.4,
                    transition: { duration: 0.35 },
                  };
                } else {
                  animateProps = { opacity: 0, scale: 0.7 };
                }

                const isFlipped =
                  isPicked &&
                  phase !== 'zoomed' &&
                  (phase === 'flipped' ||
                    phase === 'revealed' ||
                    phase === 'solo' ||
                    phase === 'growing' ||
                    phase === 'vanish');

                return (
                  <motion.button
                    key={index}
                    type="button"
                    className={`tarot-wheel-card tarot-wheel-card--comic${isPicked ? ' is-picked' : ''}`}
                    style={{ transformStyle: 'preserve-3d', transformOrigin: 'center center' }}
                    animate={animateProps}
                    whileHover={
                      isGridPhase ? { scale: grid.scale * 1.1, zIndex: 50 } : undefined
                    }
                    onClick={(e) => {
                      if (isGridPhase) {
                        e.stopPropagation();
                        handleCardClick(index);
                      }
                    }}
                    disabled={!isGridPhase}
                    aria-label={`Lá bài ${index + 1}`}
                  >
                    <motion.div
                      className="tarot-wheel-card-flip"
                      animate={{ rotateY: isFlipped ? 180 : 0 }}
                      transition={{ duration: 0.55, ease: 'easeInOut' }}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <CardFaces
                        frontMode={isPicked ? pickedFrontMode(phase) : 'default'}
                        brand={brand}
                      />
                    </motion.div>
                  </motion.button>
                );
              })}
            </motion.div>
      </div>

      {!isPostReveal && hintText && (
        <p
          className={`tarot-wheel-hint${phase === 'awaitingGather' ? ' tarot-wheel-hint--cta' : ''}`}
        >
          {hintText}
        </p>
      )}
    </motion.div>
      )}
    </>
  );
}
