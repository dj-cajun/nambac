import { useState } from 'react';
import { typePosterFallbackSrc, typePosterSrc } from '../../../lib/vbti/assets.js';

function hashHue(code) {
  let h = 0;
  for (let i = 0; i < code.length; i += 1) h = (h * 31 + code.charCodeAt(i)) % 360;
  return h;
}

export default function TypePoster({ type, size = 'md' }) {
  const [imgFailed, setImgFailed] = useState(false);

  if (!type?.code) return null;

  const cls = size === 'lg' ? 'sbti-poster-lg' : 'sbti-poster-md';
  const hue = hashHue(type.code);
  const webpSrc = typePosterSrc(type.code);
  const fallbackSrc = typePosterFallbackSrc(type.code);
  const showMascot = !imgFailed;

  return (
    <div
      className={`sbti-poster ${cls}${showMascot ? ' has-mascot' : ''}`}
      data-code={type.code}
      style={showMascot ? undefined : {
        background: `linear-gradient(145deg, hsl(${hue}, 42%, 22%), hsl(${(hue + 42) % 360}, 36%, 36%))`,
      }}
    >
      {showMascot ? (
        <img
          src={webpSrc}
          alt={`${type.code} mascot`}
          className="sbti-poster-img"
          loading={size === 'lg' ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <img
          src={fallbackSrc}
          alt=""
          className="sbti-poster-fallback"
          aria-hidden
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      )}
      <div className="sbti-poster-overlay">
        <span className="sbti-poster-code">{type.code}</span>
        {type.name ? <span className="sbti-poster-name">{type.name}</span> : null}
      </div>
    </div>
  );
}
