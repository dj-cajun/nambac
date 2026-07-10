import { useState } from 'react';
import { LQ_UI } from '../../../../shared/lienquan/uiText.js';
import { buildLienquanShareUrl } from '../../../lib/siteUrl';
import { incrementFeatureStat } from '../../../lib/featureStats';
import { trackFeatureShare } from '../../../lib/analytics';

export default function ShareLinkButton({ page = 'hub', heroId = null, className = 'lq-copy-btn' }) {
  const [done, setDone] = useState(false);

  const onCopy = async () => {
    const url = buildLienquanShareUrl({ page, heroId });
    try {
      await navigator.clipboard.writeText(url);
      setDone(true);
      trackFeatureShare('lienquan');
      incrementFeatureStat('lienquan', 'share').catch(() => {});
      window.setTimeout(() => setDone(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <button type="button" className={className} onClick={onCopy}>
      {done ? LQ_UI.shareToast : LQ_UI.shareLink}
    </button>
  );
}
