import { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { getHero } from '../../../../shared/lienquan/heroes.js';
import { getHeroPortraitPath } from '../../../../shared/lienquan/heroImage.js';
import HeroIcon from './HeroIcon.jsx';

function resolvePinImage(boast) {
  return boast.image_url
    || getHeroPortraitPath(boast.hero_id)
    || '/images/lienquan/hub-thumb.svg';
}

export default function KhoePinModal({ boast, onClose, onLike }) {
  const titleId = useId();

  useEffect(() => {
    if (!boast) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [boast, onClose]);

  if (!boast) return null;

  const hero = getHero(boast.hero_id);
  const pinSrc = resolvePinImage(boast);

  return createPortal(
    <div className="lq-pin-modal-root" role="presentation" onClick={onClose}>
      <div
        className="lq-pin-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="lq-pin-modal-close" onClick={onClose} aria-label="Đóng">
          ✕
        </button>

        <div className="lq-pin-modal-media">
          <img
            src={pinSrc}
            alt=""
            className="lq-pin-modal-img"
            onError={(e) => {
              const fallback = getHeroPortraitPath(boast.hero_id) || '/images/lienquan/hub-thumb.svg';
              if (fallback && !e.currentTarget.src.endsWith(fallback)) {
                e.currentTarget.src = fallback;
              }
            }}
          />
        </div>

        <div className="lq-pin-modal-panel">
          <div className="lq-pin-modal-user">
            {hero && <HeroIcon hero={hero} size="sm" />}
            <div>
              <strong id={titleId} className="lq-pin-modal-name">{boast.display_name}</strong>
              <span className="lq-pin-modal-hero">{hero?.name || boast.hero_id || 'Liên Quân'}</span>
            </div>
          </div>

          <p className="lq-pin-modal-caption">{boast.caption}</p>

          {boast.tiktok_url ? (
            <a
              href={boast.tiktok_url}
              target="_blank"
              rel="noopener noreferrer"
              className="lq-pin-modal-tiktok"
            >
              ▶ Xem trên TikTok
            </a>
          ) : null}

          <button
            type="button"
            className={`lq-pin-modal-like${boast.liked ? ' on' : ''}`}
            onClick={() => onLike(boast.id)}
            disabled={boast.liked}
          >
            🔥 {boast.like_count || 0}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
