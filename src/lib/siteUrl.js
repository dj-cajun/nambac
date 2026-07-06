/** Site origin for share links — works on vercel.app until nambac.xyz is restored */

const FALLBACK_ORIGIN = import.meta.env.VITE_SITE_URL || 'https://nambac.vercel.app';

export function getSiteOrigin() {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return FALLBACK_ORIGIN.replace(/\/$/, '');
}

export function buildShareUrl(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${getSiteOrigin()}${normalized}`;
}

export function getOgDefaultImageUrl() {
  return `${getSiteOrigin()}/og-default.png`;
}

/** Composed OG card (image + quiz title + answer + #tags) */
export function buildOgImageUrl(quizId, score = null) {
  const params = new URLSearchParams({ route: 'og-image', quizId });
  if (score !== null && score !== undefined && score !== '') {
    params.set('score', String(score));
  }
  return `${getSiteOrigin()}/api/handler?${params}`;
}
