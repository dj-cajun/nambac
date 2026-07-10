import { sbtiCodeSlug } from '../../../shared/vbti/imagePrompts.js';

export function typePosterSrc(code) {
  const slug = sbtiCodeSlug(code);
  return `/images/sbti_${slug}.webp`;
}

export function typePosterFallbackSrc(code) {
  const safe = encodeURIComponent(code);
  return `/vbti/types/${safe}.svg`;
}
