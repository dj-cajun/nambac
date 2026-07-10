import { useRef } from 'react';
import { SBTI_UI } from '../../../../shared/sbti/ui-text.vi.js';

export default function ShareCard({ result, onCopied }) {
  const ref = useRef(null);

  const copyLink = async () => {
    const code = result?.finalType?.code || 'SBTI';
    const url = `https://www.nambac.xyz/sbti/types/${encodeURIComponent(code)}`;
    try {
      await navigator.clipboard.writeText(url);
      onCopied?.();
    } catch {
      /* ignore */
    }
  };

  if (!result?.finalType) return null;

  return (
    <div className="sbti-share-wrap">
      <div className="sbti-share-card" ref={ref} id="sbti-share-card">
        <p className="sbti-share-brand">nambac · SBTI</p>
        <p className="sbti-share-kicker">{result.modeKicker}</p>
        <h2 className="sbti-share-code">{result.finalType.code}</h2>
        <p className="sbti-share-name">{result.finalType.name}</p>
        <p className="sbti-share-intro">{result.finalType.intro}</p>
        <p className="sbti-share-badge">{result.badge}</p>
        <p className="sbti-share-url">nambac.xyz/sbti</p>
      </div>
      <button type="button" className="sbti-btn-primary" onClick={copyLink}>
        {SBTI_UI.resultShare}
      </button>
    </div>
  );
}
