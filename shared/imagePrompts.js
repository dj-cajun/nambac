/**
 * Image style suffix — Gemini writes scene prompts; we enforce layout + no-text guards.
 * Used by: quizImages pipeline, /api/generate-image fallback.
 */
import { pickQuizStyle, prependStylePrompt } from './imageStyles.js';

export const NO_TEXT_RULES =
  'ABSOLUTELY NO text, NO letters, NO numbers, NO Korean hangul, NO Chinese hanzi 中文, NO Japanese kanji, NO Vietnamese words, NO logos, NO watermarks, NO speech bubbles with writing. Pure illustration only.';

/** Cover + all 8 results must look like one visual set (same renderer + grading). */
export const QUIZ_SET_CONSISTENCY_RULES =
  'Part of ONE quiz image set with the cover thumbnail: IDENTICAL art style, line weight, color grading, and lighting mood — only scene, pose, and hero prop change. Never switch rendering style (e.g. photoreal cover + anime result).';

/** Result/share image — one natural full scene; app shows answer text below the image */
export const RESULT_SCENE_RULES =
  'Single unified illustration scene with seamless background — style may be photoreal, comic, anime, or watercolor per assignment. NO vertical split, NO divider line, NO empty half-panel. Character and environment blend naturally across the full frame.';

/** Result comedy / personality roast visual energy (when comedy/action styles) */
export const RESULT_FUN_RULES =
  'Expressive personality roast energy: exaggerated reaction, dramatic pose, ironic prop gag, visual metaphor for this result — never a bland stock portrait. Include 1–2 props tied to THIS quiz topic. Each result must look distinctly different from the other seven.';

/** Result/cover — scroll-stopping share-card look (Zalo/FB story) */
export const RESULT_SHARE_RULES =
  'Share-card thumbnail energy: bold saturated colors, cinematic rim lighting, soft sparkle bokeh, lens flare accents, high contrast, punchy silhouette readable at phone size — premium viral quiz aesthetic people want to screenshot and post on Zalo/Facebook story. Flashy and magnetic, NOT flat slice-of-life or generic anime poster.';

/** Match the quiz cover formula — glowing hero prop poster shot (setting follows quiz topic) */
export const RESULT_HERO_RULES =
  'SAME visual formula as the quiz cover thumbnail: center-framed character, ONE oversized hero prop from the quiz theme glowing with colored aura and sparkle particles, premium poster composition. Background and lighting MUST match the specific quiz topic — pick a unique place from the prompt (home, office, school, beach, gym, fantasy realm, kitchen, concert, etc.). NEVER default to a generic narrow alley, wet pavement, shop-lined street, or cafe unless the quiz is explicitly about that place. NOT a bland standing portrait, NOT slice-of-life without a glowing focal prop.';

/** Per-result subtle prop accent — hue shift only, same palette as cover */
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

export const COVER_SHARE_RULES =
  'Scroll-stopping mobile quiz cover: vibrant color pop, dramatic lighting, mysterious hook composition, premium feed thumbnail — makes people tap immediately. Flashy and share-worthy, not generic stock art.';

/** Stricter no-text for quiz cover/intro thumbnails */
export const COVER_NO_TEXT_RULES =
  'CRITICAL — quiz cover must be 100% text-free: zero glyphs anywhere. Forbidden: quiz title, captions, subtitles, bottom caption strip, footer text band, shop signs, neon lettering, street signs, market banners, phone or tablet screens with UI or documents, books/menus with readable content, posters with slogans, speech bubbles, Latin alphabet, Vietnamese diacritics, Korean hangul, Japanese kana/kanji, Chinese hanzi (中文), numbers, emoji text, watermarks. Use environments without readable signage. Pure illustration only — the app shows quiz title separately.';

/** Lead/trail anchor — Flux weights start/end of prompt heavily */
export const COVER_TEXT_FREE_LEAD =
  'TEXT-FREE QUIZ COVER ART ONLY — absolutely no letters, no words, no quiz title, no headline banner, no caption strip, no subtitle bar, no signage, no typography anywhere in the frame. Pure illustration — the app renders all text separately.';

/** Extra guard appended to every cover prompt for Flux/Imagen */
export const FLUX_COVER_TEXT_GUARD =
  'Negative: text, typography, letters, numbers, words, title banner, top headline, bottom caption strip, subtitle bar, footer text band, Vietnamese words, Chinese characters, hanzi 中文, kanji, hangul, captions, signage, neon text, shop names, speech bubbles, tablet screen UI, spreadsheet, watermark.';

