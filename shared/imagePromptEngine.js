/**
 * LLM → per-item image prompts with per-quiz visual style (one set per quiz).
 */
import { generateJsonViaLlm, parseJsonFromLlm } from './llmJson.js';
import { stylePaletteForLlm, stylePlanForLlm } from './imageStyles.js';

const GEMINI_PROMPT_OUTPUT = `# Role: Quiz Image Prompt Director

You write **English** image-generation prompts for an AI art model.
Each **quiz** gets ONE assigned art style (see style_plan) — cover + all results 0–7 MUST use that **same style** (one visual set).
Different quizzes may use different styles from the palette below.

## Style palette (assigned per quiz — do not mix styles within one quiz)
{{STYLE_PALETTE}}

## Scene rules
Every prompt must describe a **unique scene** — never reuse the same background template.
**NEVER default to**: narrow alley, wet pavement, shop-lined street, golden-hour cafe — unless the quiz topic is explicitly about that place.

## Content rules
- Read the Vietnamese quiz content and translate **meaning** into a concrete visual scene (props, place, action, mood).
- **Cover**: scroll-stopping mobile thumbnail. Background from quiz topic — not a generic alley.
{{QUESTION_RULES}}- **Result i** (answer/share image):
  - **SAME art style as cover** — identical rendering style (photoreal OR comic OR anime OR shoujo OR etc.), only scene/pose/prop changes.
  - Centered character + ONE oversized hero prop from the quiz theme glowing with colored aura.
  - **Unique setting per result** — different place/pose/prop per result 0–7, but **same art style throughout the quiz**.
  - **ZERO text in image**: no captions, signs, subtitles, speech bubbles, letters, numbers, logos, or writing in ANY language.
  - **NO bottom caption strip** — frame ends with clean illustration only (sky, floor, scenery).

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
  return GEMINI_PROMPT_OUTPUT.replace('{{STYLE_PALETTE}}', stylePaletteForLlm())
    .replace(
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
    style_plan: stylePlanForLlm(quiz),
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
- Never mention shop signs, neon text, menus, phone screens with UI, speech bubbles, or readable writing.
- NO bottom caption strip — end with clean floor/sky only.
- Outdoor street scenes: blank facades only — no readable signage.`;
  const user = `Quiz data (Vietnamese — translate to unique visual scenes):
${JSON.stringify(userPayload, null, 2)}
${questionStrict}
STRICT for "cover" prompt:
- Begin with the assigned style from style_plan.quiz_visual_style_id — same style for entire quiz set.
- Scroll-stopping mobile thumbnail; 100% English only — NEVER paste quiz_title or Vietnamese text.
- ZERO typography in image. Background from quiz topic — not a generic alley.

STRICT for every "results" prompt you write:
- **SAME art style AND color grading as cover** (style_plan) — one visual set per quiz. Vary scene, pose, prop only — NOT rendering style, NOT lighting mood shift.
- English only; never quote Vietnamese/Chinese for the image model to paint.
- Centered character + glowing hero prop. Unique setting per result 0–7.
- Never mention shop signs, speech bubbles, or readable writing. NO bottom caption strip.
- Result title/description are mood references only — never draw as text.
- Do NOT add comedy-manga roast energy or neon palette shifts unless the assigned style_plan is comedy_manga.`;

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
