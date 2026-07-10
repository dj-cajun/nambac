import { useState } from 'react';
import { SBTI_UI } from '../../../../shared/vbti/ui-text.vi.js';
import { buildVbtiShareUrl } from '../../../lib/siteUrl';
import { incrementFeatureStat } from '../../../lib/featureStats';
import { trackFeatureShare } from '../../../lib/analytics';

export default function VbtiShareButton({
  page = 'hub',
  typeCode = null,
  className = 'sbti-share-link-btn',
}) {
  const [done, setDone] = useState(false);

  const onCopy = async () => {
    const url = buildVbtiShareUrl({ page, typeCode });
    try {
      await navigator.clipboard.writeText(url);
      setDone(true);
      trackFeatureShare('sbti');
      incrementFeatureStat('sbti', 'share').catch(() => {});
      window.setTimeout(() => setDone(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <button type="button" className={className} onClick={onCopy}>
      {done ? SBTI_UI.shareToast : SBTI_UI.shareLink}
    </button>
  );
}