/** Stricter no-text for answer/result images (text is rendered by the app UI) */
export const RESULT_NO_TEXT_RULES =
  'CRITICAL — answer/result image must be 100% text-free: zero glyphs anywhere. Forbidden: captions, subtitles, bottom caption strip, footer text band, lower-edge hanzi watermark, shop signs, neon lettering, street signs, market banners, phone or laptop screens showing UI, books/newspapers/menus with readable content, posters, t-shirts with slogans, license plates, speech bubbles, Latin alphabet, Vietnamese diacritics, Korean hangul, Japanese kana/kanji, Chinese hanzi (中文), numbers, emoji text, watermarks. Frame must end with clean scenery (sky, floor, pavement) — never a text bar at the bottom. Use sign-free streets, blank shop facades, turned-away phones, closed books, abstract wall art with NO readable symbols. Illustration only — the app adds answer text below.';

/** Question scene — situation must read clearly without typography in the image */
export const QUESTION_SCENE_RULES =
  'Question scene: the situation must be instantly clear from visuals alone — show the exact dilemma, place, action, and mood through characters, props, and environment. Like a manga panel that makes viewers understand what is being asked. Do NOT draw the question sentence, options, captions, or any glyphs in the image; the app displays question text in a separate box below the image.';

/** Stricter no-text for question scene images */
export const QUESTION_NO_TEXT_RULES =
  'CRITICAL — question scene image must be 100% text-free: zero glyphs anywhere. Forbidden: question text, option labels A/B, captions, subtitles, bottom caption strip, footer text band, speech bubbles, shop signs, neon lettering, phone/laptop screens with UI, Chinese hanzi (中文), Japanese kanji, Korean hangul, Vietnamese words, Latin letters, numbers, watermarks. Show the dilemma through character pose, props, and environment only — never paint words. The app renders question and answers below the image.';

/** Extra guard appended to every question prompt for Flux */
export const FLUX_QUESTION_TEXT_GUARD =
  'Negative: text, typography, letters, numbers, Chinese characters, hanzi 中文, kanji, hangul, question text, option text, captions, bottom caption strip, speech bubbles, signage, watermark.';

/** Extra guard appended to every result prompt for Flux */
export const FLUX_RESULT_TEXT_GUARD =
  'Negative: text, typography, letters, numbers, Chinese characters, hanzi 中文, kanji, hangul, captions, bottom caption strip, white rounded caption box, subtitle bar, footer text band, lower-edge watermark, signage, neon text, shop names, speech bubbles, watermark, split panel, divider line.';

/** Strip common phrases that make Flux render CJK/Latin glyphs in result art */
const TEXT_TRIGGER_PATTERNS = [
  /\b(neon sign|shop sign|street sign|banner|poster|menu board|billboard|graffiti text|speech bubble|caption|subtitle|bottom caption|footer text|lower.?edge text|chinese characters?|hanzi|kanji|hangul|vietnamese text|written on|text on|sign saying|sign reads?|labeled|labelled|typography)\b[^.]*/gi,
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

/** Quiz cover/intro — strict zero typography in art */
const VIET_CHAR_RE = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ]/;

/** Strip strings that image models paint as on-image typography (especially quiz titles). */
export function sanitizeCoverForImageModel(prompt) {
  let s = String(prompt || '').trim();
  // Drop sentences containing Vietnamese — Flux renders them as headline text
  s = s.split(/(?<=[.!?])\s+/).filter((line) => !VIET_CHAR_RE.test(line)).join(' ');
  s = s.replace(/["'「」『』][^"'「」『』]{2,120}["'「」『』]/g, '');
  s = s.replace(/Quiz cover establishing shot:[^.]*\./gi, 'Quiz cover establishing shot.');
  s = s.replace(/\b(quiz title|headline|title text|top banner|caption strip|subtitle)\b[^.]*/gi, '');
  return sanitizeResultScenePrompt(s).replace(/\s{2,}/g, ' ').trim();
}

export function finalizeCoverImagePrompt(geminiPrompt, { quiz } = {}) {
  const styled = quiz ? prependStylePrompt(pickQuizStyle(quiz), geminiPrompt) : geminiPrompt;
  const core = sanitizeCoverForImageModel(styled);
  if (!core) throw new Error('Empty cover image prompt');
  let base = core;
  if (!/scroll-stopping|tap-worthy|feed thumbnail/i.test(base)) base = `${base} ${COVER_SHARE_RULES}`;
  if (!/glowing hero prop|hero prop|center-framed character|premium poster/i.test(base)) {
    base = `${base} ${RESULT_HERO_RULES}`;
  }
  return `${COVER_TEXT_FREE_LEAD} ${base} ${QUIZ_SET_CONSISTENCY_RULES} ${COVER_NO_TEXT_RULES} ${FLUX_COVER_TEXT_GUARD} ${COVER_TEXT_FREE_LEAD}`;
}

