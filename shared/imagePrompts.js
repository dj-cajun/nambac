/**
 * Image style suffix — Gemini writes scene prompts; we enforce layout + no-text guards.
 * Used by: quizImages pipeline, /api/generate-image fallback.
 *
 * v5.3: prompt diet (scene-first), Cover≠Result leads, brain collage / roast gag rules,
 * visual hierarchy + mobile thumbnail, Saigon Gen Z vibe, meme expression.
 * Quote sanitize keeps inner words (never facade nonsense).
 */
import { pickQuizStyle, prependStylePrompt } from './imageStyles.js';

export const NO_TEXT_RULES =
  'ABSOLUTELY NO text, letters, numbers, hangul, hanzi, kanji, Vietnamese words, logos, watermarks, or speech-bubble writing. Pure illustration only.';

/** Cover + results = one visual set */
export const QUIZ_SET_CONSISTENCY_RULES =
  'Same art style, line weight, and color grade as this quiz cover — only pose, prop, and setting change.';

/** @deprecated lean assembly no longer appends this by default */
export const RESULT_SCENE_RULES =
  'One seamless full-frame scene — no split panels, no divider lines.';

/** Roast / comedy energy when needed */
export const RESULT_FUN_RULES =
  'Exaggerated reaction, ironic prop gag, distinct from other results — never a bland stock portrait.';

/** @deprecated prefer MOBILE_THUMBNAIL_RULES */
export const RESULT_SHARE_RULES =
  'Bold saturated colors, punchy silhouette, viral share-card energy.';

/** Quiz result / fortune — one oversized hero prop */
export const RESULT_HERO_RULES =
  'Center-framed character + ONE oversized glowing hero prop from the topic. Setting matches the scene (not a generic alley).';

/** Roast blacklist — gag-first hero (still one dominant joke prop) */
export const ROAST_HERO_RULES =
  'Roast gag poster: center character caught mid-crime + ONE oversized comedy prop that sells the roast in a glance. Guilty/caught face, ironic metaphor, not a polite portrait.';

/** Brain mind X-ray — many small floating symbols */
export const MULTI_PROP_COLLAGE_RULES =
  'Brain collage: many small floating symbolic objects inside/around a glowing mind cross-section — NOT one oversized hero prop. Clear visual hierarchy (biggest = dominant theme), readable icons, breathing room.';

/** Alias — brain pipeline */
export const BRAIN_COLLAGE_RULES = MULTI_PROP_COLLAGE_RULES;

export const RESULT_GLOW_ACCENTS = [
  'subtle warm pink prop glow',
  'subtle violet prop glow',
  'subtle golden prop glow',
  'subtle teal prop glow',
  'subtle coral prop glow',
  'subtle lavender prop glow',
  'subtle lime prop glow',
  'subtle silver-blue prop glow',
];

/** Cover feed hook */
export const COVER_SHARE_RULES =
  'Scroll-stopping cover thumbnail: vibrant pop, dramatic light, mysterious hook — tap-worthy, not stock art.';

/**
 * Visual hierarchy — keeps frames clean and readable.
 * Primary / secondary / background roles.
 */
export const VISUAL_HIERARCHY_RULES =
  'Hierarchy: PRIMARY = character face and expression; SECONDARY = hero prop or collage icons; BACKGROUND = environment that only supports the joke — never compete with the face.';

/**
 * Mobile thumbnail / CTR — every image must land the punchline in one second on a phone.
 */
export const MOBILE_THUMBNAIL_RULES =
  'Every image must immediately communicate the joke, personality, and emotional punchline within one second of viewing on a mobile phone. Face and gag readable at ~120px; one dominant visual joke; no tiny props; no busy background clutter.';

/**
 * Saigon / Vietnam Gen Z lifestyle — atmosphere only, NEVER paint brand logos or shop names as text.
 */
export const SAIGON_GENZ_VIBE =
  'Saigon Gen Z life cues (no logos/text): Grab-green helmet energy, Highlands-style iced coffee cups, Circle K / FamilyMart aisle vibes, Nguyen Hue walking street, Vincom mall glow, Bui Vien night blur, TikTok phone light, compact apartment, motorbike rain — local and shareable.';

/** Meme / expression punch for viral cards */
export const MEME_EXPRESSION_RULES =
  'Meme face first: exaggerated eyes, brows, mouth — comedy manga reaction energy. The expression IS the punchline; props only amplify it.';

export const COVER_TEXT_FREE_LEAD =
  'TEXT-FREE QUIZ COVER ART ONLY — no letters, words, title banner, caption strip, or signage. App renders all text separately.';

