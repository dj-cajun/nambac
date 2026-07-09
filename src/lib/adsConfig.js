const PLACEHOLDER_SLOTS = new Set(['1234567890', '0987654321', '0000000000']);

import { hasAdConsent } from './cookieConsent.js';

function resolveSlot(raw) {
  const slot = String(raw || '').trim();
  if (!slot || PLACEHOLDER_SLOTS.has(slot)) return '';
  return slot;
}

/** Set VITE_ADSENSE_ENABLED=true + slot IDs to show ads (pub ID has a safe default). */
export const ADS_ENABLED = import.meta.env.VITE_ADSENSE_ENABLED === 'true';

export const AD_PUB_ID = String(
  import.meta.env.VITE_ADSENSE_PUB_ID || 'ca-pub-7386903584540643',
).trim();

export const AD_SLOTS = {
  home: resolveSlot(import.meta.env.VITE_ADSENSE_SLOT_HOME),
  quiz: resolveSlot(import.meta.env.VITE_ADSENSE_SLOT_QUIZ),
  result1: resolveSlot(import.meta.env.VITE_ADSENSE_SLOT_RESULT_1),
  result2: resolveSlot(import.meta.env.VITE_ADSENSE_SLOT_RESULT_2),
};

export function isAdsEnabled() {
  return ADS_ENABLED && Boolean(AD_PUB_ID);
}

let scriptLoading = false;
let scriptLoaded = false;

/** Load adsbygoogle.js only when ads are enabled (not in index.html) */
export function loadAdSenseScript() {
  if (!isAdsEnabled() || !hasAdConsent() || scriptLoaded || scriptLoading) return;
  if (document.querySelector('script[data-nambac-adsense]')) {
    scriptLoaded = true;
    return;
  }

  scriptLoading = true;
  const s = document.createElement('script');
  s.async = true;
  s.crossOrigin = 'anonymous';
  s.dataset.nambacAdsense = '1';
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(AD_PUB_ID)}`;
  s.onload = () => {
    scriptLoaded = true;
    scriptLoading = false;
  };
  s.onerror = () => {
    scriptLoading = false;
  };
  document.head.appendChild(s);
}
