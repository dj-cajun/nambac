/**
 * GTM / GA4 event tracking via dataLayer
 */

export function trackEvent(eventName, params = {}) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    page_path: window.location.pathname,
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