export const RESULT_TEXT_FREE_LEAD =
  'TEXT-FREE RESULT SHARE-CARD — no letters, words, captions, headline banner, or signage. App renders all text separately.';

export const FLUX_COVER_TEXT_GUARD =
  'Negative: text, typography, letters, numbers, title banner, caption strip, Vietnamese words, hanzi, kanji, hangul, signage, neon text, shop names, speech bubbles, watermark.';

export const RESULT_NO_TEXT_BRIEF =
  'Zero glyphs in frame.';

export const QUESTION_SCENE_RULES =
  'Question scene: dilemma clear from visuals alone — characters, props, place. No question text or option labels in the image.';

export const QUESTION_NO_TEXT_BRIEF = 'Zero glyphs — no question or option text.';

export const FLUX_QUESTION_TEXT_GUARD =
  'Negative: text, letters, numbers, hanzi, kanji, hangul, question text, option text, captions, speech bubbles, signage, watermark.';

export const FLUX_RESULT_TEXT_GUARD =
  'Negative: text, typography, letters, numbers, hanzi, kanji, hangul, captions, caption strip, signage, neon text, shop names, speech bubbles, watermark, split panel.';

/** @deprecated */
export const COVER_NO_TEXT_RULES = RESULT_NO_TEXT_BRIEF;
/** @deprecated */
export const RESULT_NO_TEXT_RULES = RESULT_NO_TEXT_BRIEF;
/** @deprecated */
export const QUESTION_NO_TEXT_RULES = QUESTION_NO_TEXT_BRIEF;

const SIGNAGE_TRIGGER_RE =
  /\b(neon sign|shop sign|street sign|banner|poster|menu board|billboard|graffiti text|speech bubble|caption|subtitle|bottom caption|footer text|lower.?edge text|chinese characters?|hanzi|kanji|hangul|vietnamese text|written on|text on|sign saying|sign reads?|labeled|labelled|typography)\b[^.]*/gi;

const QUOTE_RE = /["'「」『』]([^"'「」『』]{1,120})["'「」『』]/g;

export function sanitizeResultScenePrompt(prompt) {
  let s = String(prompt || '').trim();
  s = s.replace(QUOTE_RE, '$1');
  s = s.replace(SIGNAGE_TRIGGER_RE, 'blank facade');
  return s.replace(/\s{2,}/g, ' ').trim();
}

/** @deprecated */
export const RESULT_LAYOUT_RULES = RESULT_SCENE_RULES;

export function finalizeImagePrompt(geminiPrompt) {
  const core = String(geminiPrompt || '').trim();
  if (!core) throw new Error('Empty image prompt');
  if (core.toLowerCase().includes('no text')) return core;
  return `${core} ${NO_TEXT_RULES}`;
}

const VIET_CHAR_RE = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ]/;

export function sanitizeCoverForImageModel(prompt) {
  let s = String(prompt || '').trim();
  s = s.split(/(?<=[.!?])\s+/).filter((line) => !VIET_CHAR_RE.test(line)).join(' ');
  s = s.replace(QUOTE_RE, '$1');
  s = s.replace(/Quiz cover establishing shot:[^.]*\./gi, 'Quiz cover establishing shot.');
  s = s.replace(/\b(quiz title|headline|title text|top banner|caption strip|subtitle)\b[^.]*/gi, '');
  return sanitizeResultScenePrompt(s).replace(/\s{2,}/g, ' ').trim();
}

function appendIfMissing(base, re, rule) {
  return re.test(base) ? base : `${base} ${rule}`;
}

export function finalizeCoverImagePrompt(geminiPrompt, { quiz } = {}) {
  const styled = quiz ? prependStylePrompt(pickQuizStyle(quiz), geminiPrompt) : geminiPrompt;
  const core = sanitizeCoverForImageModel(styled);
  if (!core) throw new Error('Empty cover image prompt');
  let base = core;
  base = appendIfMissing(base, /Scroll-stopping cover thumbnail:/i, COVER_SHARE_RULES);
  base = appendIfMissing(base, /ONE oversized glowing hero prop from the topic/i, RESULT_HERO_RULES);
  base = appendIfMissing(base, /PRIMARY = character face/i, VISUAL_HIERARCHY_RULES);
  base = appendIfMissing(base, /within one second of viewing on a mobile phone/i, MOBILE_THUMBNAIL_RULES);
  const set = quiz ? ` ${QUIZ_SET_CONSISTENCY_RULES}` : '';
  return `${COVER_TEXT_FREE_LEAD} ${base}${set} ${FLUX_COVER_TEXT_GUARD}`;
}

