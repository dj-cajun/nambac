import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { masteryLabel } from '../../../../shared/lienquan/quizQuestions.js';

const TIER_META = {
  0: { short: 'Đồng', emoji: '🥉', tone: 'dong' },
  1: { short: 'TT1', emoji: '⚔️', tone: 'tt1' },
  2: { short: 'TT2', emoji: '⚔️', tone: 'tt2' },
  3: { short: 'TT3', emoji: '⚔️', tone: 'tt3' },
  4: { short: 'TT4', emoji: '💠', tone: 'tt4' },
  5: { short: 'TT5', emoji: '💠', tone: 'tt5' },
  6: { short: 'TT6', emoji: '👑', tone: 'tt6' },
  7: { short: 'TT7', emoji: '🏆', tone: 'tt7' },
};

function requestFs(el) {
  if (!el) return Promise.resolve();
  const req = el.requestFullscreen || el.webkitRequestFullscreen || el.webkitRequestFullScreen;
  if (!req) return Promise.resolve();
  try {
    return Promise.resolve(req.call(el)).catch(() => {});
  } catch {
    return Promise.resolve();
  }
}

function exitFs() {
  const doc = document;
  if (!doc.fullscreenElement && !doc.webkitFullscreenElement) return;
  const exit = doc.exitFullscreen || doc.webkitExitFullscreen;
  try {
    exit?.call(doc);
  } catch {
    /* ignore */
  }
}

/** Landscape rank plate — Liên Quân is played sideways. */
export default function MasteryBadgeCard({ mastery, emptyCta = true, variant = 'inline' }) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const rootRef = useRef(null);
  const level = Number(mastery?.level ?? 0);
  const meta = TIER_META[level] || TIER_META[0];
  const label = mastery?.label || masteryLabel(level);
  const hasRank = Boolean(mastery);
  const tone = meta.tone;

  const openFs = () => {
    setOpen(true);
  };

  const closeFs = () => {
    exitFs();
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') closeFs();
    };
    const prevOverflow = document.body.style.overflow;
    const prevTouch = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    window.addEventListener('keydown', onKey);

    // Must run right after open paint; best-effort (iOS Safari often blocks)
    const t = window.setTimeout(() => {
      requestFs(rootRef.current);
    }, 0);

    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouch;
      window.removeEventListener('keydown', onKey);
      exitFs();
    };
  }, [open]);

  const plate = (size) => (
    <div className={`lq-rank-land lq-rank-land--${size} tone-${tone}`}>
      <div className="lq-rank-land-left">
        <span className="lq-rank-land-emoji" aria-hidden="true">{meta.emoji}</span>
        <span className="lq-rank-land-num">{level >= 1 ? level : 'Đ'}</span>
      </div>
      <div className="lq-rank-land-right">
        <span className="lq-rank-land-brand">LIÊN QUÂN</span>
        <strong className="lq-rank-land-label">{size === 'thumb' ? meta.short : label}</strong>
        {size !== 'thumb' && <span className="lq-rank-land-tag">{meta.short}</span>}
      </div>
    </div>
  );

  const lightbox = open
    ? createPortal(
      <div
        ref={rootRef}
        id="lq-rank-fs-root"
        className={`lq-rank-fs tone-${tone}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          type="button"
          className="lq-rank-fs-close"
          aria-label="Đóng"
          onClick={closeFs}
        >
          ✕
        </button>
        <div className="lq-rank-fs-stage">
          <article className={`lq-rank-fs-card tone-${tone}`}>
            <div className="lq-rank-fs-ornate" aria-hidden="true">
              <span className="lq-rank-fs-mold lq-rank-fs-mold--outer" />
              <span className="lq-rank-fs-mold lq-rank-fs-mold--mid" />
              <span className="lq-rank-fs-mold lq-rank-fs-mold--liner" />
              <span className="lq-rank-fs-mold lq-rank-fs-mold--inner" />
              <span className="lq-rank-fs-corner lq-rank-fs-corner--tl" />
              <span className="lq-rank-fs-corner lq-rank-fs-corner--tr" />
              <span className="lq-rank-fs-corner lq-rank-fs-corner--bl" />
              <span className="lq-rank-fs-corner lq-rank-fs-corner--br" />
            </div>
            <div className="lq-rank-fs-body">
              <p className="lq-rank-fs-brand">nambac · Liên Quân Mobile</p>
              {plate('full')}
              <h2 id={titleId} className="lq-rank-fs-title">{label}</h2>
              <p className="lq-rank-fs-sub">Xoay ngang như game · ✕ để đóng</p>
            </div>
          </article>
        </div>
      </div>,
      document.body,
    )
    : null;

  if (!hasRank && emptyCta && variant === 'inline') {
    return (
      <Link
        to="/lienquan/quiz"
        className="lq-rank-thumb lq-rank-thumb--empty"
        aria-label="Thi Thông Thạo để lấy mark"
        title="Thi để lấy mark"
      >
        <div className="lq-rank-land lq-rank-land--thumb lq-rank-land--ghost tone-dong">
          <div className="lq-rank-land-left">
            <span className="lq-rank-land-num">?</span>
          </div>
          <div className="lq-rank-land-right">
            <span className="lq-rank-land-brand">MARK</span>
            <strong className="lq-rank-land-label">Thi</strong>
          </div>
        </div>
      </Link>
    );
  }

  if (!hasRank) return null;

  if (variant === 'stack') {
    return (
      <>
        <button
          type="button"
          className={`lq-rank-stack-btn tone-${tone}`}
          onClick={openFs}
          aria-label={`Xem mark ${label} ngang full`}
        >
          {plate('stack')}
          <span className="lq-rank-stack-hint">Chạm · full màn hình ngang</span>
        </button>
        {lightbox}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        className={`lq-rank-thumb tone-${tone}`}
        onClick={openFs}
        aria-label={`Mark ${label} — full màn hình`}
        title={label}
      >
        {plate('thumb')}
      </button>
      {lightbox}
    </>
  );
}
