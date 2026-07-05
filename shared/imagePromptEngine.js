/**
 * LLM → per-item image prompts (Japanese manga style).
 * Gemini first; OpenRouter text model on quota/outage.
 * Default: cover + R0–R7 (9 images). Optional: Q1–Q5 when skipQuestions is false.
 */
import { generateJsonViaLlm, parseJsonFromLlm } from './llmJson.js';

const GEMINI_PROMPT_OUTPUT = `# Role: Japanese Manga Image Prompt Director

You write **English** image-generation prompts for an AI art model (Flux).
Every prompt must describe a **unique scene** — never reuse the same background, alley, or sunset.

## Visual style (include in EVERY prompt)
Japanese manga / anime illustration, clean ink linework, screentone shading, expressive eyes, dynamic panel composition, rich environmental detail.

## Content rules
- Read the Vietnamese quiz content and translate **meaning** into a concrete visual scene (props, place, action, mood).
- **Cover**: scroll-stopping mobile thumbnail — vibrant color pop, dramatic lighting, mysterious hook, premium feed aesthetic people want to tap and share.
{{QUESTION_RULES}}- **Result i** (answer/share image — MUST match cover thumbnail quality):
  - **Cover-formula poster shot**: centered character + ONE oversized hero prop from the quiz theme glowing with neon aura and sparkle particles, cinematic golden-hour alley or trendy cafe, wet reflective ground — identical premium energy to the cover, NOT a generic portrait.
  - **Comedy roast panel** — exaggerated expression, dramatic pose, ironic prop gag tied to result i personality.
  - **Share-card energy** — bold saturated colors, rim light, lens flare, high contrast; screenshot-worthy on Zalo/Facebook.
  - One unified manga scene — NO vertical split, NO empty half, NO dark dusty indoor room, NO muted slice-of-life without a glowing prop.
  - **ZERO text in image**: no captions, signs, subtitles, speech bubbles, letters, numbers, logos, or writing in ANY language — especially NO Chinese hanzi (中文), Japanese kanji, Korean hangul, Vietnamese, or English.
  - **NO bottom caption strip** — Flux often adds hanzi/footer text at the lower edge; the frame must end with clean illustration only (sky, floor, scenery), never a text band.
  - Saigon street scenes must use **blank shop facades** — never neon signs, market banners, or readable menus.
  - Quiz result **title/description are mood references only** — never instruct the image model to draw those words as signage, phone UI, or labels.
  - **Each result 0–7 must look wildly different** — unique setting, pose, prop gag, and color mood per result; never reuse the same alley, sunset, or cafe.
- Global: no watermarks.

## Output
Return ONLY valid JSON (no markdown):
{{OUTPUT_SCHEMA}}`;

const QUESTION_RULES = `- **Question i** (question scene image):
  - The viewer must instantly understand **what situation is being asked** — show the dilemma, place, action, and mood from the question_text field through characters and environment alone.
  - Make the question **visually obvious** (like a manga story panel before the punchline).
  - **ZERO text in image**: no question sentence, no option labels, no captions, subtitles, speech bubbles, letters, numbers, logos, or writing in ANY language — especially NO Chinese hanzi (中文), Japanese kanji, Korean hangul, Vietnamese, or English.
  - **NO bottom caption strip** — never a text band at the lower edge; end with clean illustration only.
  - Do NOT render the question sentence, options, or any captions as typography in the image — the app displays question text in a box below the image.
  - You MAY show visual storytelling (gestures, props, setting) that answers "what is this question about?"
`;

function buildImagePromptSystem(skipQuestions) {
  return GEMINI_PROMPT_OUTPUT.replace(
    '{{QUESTION_RULES}}',
    skipQuestions ? '' : QUESTION_RULES,
  ).replace(
    '{{OUTPUT_SCHEMA}}',
    skipQuestions
      ? `{
  "cover": "80-150 word English prompt",
  "results": ["prompt for result 0", "...", "prompt for result 7"]
}`
      : `{
  "cover": "80-150 word English prompt",
  "questions": ["prompt for Q1", "prompt for Q2", "prompt for Q3", "prompt for Q4", "prompt for Q5"],
  "results": ["prompt for result 0", "...", "prompt for result 7"]
}`,
  );
}