export function finalizeQuestionImagePrompt(geminiPrompt, { quiz } = {}) {
  const styled = quiz ? prependStylePrompt(pickQuizStyle(quiz), geminiPrompt) : geminiPrompt;
  const core = sanitizeResultScenePrompt(styled);
  if (!core) throw new Error('Empty question image prompt');
  let base = core;
  base = appendIfMissing(base, /situation|dilemma|question scene/i, QUESTION_SCENE_RULES);
  base = appendIfMissing(base, /PRIMARY = character face/i, VISUAL_HIERARCHY_RULES);
  base = appendIfMissing(base, /within one second of viewing on a mobile phone/i, MOBILE_THUMBNAIL_RULES);
  return `${RESULT_TEXT_FREE_LEAD} ${base} ${FLUX_QUESTION_TEXT_GUARD}`;
}

/**
 * Result / share-card images — scene-first, lean rules.
 * @param {'hero'|'roast'|'collage'|'auto'} [opts.propMode='auto']
 */
export function finalizeResultImagePrompt(
  geminiPrompt,
  { resultCode = 0, quizTitle = '', category = '', quiz, propMode = 'auto' } = {},
) {
  const style = quiz ? pickQuizStyle(quiz) : null;
  const styled = style ? prependStylePrompt(style, geminiPrompt) : geminiPrompt;
  const core = sanitizeResultScenePrompt(styled);
  if (!core) throw new Error('Empty result image prompt');

  const cat = String(category || '').toLowerCase();
  const mode =
    propMode === 'auto'
      ? cat === 'brain'
        ? 'collage'
        : cat === 'roast'
          ? 'roast'
          : 'hero'
      : propMode;

  let base = core;

  if (mode === 'collage') {
    base = appendIfMissing(base, /Brain collage:|mind cross-section/i, BRAIN_COLLAGE_RULES);
  } else if (mode === 'roast') {
    base = appendIfMissing(base, /Roast gag poster:/i, ROAST_HERO_RULES);
  } else {
    base = appendIfMissing(base, /ONE oversized glowing hero prop from the topic/i, RESULT_HERO_RULES);
  }

  base = appendIfMissing(base, /PRIMARY = character face/i, VISUAL_HIERARCHY_RULES);
  base = appendIfMissing(base, /within one second of viewing on a mobile phone/i, MOBILE_THUMBNAIL_RULES);
  base = appendIfMissing(base, /Meme face first:/i, MEME_EXPRESSION_RULES);
  base = appendIfMissing(base, /Saigon Gen Z life cues/i, SAIGON_GENZ_VIBE);

  const accent = RESULT_GLOW_ACCENTS[((resultCode % 8) + 8) % 8];
  const bits = [];
  if (style) bits.push(`Same style as cover (${style.label}).`);
  if (quiz) bits.push(QUIZ_SET_CONSISTENCY_RULES);
  const accentLine = bits.length
    ? `Result ${resultCode}: ${accent}. ${bits.join(' ')}`
    : `Result ${resultCode}: ${accent}.`;

  // Lead + scene/rules + accent + negative only (no third no-text paragraph)
  return `${RESULT_TEXT_FREE_LEAD} ${base} ${accentLine} ${FLUX_RESULT_TEXT_GUARD}`;
}

/** @deprecated */
export const STYLE_BASE =
  'Japanese manga anime illustration, clean ink linework, screentone shading, expressive eyes, dynamic composition.';

export const RESULT_STYLE_BASE =
  'Ultra-vibrant comedy manga, bold outlines, caricatured meme face, saturated colors, viral share-card polish.';

export function coverPrompt({ title, description, category, id } = {}) {
  const quiz = { id, title, category };
  return finalizeCoverImagePrompt(
    'Quiz cover: character plus one glowing hero prop symbolizing the topic. Background matches the topic. Zero typography.',
    { quiz },
  );
}

export function resultPrompt({ title, description, quizTitle, category, resultCode = 0, id } = {}) {
  const mood = [title, description].filter(Boolean).join('. ');
  const quiz = { id, title: quizTitle, category };
  const accent = RESULT_GLOW_ACCENTS[((resultCode % 8) + 8) % 8];
  return finalizeResultImagePrompt(
    `Result ${resultCode}: mood from ${sanitizeResultScenePrompt(mood)}. ONE oversized glowing hero prop with ${accent}. Unique setting.`,
    { resultCode, quizTitle, category, quiz },
  );
}

export function questionPrompt({ questionText, optionA, optionB, quizTitle, category, id }) {
  const quiz = { id, title: quizTitle, category };
  return finalizeQuestionImagePrompt(
    'Question scene — show the dilemma with actions and props only, zero readable text.',
    { quiz },
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
      resultCode: extra.resultCode ?? 0,
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
