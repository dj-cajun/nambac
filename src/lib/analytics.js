/**
 * GTM / GA4 event tracking via dataLayer
 */

const ATTRIBUTION_KEY = 'nambac_attribution_v1';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

function readUtmFromSearch(search = '') {
  const out = {};
  try {
    const params = new URLSearchParams(search || '');
    UTM_KEYS.forEach((key) => {
      const value = params.get(key);
      if (value) out[key] = value;
    });
  } catch {
    // ignore parse errors
  }
  return out;
}

function getAttributionContext() {
  if (typeof window === 'undefined') return {};

  const currentUtm = readUtmFromSearch(window.location.search);
  const hasCurrent = Object.keys(currentUtm).length > 0;

  try {
    if (hasCurrent) {
      const payload = {
        ...currentUtm,
        landing_path: window.location.pathname,
        landing_at: new Date().toISOString(),
        referrer: document.referrer || '',
      };
      sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(payload));
      return payload;
    }

    const saved = sessionStorage.getItem(ATTRIBUTION_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // storage may be unavailable
  }

  return hasCurrent ? currentUtm : {};
}

export function trackEvent(eventName, params = {}) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    page_path: window.location.pathname,
    ...getAttributionContext(),
    ...params,
  });
}

export function trackQuizStart(quizId, category) {
  trackEvent('quiz_start', { quiz_id: quizId, quiz_category: category || '' });
}

export function trackQuizComplete(quizId, score, category) {
  trackEvent('quiz_complete', {
    quiz_id: quizId,
    result_score: score,
    quiz_category: category || '',
  });
}

export function trackShare(platform, quizId, score) {
  trackEvent('share_zalo', {
    share_platform: platform,
    quiz_id: quizId,
    result_score: score ?? '',
  });
}

export function trackCompatStart(quizId, friendScore, myScore) {
  trackEvent('compat_start', {
    quiz_id: quizId,
    friend_score: friendScore,
    my_score: myScore,
  });
}

export function trackFortuneView(kind = 'love') {
  trackEvent('fortune_view', { fortune_kind: kind });
}

export function trackFortuneReveal(kind = 'love') {
  trackEvent('fortune_reveal', { fortune_kind: kind });
}

export function trackFortuneShare(kind = 'love') {
  trackEvent('fortune_share', { fortune_kind: kind });
}

export function trackFortuneLike(kind = 'love') {
  trackEvent('fortune_like', { fortune_kind: kind });
}

export function trackFortuneDownload(kind = 'love') {
  trackEvent('fortune_download', { fortune_kind: kind });
}

/** Mini-app engagement (balance / roast / brain) */
export function trackFeatureView(kind) {
  trackEvent('feature_view', { feature_kind: kind });
}

export function trackFeatureEngage(kind, action) {
  trackEvent('feature_engage', { feature_kind: kind, feature_action: action });
}

export function trackFeatureShare(kind, platform = 'share') {
  trackEvent('feature_share', { feature_kind: kind, share_platform: platform });
}

export function trackPushPrompt(action) {
  trackEvent('push_prompt', { push_action: action });
}

export function trackAdImpression(location, slot) {
  trackEvent('ad_impression', { ad_location: location || '', ad_slot: slot || '' });
}
