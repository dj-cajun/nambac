/**
 * Image style suffix — Gemini writes scene prompts; we enforce layout + no-text guards.
 * Used by: quizImages pipeline, /api/generate-image fallback.
 */

export const NO_TEXT_RULES =
  'ABSOLUTELY NO text, NO letters, NO numbers, NO Korean hangul, NO Chinese hanzi 中文, NO Japanese kanji, NO Vietnamese words, NO logos, NO watermarks, NO speech bubbles with writing. Pure illustration only.';

/** Result/share image — one natural full scene; app shows answer text below the image */
export const RESULT_SCENE_RULES =
  'Single natural manga illustration — one unified scene with seamless background. NO vertical split, NO divider line, NO empty half-panel, NO hard edge separating left and right. Character and environment blend naturally across the full frame. The app displays answer text separately below the image.';

/** Stricter no-text for answer/result images (text is rendered by the app UI) */
export const RESULT_NO_TEXT_RULES =
  'CRITICAL — answer/result image must be 100% text-free: zero glyphs anywhere. Forbidden: captions, subtitles, shop signs, neon lettering, street signs, market banners, phone or laptop screens showing UI, books/newspapers/menus with readable content, posters, t-shirts with slogans, license plates, speech bubbles, Latin alphabet, Vietnamese diacritics, Korean hangul, Japanese kana/kanji, Chinese hanzi (中文), numbers, emoji text, watermarks. Use sign-free streets, blank shop facades, turned-away phones, closed books, abstract wall art with NO readable symbols. Illustration only — the app adds answer text below.';

/** Question scene — situation must read clearly without typography in the image */
export const QUESTION_SCENE_RULES =
  'Question scene: the situation in the question must be instantly clear from visuals alone — show the exact dilemma, place, action, and mood through characters, props, and environment. Like a manga panel that makes viewers understand what is being asked. Do NOT draw the question sentence or options as text in the image; the app shows question text separately below.';

/** Extra guard appended to every result prompt for Flux */
export const FLUX_RESULT_TEXT_GUARD =
  'Negative: text, typography, letters, numbers, Chinese characters, hanzi 中文, kanji, hangul, captions, signage, neon text, shop names, speech bubbles, watermark, split panel, divider line.';

/** Strip common phrases that make Flux render CJK/Latin glyphs in result art */
const TEXT_TRIGGER_PATTERNS = [
  /\b(neon sign|shop sign|street sign|banner|poster|menu board|billboard|graffiti text|speech bubble|caption|subtitle|chinese characters?|hanzi|kanji|hangul|vietnamese text|written on|text on|sign saying|sign reads?|labeled|labelled|typography)\b[^.]*/gi,
  /["'「」『』][^"'「」『』]{2,80}["'「」『』]/g,
];

export function sanitizeResultScenePrompt(prompt) {
  let s = String(prompt || '').trim();
  for (const re of TEXT_TRIGGER_PATTERNS) {
    s = s.replace(re, 'sign-free blank walls and props with no readable writing');
  }
  return s.replace(/\s{2,}/g, ' ').trim();
}

/** @deprecated use RESULT_SCENE_RULES */
export const RESULT_LAYOUT_RULES = RESULT_SCENE_RULES;

export function finalizeImagePrompt(geminiPrompt) {
  const core = String(geminiPrompt || '').trim();
  if (!core) throw new Error('Empty image prompt');
  if (core.toLowerCase().includes('no text')) return core;
  return `${core} ${NO_TEXT_RULES}`;
}

/** Question images — show the situation, never bake question text into the art */
export function finalizeQuestionImagePrompt(geminiPrompt) {
  const core = String(geminiPrompt || '').trim();
  if (!core) throw new Error('Empty question image prompt');
  let out = core;
  if (!/situation|dilemma|visually clear|question scene/i.test(out)) out = `${out} ${QUESTION_SCENE_RULES}`;
  if (!/no text|pure illustration/i.test(out)) out = `${out} ${NO_TEXT_RULES}`;
  return out;
}

/** Result images — natural full scene, zero typography in art */
export function finalizeResultImagePrompt(geminiPrompt) {
  const core = sanitizeResultScenePrompt(geminiPrompt);
  if (!core) throw new Error('Empty result image prompt');
  let base = core;
  if (!/unified|seamless|no vertical split|no divider/i.test(base)) base = `${base} ${RESULT_SCENE_RULES}`;
  // Always append — never skip even if Gemini already mentioned "no text"
  return `${base} ${RESULT_NO_TEXT_RULES} ${FLUX_RESULT_TEXT_GUARD}`;
}

/** @deprecated Fallback when Gemini prompts unavailable */
export const STYLE_BASE =
  'Japanese manga anime illustration, clean ink linework, screentone shading, expressive eyes, dynamic composition.';

export function coverPrompt({ title, description, category }) {
  const theme = [title, description, category].filter(Boolean).join('. ');
  return finalizeImagePrompt(
    `${STYLE_BASE} Quiz cover establishing shot: ${theme}. Unique environment and props matching this exact topic.`,
  );
}

export function resultPrompt({ title, description, quizTitle, category }) {
  const mood = [title, description].filter(Boolean).join('. ');
  const theme = [quizTitle, category].filter(Boolean).join(' — ');
  return finalizeResultImagePrompt(
    `${STYLE_BASE} Result personality scene for quiz theme "${theme}". Express this outcome through character expression, pose, props and environment only (mood: ${mood}). Do NOT render quiz titles, result names, or any words as visible text, signs, or screens. One natural full-frame manga illustration with seamless sign-free background.`,
  );
}

export function questionPrompt({ questionText, optionA, optionB, quizTitle, category }) {
  const quizContext = [quizTitle, category].filter(Boolean).join(' — ');
  return finalizeQuestionImagePrompt(
    `${STYLE_BASE} Quiz "${quizContext}" — question scene showing this situation clearly: ${questionText}. Visual context between choices: ${optionA} vs ${optionB}.`,
  );
}

export function applyImageStyle(type, semanticText, extra = {}) {
  if (type === 'cover') {
    return coverPrompt({ title: semanticText, description: extra.description, category: extra.category });
  }
  if (type === 'result') {
    return resultPrompt({
      title: semanticText,
      description: extra.description,
      quizTitle: extra.quizTitle,
      category: extra.category,
    });
  }
  if (type === 'question') {
    return questionPrompt({
      questionText: semanticText,
      optionA: extra.optionA,
      optionB: extra.optionB,
      quizTitle: extra.quizTitle,
      category: extra.category,
    });
  }
  return finalizeImagePrompt(`${STYLE_BASE} ${semanticText}`);
}
