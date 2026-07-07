/**
 * Per-quiz visual style — cover + all 8 results share ONE art direction (a set).
 * Different quizzes get different styles (deterministic from quiz id/title).
 */

/** @typedef {{ id: string, label: string, labelKo: string, prompt: string }} VisualStyle */

/** @type {VisualStyle[]} */
export const VISUAL_STYLES = [
  {
    id: 'photoreal',
    labelKo: '실사 시네마',
    label: 'Cinematic photorealistic',
    prompt:
      'Cinematic photorealistic live-action still, DSLR depth of field, natural skin texture, realistic lighting and shadows, editorial movie-poster framing, ultra-detailed environment — NOT cartoon, NOT anime.',
  },
  {
    id: 'comic_book',
    labelKo: '미국 코믹북',
    label: 'American comic book',
    prompt:
      'American superhero comic book art, bold black ink outlines, Ben-Day halftone dots, dynamic foreshortening, saturated primary colors, Jack Kirby energy — NOT anime, NOT photoreal.',
  },
  {
    id: 'shonen_anime',
    labelKo: '일본 액션 애니',
    label: 'Shonen action anime',
    prompt:
      'Japanese shonen action anime key visual, clean cel shading, speed lines, dramatic low-angle pose, vibrant contrast, spiky dynamic energy — NOT photoreal, NOT soft shoujo.',
  },
  {
    id: 'shoujo_romance',
    labelKo: '순정 만화',
    label: 'Shoujo romance manga',
    prompt:
      'Japanese shoujo romance manga illustration, soft pastel palette, flower and sparkle motifs, large expressive eyes, delicate linework, dreamy bokeh, emotional atmosphere — NOT action hero, NOT photoreal.',
  },
  {
    id: 'action_hero',
    labelKo: '액션 히어로',
    label: 'Action superhero poster',
    prompt:
      'Blockbuster action superhero poster art, muscular dynamic pose, cape or power aura, epic rim light, smoke and debris, IMAX one-sheet composition — NOT slice-of-life, NOT shoujo soft pastel.',
  },
  {
    id: 'comedy_manga',
    labelKo: '코미디 만화',
    label: 'Comedy manga meme',
    prompt:
      'Ultra-vibrant comedy manga meme panel, exaggerated caricature face, sweat drops and speed lines, halftone screentones, viral roast energy, punchline prop gag — NOT photoreal, NOT romantic soft focus.',
  },
  {
    id: 'watercolor',
    labelKo: '수채 일러스트',
    label: 'Watercolor editorial',
    prompt:
      'Hand-painted watercolor editorial illustration, soft paper texture, bleeding pigment edges, gentle color washes, artistic magazine cover feel — NOT comic ink, NOT 3D render.',
  },
  {
    id: 'cyberpunk_neon',
    labelKo: '사이버펑크 네온',
    label: 'Cyberpunk neon',
    prompt:
      'Cyberpunk neon sci-fi illustration, holographic glow accents, rain-slick reflective surfaces, magenta and cyan palette, futuristic props — NOT pastoral watercolor, NOT shoujo flowers.',
  },
];

function hashString(s) {
  let h = 2166136261;
  const str = String(s || '');
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function quizSeed(quiz = {}) {
  return quiz.id || `${quiz.title || ''}:${quiz.category || ''}` || 'nambac-default';
}

/** One visual identity per quiz — cover + results 0–7 all use this. */
export function pickQuizStyle(quiz = {}) {
  const idx = hashString(quizSeed(quiz)) % VISUAL_STYLES.length;
  return VISUAL_STYLES[idx];
}

/** @deprecated alias */
export const pickCoverStyle = pickQuizStyle;

/** Same style as cover — results are one set with the quiz. */
export function pickResultStyle(quiz = {}, _resultCode = 0) {
  return pickQuizStyle(quiz);
}

export function buildQuizStylePlan(quiz = {}) {
  const style = pickQuizStyle(quiz);
  return { style, cover: style, results: Array.from({ length: 8 }, () => style) };
}

export function prependStylePrompt(style, scenePrompt) {
  const core = String(scenePrompt || '').trim();
  if (!style?.prompt) return core;
  const styleId = style.id.replace(/_/g, ' ');
  if (new RegExp(styleId.replace(/\s+/g, '|'), 'i').test(core)) return core;
  if (/photoreal|comic book|shonen|shoujo|superhero|watercolor|cyberpunk|comedy manga/i.test(core)) {
    return core;
  }
  return `${style.prompt} ${core}`;
}

export function stylePaletteForLlm() {
  return VISUAL_STYLES.map((s) => `- ${s.id} (${s.label}): ${s.prompt}`).join('\n');
}

export function stylePlanForLlm(quiz = {}) {
  const style = pickQuizStyle(quiz);
  return {
    quiz_visual_style_id: style.id,
    quiz_visual_style_label: style.label,
    rule: 'Use this EXACT art style for cover AND every result 0–7. Vary scene, pose, and props — never change art style mid-quiz.',
  };
}
