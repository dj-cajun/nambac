/**
 * Image generation style — Vietnamese HCMC vibe, zero text in image.
 * Used by: /api/generate-image, Admin imagen.js, backfill script.
 */

export const NO_TEXT_RULES =
  'ABSOLUTELY NO text, NO letters, NO numbers, NO Korean hangul, NO Vietnamese words, NO logos, NO watermarks, NO speech bubbles with writing. Pure illustration only.';

export const STYLE_BASE =
  'Vietnamese Gen Z manhwa digital illustration, Ho Chi Minh City aesthetic, vibrant pink and tropical colors, clean line art, cinematic lighting, masterpiece quality.';

/** Structured cover prompt (preferred for backfill / Admin) */
export function coverPrompt({ title, description, category }) {
  const theme = [title, description, category].filter(Boolean).join('. ');
  return `${STYLE_BASE} Quiz cover artwork about: ${theme}. Saigon street culture, youthful energy. ${NO_TEXT_RULES}`;
}

/** Structured result portrait prompt */
export function resultPrompt({ title, description }) {
  const traits = [title, description].filter(Boolean).join('. ');
  return `${STYLE_BASE} Single character portrait on the LEFT side of frame. Personality: ${traits}. ${NO_TEXT_RULES}`;
}

/**
 * Wrap short semantic text from clients (legacy API type=cover|result).
 * Prefer coverPrompt/resultPrompt when structured fields are available.
 */
export function applyImageStyle(type, semanticText) {
  const semantic = semanticText?.trim() || 'Saigon Gen Z youth quiz mood';
  if (type === 'cover') {
    return `${STYLE_BASE} Quiz cover artwork about: ${semantic}. Saigon street culture, youthful energy. ${NO_TEXT_RULES}`;
  }
  if (type === 'result') {
    return `${STYLE_BASE} Single character portrait on the LEFT side of frame. Personality: ${semantic}. ${NO_TEXT_RULES}`;
  }
  return `${STYLE_BASE} ${semantic}. ${NO_TEXT_RULES}`;
}