/** Question images — same quiz style when quiz ctx provided */
export function finalizeQuestionImagePrompt(geminiPrompt, { quiz } = {}) {
  const styled = quiz ? prependStylePrompt(pickQuizStyle(quiz), geminiPrompt) : geminiPrompt;
  const core = sanitizeResultScenePrompt(styled);
  if (!core) throw new Error('Empty question image prompt');
  let base = core;
  if (!/situation|dilemma|visually clear|question scene/i.test(base)) base = `${base} ${QUESTION_SCENE_RULES}`;
  return `${base} ${QUESTION_NO_TEXT_RULES} ${FLUX_QUESTION_TEXT_GUARD}`;
}

/** Result images — natural full scene, zero typography in art */
export function finalizeResultImagePrompt(geminiPrompt, { resultCode = 0, quizTitle = '', category = '', quiz } = {}) {
  const style = quiz ? pickQuizStyle(quiz) : null;
  const styled = style ? prependStylePrompt(style, geminiPrompt) : geminiPrompt;
  const core = sanitizeResultScenePrompt(styled);
  if (!core) throw new Error('Empty result image prompt');
  let base = core;
  if (!/unified|seamless|no vertical split|no divider/i.test(base)) base = `${base} ${RESULT_SCENE_RULES}`;
  if (!/glowing hero prop|hero prop|center-framed|premium poster/i.test(base)) {
    base = `${base} ${RESULT_HERO_RULES}`;
  }
  if (!/scroll-stopping|tap-worthy|feed thumbnail|share-card|rim light/i.test(base)) {
    base = `${base} ${COVER_SHARE_RULES}`;
  }
  const accent = RESULT_GLOW_ACCENTS[((resultCode % 8) + 8) % 8];
  const styleLine = style
    ? `SAME art style as quiz cover (${style.label}) — identical rendering, never switch style.`
    : '';
  const accentLine = `Result ${resultCode}: ${accent}; unique pose and setting — ${styleLine} ${QUIZ_SET_CONSISTENCY_RULES}`;
  return `${COVER_TEXT_FREE_LEAD} ${base} ${accentLine} ${RESULT_NO_TEXT_RULES} ${FLUX_RESULT_TEXT_GUARD}`;
}

/** @deprecated Fallback when Gemini prompts unavailable */
export const STYLE_BASE =
  'Japanese manga anime illustration, clean ink linework, screentone shading, expressive eyes, dynamic composition.';

/** Result images — bolder comedy manga look */
export const RESULT_STYLE_BASE =
  'Ultra-vibrant comedy manga illustration, bold ink outlines, halftone screentones, dramatic foreshortening, caricatured expressive face, neon-accent saturated colors, sparkle particles, visual humor, meme-quiz roast energy, dynamic action pose, instagram-story share-card polish.';

export function coverPrompt({ title, description, category, id } = {}) {
  const quiz = { id, title, category };
  return finalizeCoverImagePrompt(
    'Quiz cover illustration. Invent a vivid English-only scene: character plus one glowing hero prop that symbolizes the quiz topic through visuals alone. Background matches the topic — not a generic alley. Pure artwork — zero typography in the image.',
    { quiz },
  );
}

export function resultPrompt({ title, description, quizTitle, category, resultCode = 0, id } = {}) {
  const mood = [title, description].filter(Boolean).join('. ');
  const quiz = { id, title: quizTitle, category };
  const accent = RESULT_GLOW_ACCENTS[((resultCode % 8) + 8) % 8];
  return finalizeResultImagePrompt(
    `Result ${resultCode} share image — SAME visual set as quiz cover. Center-framed character with mood from: ${sanitizeResultScenePrompt(mood)}. ONE oversized glowing hero prop with ${accent}. Unique setting for this personality. NOT a different art style from the cover.`,
    { resultCode, quizTitle, category, quiz },
  );
}

export function questionPrompt({ questionText, optionA, optionB, quizTitle, category, id }) {
  const quiz = { id, title: quizTitle, category };
  return finalizeQuestionImagePrompt(
    `Question scene (visual storytelling ONLY, zero readable text in image). Show the dilemma visually through character actions and props — never paint question or option words.`,
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
