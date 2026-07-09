import { useEffect } from 'react';
import { isAdFree } from '../lib/premium';
import { isAdsEnabled, loadAdSenseScript, AD_PUB_ID } from '../lib/adsConfig';
import { trackAdImpression } from '../lib/analytics';

const AdSenseUnit = ({
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = 'true',
  style = { display: 'block' },
  className = '',
  location = '',
}) => {
  const adFree = isAdFree();

  useEffect(() => {
    if (adFree || !isAdsEnabled() || !adSlot) return;
    loadAdSenseScript();
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      trackAdImpression(location, adSlot);
    } catch (e) {
      console.error('AdSense push failed', e);
    }
  }, [adSlot, adFree, location]);

  if (adFree || !isAdsEnabled() || !adSlot) return null;

  return (
    <div className={`adsense-wrapper ${className}`} style={{ margin: '20px 0', overflow: 'hidden' }}>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client={AD_PUB_ID}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive}
      />
    </div>
  );
};

export default AdSenseUnit;
