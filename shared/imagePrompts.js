/**
 * Image style suffix — Gemini writes scene prompts; we enforce layout + no-text guards.
 * Used by: quizImages pipeline, /api/generate-image fallback.
 */

export const NO_TEXT_RULES =
  'ABSOLUTELY NO text, NO letters, NO numbers, NO Korean hangul, NO Chinese hanzi 中文, NO Japanese kanji, NO Vietnamese words, NO logos, NO watermarks, NO speech bubbles with writing. Pure illustration only.';

/** Result/share image — one natural full scene; app shows answer text below the image */
export const RESULT_SCENE_RULES =
  'Single natural manga illustration — one unified scene with seamless background. NO vertical split, NO divider line, NO empty half-panel, NO hard edge separating left and right. Character and environment blend naturally across the full frame. The app displays answer text separately below the image.';

/** Result comedy / personality roast visual energy */
export const RESULT_FUN_RULES =
  'Comedy manga punchline energy: exaggerated facial expression, dramatic pose, speed lines, sweat drops, sparkle or doom aura, ironic prop gag, visual metaphor for this personality roast. Feel like a viral Vietnamese meme quiz result — never a bland standing portrait or stock pose. Include 1–2 hyper-specific props tied to the quiz theme (Saigon motorbike chaos, plastic stools, iced coffee, tropical plants, messy room) when it fits. Each result must look distinctly different from the other seven.';

/** Result/cover — scroll-stopping share-card look (Zalo/FB story) */
export const RESULT_SHARE_RULES =
  'Share-card thumbnail energy: bold saturated colors, cinematic rim lighting, soft sparkle bokeh, lens flare accents, high contrast, punchy silhouette readable at phone size — premium viral quiz aesthetic people want to screenshot and post on Zalo/Facebook story. Flashy and magnetic, NOT flat slice-of-life or generic anime poster.';

/** Match the quiz cover formula — glowing hero prop poster shot */
export const RESULT_HERO_RULES =
  'SAME visual formula as the quiz cover thumbnail: center-framed character, ONE oversized hero prop from the quiz theme glowing with neon-pink/magenta aura and sparkle particles, cinematic golden-hour or neon alley lighting, wet reflective Saigon street or trendy cafe floor, premium poster composition — NOT a generic standing portrait, NOT a muted indoor scene, NOT slice-of-life without a glowing focal prop.';

/** Per-result accent so 8 answers look distinct */
export const RESULT_GLOW_ACCENTS = [
  'hot pink and magenta neon glow',
  'electric purple and violet aura',
  'sunset orange and gold rim light',
  'mint cyan and teal sparkle',
  'coral red and warm amber glow',
  'lavender and soft pink bokeh',
  'lime green and yellow accent pop',
  'deep blue and silver starlight shimmer',
];

export const COVER_SHARE_RULES =
  'Scroll-stopping mobile quiz cover: vibrant color pop, dramatic lighting, mysterious hook composition, premium feed thumbnail — makes people tap immediately. Flashy and share-worthy, not generic stock art.';

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

/** Question images — show the situation, never bake question text into the art */
export function finalizeQuestionImagePrompt(geminiPrompt) {
  const core = sanitizeResultScenePrompt(geminiPrompt);
  if (!core) throw new Error('Empty question image prompt');
  let base = core;
  if (!/situation|dilemma|visually clear|question scene/i.test(base)) base = `${base} ${QUESTION_SCENE_RULES}`;
  return `${base} ${QUESTION_NO_TEXT_RULES} ${FLUX_QUESTION_TEXT_GUARD}`;
}

/** Result images — natural full scene, zero typography in art */
export function finalizeResultImagePrompt(geminiPrompt, { resultCode = 0, quizTitle = '', category = '' } = {}) {
  const core = sanitizeResultScenePrompt(geminiPrompt);
  if (!core) throw new Error('Empty result image prompt');
  let base = core;
  if (!/unified|seamless|no vertical split|no divider/i.test(base)) base = `${base} ${RESULT_SCENE_RULES}`;
  if (!/glowing hero prop|neon.*glow|same visual formula as.*cover|premium poster/i.test(base)) {
    base = `${base} ${RESULT_HERO_RULES}`;
  }
  if (!/comedy|exaggerat|punchline|meme|roast|speed line|prop gag/i.test(base)) base = `${base} ${RESULT_FUN_RULES}`;
  if (!/share-card|screenshot|viral|sparkle|rim light|scroll-stopping/i.test(base)) base = `${base} ${RESULT_SHARE_RULES}`;
  const accent = RESULT_GLOW_ACCENTS[((resultCode % 8) + 8) % 8];
  const themeHint = [quizTitle, category].filter(Boolean).join(' — ');
  const accentLine = themeHint
    ? `Result ${resultCode} for "${themeHint}": hero prop radiates ${accent}; wildly different pose and setting from the other seven results.`
    : `Result ${resultCode}: hero prop radiates ${accent}; unique pose and setting.`;
  return `${base} ${accentLine} ${RESULT_NO_TEXT_RULES} ${FLUX_RESULT_TEXT_GUARD}`;
}

/** @deprecated Fallback when Gemini prompts unavailable */
export const STYLE_BASE =
  'Japanese manga anime illustration, clean ink linework, screentone shading, expressive eyes, dynamic composition.';

/** Result images — bolder comedy manga look */
export const RESULT_STYLE_BASE =
  'Ultra-vibrant comedy manga illustration, bold ink outlines, halftone screentones, dramatic foreshortening, caricatured expressive face, neon-accent saturated colors, sparkle particles, visual humor, meme-quiz roast energy, dynamic action pose, instagram-story share-card polish.';

export function coverPrompt({ title, description, category }) {
  const theme = [title, description, category].filter(Boolean).join('. ');
  return finalizeImagePrompt(
    `${RESULT_STYLE_BASE} ${COVER_SHARE_RULES} Quiz cover establishing shot: ${theme}. Unique environment and props matching this exact topic — dramatic, colorful, tap-worthy thumbnail.`,
  );
}

export function resultPrompt({ title, description, quizTitle, category, resultCode = 0 }) {
  const mood = [title, description].filter(Boolean).join('. ');
  const theme = [quizTitle, category].filter(Boolean).join(' — ');
  const accent = RESULT_GLOW_ACCENTS[((resultCode % 8) + 8) % 8];
  return finalizeResultImagePrompt(
    `${RESULT_STYLE_BASE} Premium share-card poster for quiz "${theme}" result ${resultCode}. Center-framed character with over-the-top roast reaction (mood: ${mood}). Character holds or interacts with ONE oversized glowing hero prop from the quiz theme — ${accent} on the prop, sparkle particles, wet reflective ground, cinematic alley or cafe lighting exactly like the quiz cover thumbnail quality. Exaggerated face and prop gag — NOT bland portrait, NOT dark dusty room, NOT muted slice-of-life.`,
    { resultCode, quizTitle, category },
  );
}

export function questionPrompt({ questionText, optionA, optionB, quizTitle, category }) {
  const quizContext = [quizTitle, category].filter(Boolean).join(' — ');
  return finalizeQuestionImagePrompt(
    `${STYLE_BASE} Quiz "${quizContext}" — question scene (visual storytelling ONLY, zero readable text in image). Scene meaning reference — never paint these words: ${questionText}. Show the dilemma visually between "${optionA}" and "${optionB}" through character actions, props, and sign-free environment.`,
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
