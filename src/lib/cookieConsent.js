/** Cookie consent — localStorage + Google Consent Mode (dataLayer) */

export const COOKIE_CONSENT_KEY = 'nambac_cookie_consent';

/** @typedef {'all' | 'essential'} CookieConsentChoice */

/** @returns {CookieConsentChoice | null} */
export function getCookieConsent() {
  try {
    const v = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (v === 'all' || v === 'essential') return v;
    return null;
  } catch {
    return null;
  }
}

/** @param {CookieConsentChoice} choice */
export function setCookieConsent(choice) {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, choice);
  } catch {
    /* private mode */
  }
  applyConsentToDataLayer(choice);
}

export function hasAdConsent() {
  return getCookieConsent() === 'all';
}

export function hasAnalyticsConsent() {
  return getCookieConsent() === 'all';
}

/** Sync Google Consent Mode v2 via dataLayer (works with GTM) */
export function applyConsentToDataLayer(choice) {
  if (typeof window === 'undefined') return;
  const granted = choice === 'all';
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  gtag('consent', 'update', {
    ad_storage: granted ? 'granted' : 'denied',
    ad_user_data: granted ? 'granted' : 'denied',
    ad_personalization: granted ? 'granted' : 'denied',
    analytics_storage: granted ? 'granted' : 'denied',
  });
}

/** Re-apply stored consent on page load (after GTM default deny) */
export function restoreCookieConsent() {
  const choice = getCookieConsent();
  if (choice) applyConsentToDataLayer(choice);
}