function buildImagePromptUserPayload(quiz, skipQuestions) {
  return {
    quiz_title: quiz.title,
    quiz_description: quiz.description,
    category: quiz.category,
    ...(skipQuestions
      ? {}
      : {
          questions: (quiz.questions || []).slice(0, 5).map((q, i) => ({
            number: i + 1,
            question_text: q.question_text,
            option_a: q.option_a,
            option_b: q.option_b,
          })),
        }),
    results: (quiz.results || []).slice(0, 8).map((r) => ({
      result_code: r.result_code ?? r.score ?? 0,
      title: r.title || r.type_name,
      description: r.description,
    })),
  };
}

function normalizePromptList(list, expected, label) {
  if (!Array.isArray(list) || list.length !== expected) {
    throw new Error(`${label}: expected ${expected} prompts, got ${list?.length ?? 0}`);
  }
  return list.map((p, i) => {
    const s = String(p || '').trim();
    if (s.length < 40) throw new Error(`${label}[${i}]: prompt too short`);
    return s;
  });
}

function parseImagePromptResponse(parsed, skipQuestions) {
  const cover = String(parsed.cover || '').trim();
  if (cover.length < 40) throw new Error('cover prompt too short');

  return {
    cover,
    questions: skipQuestions ? [] : normalizePromptList(parsed.questions, 5, 'questions'),
    results: normalizePromptList(parsed.results, 8, 'results'),
  };
}

/**
 * @param {{ geminiKey?: string, openrouterKey?: string, quiz: object, skipQuestions?: boolean }} opts
 * @returns {Promise<{ cover: string, questions: string[], results: string[], provider: string }>}
 */
export async function generateQuizImagePrompts({
  geminiKey,
  openrouterKey,
  quiz,
  skipQuestions = true,
}) {
  const userPayload = buildImagePromptUserPayload(quiz, skipQuestions);
  const system = buildImagePromptSystem(skipQuestions);
  const questionStrict = skipQuestions
    ? ''
    : `
STRICT for every "questions" prompt you write:
- English prompt text only; describe visuals, never quote Vietnamese/Chinese strings for the image model to paint as text.
- Never mention shop signs, neon text, menus, phone screens with UI, speech bubbles, question text, option labels, or readable writing.
- NO bottom caption strip — Flux often paints hanzi/footer text on the lower edge.
- Ho Chi Minh settings: generic cafes/streets with NO readable signage.`;
  const user = `Quiz data (Vietnamese — translate to unique visual scenes):
${JSON.stringify(userPayload, null, 2)}
${questionStrict}
STRICT for "cover" prompt:
- Scroll-stopping mobile thumbnail — vibrant, dramatic lighting, tap-worthy, share-worthy; not generic or flat.

STRICT for every "results" prompt you write:
- English prompt text only; describe visuals, never quote Vietnamese/Chinese strings for the image model to paint as text.
- MUST use cover-formula: centered character + glowing neon hero prop from quiz theme + golden-hour/neon alley + sparkle + wet reflective ground.
- Comedy roast + share-card energy — exaggerated face, dynamic pose; never bland portrait or dark muted indoor scene.
- Center-weighted unified scene — NOT split panel, NOT empty half-frame.
- Never mention shop signs, neon text, menus, phone screens with UI, speech bubbles, or readable writing.
- NO bottom caption strip — end with clean floor/sky only.
- Each result 0–7: different hero prop pose, glow color accent, and setting.
- Ho Chi Minh settings: generic cafes/streets with NO readable signage.`;

  const { text, provider } = await generateJsonViaLlm({
    geminiKey,
    openrouterKey,
    system,
    user,
    temperature: 0.85,
    maxOutputTokens: 8192,
    label: 'image-prompts',
  });

  const parsed = parseJsonFromLlm(text);
  return { ...parseImagePromptResponse(parsed, skipQuestions), provider };
}

/** @deprecated use generateQuizImagePrompts */
export async function generateQuizImagePromptsViaGemini({ apiKey, quiz, skipQuestions = true }) {
  const result = await generateQuizImagePrompts({
    geminiKey: apiKey,
    quiz,
    skipQuestions,
  });
  const { provider: _p, ...prompts } = result;
  return prompts;
}
