import { useRef, useState } from 'react';
import { SBTI_UI } from '../../../../shared/vbti/ui-text.vi.js';
import { typePosterSrc } from '../../../lib/vbti/assets.js';

export default function ShareCard({ result, onCopied }) {
  const ref = useRef(null);
  const [imgFailed, setImgFailed] = useState(false);

  const copyLink = async () => {
    const code = result?.finalType?.code || SBTI_UI.brand;
    const url = `https://www.nambac.xyz/vbti/types/${encodeURIComponent(code)}`;
    try {
      await navigator.clipboard.writeText(url);
      onCopied?.();
    } catch {
      /* ignore */
    }
  };

  if (!result?.finalType) return null;

  const code = result.finalType.code;
  const mascotSrc = typePosterSrc(code);

  return (
    <div className="sbti-share-wrap">
      <div className="sbti-share-card" ref={ref} id="sbti-share-card">
        {!imgFailed && (
          <img
            src={mascotSrc}
            alt=""
            className="sbti-share-mascot"
            loading="eager"
            onError={() => setImgFailed(true)}
          />
        )}
        <div className="sbti-share-body">
          <p className="sbti-share-brand">nambac · {SBTI_UI.brand}</p>
          <p className="sbti-share-kicker">{result.modeKicker}</p>
          <h2 className="sbti-share-code">{result.finalType.code}</h2>
          <p className="sbti-share-name">{result.finalType.name}</p>
          <p className="sbti-share-intro">{result.finalType.intro}</p>
          <p className="sbti-share-badge">{result.badge}</p>
          <p className="sbti-share-url">nambac.xyz/vbti</p>
        </div>
      </div>
      <button type="button" className="sbti-btn-primary" onClick={copyLink}>
        {SBTI_UI.resultShare}
      </button>
    </div>
  );
}
