import { isAdFree } from '../lib/premium';
import { isAdsEnabled, AD_SLOTS } from '../lib/adsConfig';

const SLOT_BY_LOCATION = {
  'quiz-bottom': AD_SLOTS.quiz,
  'result-bottom': AD_SLOTS.result1,
  home: AD_SLOTS.home,
};

const AdPlaceholder = ({ location = 'auto' }) => {
  if (isAdFree() || !isAdsEnabled()) return null;

  const slot = SLOT_BY_LOCATION[location];
  if (!slot) return null;

  return <AdSenseUnit adSlot={slot} location={location} />;
};

export default AdPlaceholder;
