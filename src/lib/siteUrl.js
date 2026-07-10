import { CANONICAL_SITE_ORIGIN, normalizeSiteOrigin } from '../../shared/siteOrigin.js';

/** Site origin for share links — prefer live window origin, else canonical www. */
const FALLBACK_ORIGIN = normalizeSiteOrigin(
  import.meta.env.VITE_SITE_URL || CANONICAL_SITE_ORIGIN,
);

export function getSiteOrigin() {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return FALLBACK_ORIGIN;
}

export function buildShareUrl(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${getSiteOrigin()}${normalized}`;
}

export function getOgDefaultImageUrl() {
  return `${getSiteOrigin()}/og-default.png`;
}

/** Composed OG card — full quiz/result image (title via og:title meta) */
export function buildOgImageUrl(quizId, score = null) {
  const params = new URLSearchParams({ path: 'og-image', quizId });
  if (score !== null && score !== undefined && score !== '') {
    params.set('score', String(score));
  }
  return `${getSiteOrigin()}/api/handler?${params}`;
}

/** Roast blacklist share OG — dark card with friend name + crime */
export function buildRoastOgImageUrl(name, traitId) {
  if (import.meta.env.DEV) {
    const devQ = new URLSearchParams({ name: String(name).trim(), trait: traitId });
    return `${getSiteOrigin()}/api/roast-og?${devQ}`;
  }
  const params = new URLSearchParams({ path: 'roast-og', name: String(name).trim(), trait: traitId });
  return `${getSiteOrigin()}/api/handler?${params}`;
}

/** Balance Quiz share OG — scene image + question + picked A/B */
export function buildBalanceOgImageUrl(questionId, choice = null) {
  const side = choice === 'a' ? 'A' : choice === 'b' ? 'B' : '';
  if (import.meta.env.DEV) {
    const devQ = new URLSearchParams({ q: questionId });
    if (side) devQ.set('voted', side);
    return `${getSiteOrigin()}/api/balance-og?${devQ}`;
  }
  const params = new URLSearchParams({ path: 'balance-og', q: questionId });
  if (side) params.set('voted', side);
  return `${getSiteOrigin()}/api/handler?${params}`;
}

/** Brain (What's in your head) OG — scene image + "Não {name}" callout + result panel */
export function buildBrainOgImageUrl(resultId, name = '') {
  const who = String(name || '').trim();
  if (import.meta.env.DEV) {
    const devQ = new URLSearchParams({ name: who, result: resultId });
    return `${getSiteOrigin()}/api/brain-og?${devQ}`;
  }
  const params = new URLSearchParams({ path: 'brain-og', name: who, result: resultId });
  return `${getSiteOrigin()}/api/handler?${params}`;
}

/** Fortune result OG — same handler pattern as quiz */
export function buildFortuneOgImageUrl(name, fortuneIndex, dateLabel) {
  const params = new URLSearchParams({
    path: 'fortune-og',
    name: String(name).trim(),
    idx: String(fortuneIndex),
    date: dateLabel,
  });
  if (import.meta.env.DEV) {
    const devQ = new URLSearchParams({
      name: String(name).trim(),
      idx: String(fortuneIndex),
      date: dateLabel,
    });
    return `${getSiteOrigin()}/api/fortune-og?${devQ}`;
  }
  return `${getSiteOrigin()}/api/handler?${params}`;
}
