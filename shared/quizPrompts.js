/**
 * Quiz text generation — single source of truth (Gemini → OpenRouter fallback).
 * MASTER prompt + scoring + DB formatting live here only.
 */
import { normalizeCategory, QUIZ_CATEGORY_IDS } from './categories.js';
import { QUIZ_EXPERT_PROMPTS, QUIZ_TOPIC_SEEDS } from './quizExpertPrompts.js';
import { MBTI_TYPES, MBTI_DIMENSIONS } from './personalityArchetypes.js';
import { generateJsonViaLlm, parseJsonFromLlm } from './llmJson.js';

/** Q1 B=+4, Q2 B=+2, Q3 B=+1, Q4/Q5 B=0 — 3-bit binary scoring */
export const BINARY_5Q_SCORES = Object.freeze([
  [0, 4],
  [0, 2],
  [0, 1],
  [0, 0],
  [0, 0],
]);

/** Golden quiz reference — minimum Vietnamese character counts (binary_5q) */
export const QUIZ_RICHNESS_LIMITS = Object.freeze({
  titleMin: 35,
  descriptionMin: 70,
  questionMin: 55,
  optionMin: 60,
  resultTitleMin: 15,
  resultDescMin: 320,
  traitsCount: 3,
});

export const QUIZ_MASTER_PROMPT = `
# 🎮 MASTER Quiz Generation Prompt (v5.0 - Rich Content Standard)

## 🎯 Core Philosophy: "KING-BAD (킹받음) + Hyper-Localization + Rich Storytelling"
"재미없으면 죽음뿐. 무조건 베트남어(Vietnamese)로만 대답하십시오."
짧고 건조한 퀴즈는 **실패**입니다. 모든 문장은 구체적 상황 + Gen Z Sài Gòn 밈/슬랭 + 유머가 있어야 합니다.

> **Language Rule**: 모든 사용자 대면 텍스트는 **반드시 베트남어(Vietnamese)**.

## 📏 텍스트 길이 (STRICT MINIMUM — shorter = reject)
| 항목 | 최소 | 권장 | 스타일 |
| --- | --- | --- | --- |
| title | 35자 | 45~70자 | 훅 + 따옴표 슬랭 ('trà xanh', 'thả thính'…) |
| description | 70자 | 90~130자 | 티저 + (괄호 한 방) |
| question_text | 55자 | 70~110자 | **미니 시나리오**: 장소(The Alley, Zalo, Quận 1) + 갈등 + "Bạn sẽ làm gì?" |
| option_a / option_b | 60자 | 70~115자 | 행동/대사 + **(괄호 펀치라인)** 필수 |
| type_name (결과 제목) | 15자 | 18~35자 | 아키타입: 'Thánh Lầy' ẩn mình, 'Thánh Thả Thính' chuyên nghiệp |
| description (결과) | 320자 | 420~550자 | **4~5문장**: ①아키타입 ②주변 반응 ③팩폭 ④조언/경고 |
| traits | 3개 | 3개 | 각 1~3단어 (Hài hước, Bí ẩn, Dè dặt) |

## ✍️ Rich Writing Rules (golden quiz quality)
1. **Every option** contains a punchline in parentheses: (Cao thủ ẩn mình là đây!), (Rồi sau đó... tính sau!)
2. Use **quoted slang**: 'thả thính', 'cưa đổ', 'thảo mai', 'flop', 'sống ảo', 'toxic'
3. Name **local brands/places**: The Alley, Grab, Zalo, TikTok, Quận 1, Thảo Điền, bánh mì, trà chanh
4. Result descriptions: start with "Bạn là…", plot twist ("Crush tưởng… nhưng thực ra…"), end with roast/advice
5. Never generic one-liners. Never bare "A"/"B" labels.

## ⚠️ 필수
1. 2지선다 (A/B) only — option_a / option_b는 **완전한 베트남어 문장**
2. 호치민 로컬 디테일 필수
3. **category 필드**: EXPERT가 지정한 id와 **완전히 동일한 문자열**만 사용

## 🔢 3-Bit Scoring
- Q1 B=+4, Q2 B=+2, Q3 B=+1, Q4/Q5 B=+0, A=0
- results 8개, score 0~7 (each score = unique archetype)

## 📝 JSON only (no markdown)
{
  "title": "[Vietnamese, rich hook]",
  "description": "[Vietnamese teaser with parenthetical punchline]",
  "category": "[EXACT category id from EXPERT directive]",
  "questions": [ ...5 items ... ],
  "results": [ ...8 items: score 0-7, type_name, description (320+ chars), traits [3 strings] ... ]
}
`;

export const GEMINI_CATEGORY_LIST = QUIZ_CATEGORY_IDS.join(', ');

export function getExpertPrompt(categoryId) {
  const category = normalizeCategory(categoryId);
  return QUIZ_EXPERT_PROMPTS[category] || QUIZ_EXPERT_PROMPTS.Personality;
}

export function getTopicSeed(categoryId) {
  const category = normalizeCategory(categoryId);
  return QUIZ_TOPIC_SEEDS[category] || QUIZ_TOPIC_SEEDS.Personality;
}

export function buildQuizSystemInstruction(categoryId) {
  const category = normalizeCategory(categoryId);
  const expertPrompt = getExpertPrompt(category);

  return `${QUIZ_MASTER_PROMPT}

## 🎭 EXPERT AGENT (ACTIVE CATEGORY: ${category})
${expertPrompt}

STRICT RULES:
- Return ONLY valid JSON.
- All user-facing text in Vietnamese.
- Exactly 5 questions, exactly 8 results (scores 0-7).
- Meet ALL minimum character counts in the Rich Content table (v5.0).
- Each option_a and option_b MUST be a full Vietnamese phrase (never the letters "A" or "B" alone).
- Each option MUST include a parenthetical punchline (…).
- Each result description MUST be 320+ Vietnamese characters with 4+ sentences.
- Each result MUST have exactly 3 traits.
- The JSON field "category" MUST be exactly: "${category}"
- Do NOT use fun, fortune, personality, trend or any other category string.
- Allowed category ids (for reference only): ${GEMINI_CATEGORY_LIST}
`;
}

export function buildQuizUserPrompt(categoryId, customTopic = '') {
  const category = normalizeCategory(categoryId);
  const topicSeed = getTopicSeed(category);

  return customTopic?.trim()
    ? `Write a RICH, story-driven quiz in category "${category}". User topic: ${customTopic.trim()}. Match golden nambac quality: long situational questions, options with (parenthetical punchlines), 320+ char result descriptions. Remember: "category": "${category}"`
    : `Write a RICH, story-driven quiz in category "${category}". Topic direction: ${topicSeed}. Match golden nambac quality: mini-scenarios (Zalo, crush, The Alley, Grab), options with (punchlines), 8 unique archetype results with 320+ char descriptions. Remember: "category": "${category}"`;
}

function isPlaceholderOption(text) {
  const t = text?.trim();
  return !t || /^[ABab]$/.test(t);
}

/**
 * Normalize Gemini JSON → DB payload. Enforces binary_5q scores; never falls back to "A"/"B".
 */
export function formatQuizForDb(geminiData) {
  const results = Array.from({ length: 8 }, (_, i) => {
    const found = (geminiData.results || []).find(
      (r) => (r.score ?? r.result_code) === i,
    ) || geminiData.results?.[i];
    return {
      result_code: i,
      title: found?.type_name || found?.title || `Level ${i}`,
      type_name: found?.type_name || found?.title || null,
      description: found?.description || '',
      traits: Array.isArray(found?.traits) ? found.traits : [],
    };
  });

  const rawQuestions = (geminiData.questions || []).slice(0, 5);
  const questions = rawQuestions.map((q, i) => {
    const [score_a, score_b] = BINARY_5Q_SCORES[i] || [0, 0];
    const option_a = q.option_a?.trim() || '';
    const option_b = q.option_b?.trim() || '';

    if (isPlaceholderOption(option_a) || isPlaceholderOption(option_b)) {
      console.warn(`formatQuizForDb: Q${i + 1} has placeholder options — needs manual fix or regeneration`);
    }

    return {
      order_number: i + 1,
      question_text: q.question_text?.trim() || '',
      option_a,
      option_b,
      score_a,
      score_b,
    };
  });

  return {
    title: String(geminiData.title || '').trim() || 'Quiz mới nambac',
    description: String(geminiData.description || geminiData.title || '').trim(),
    category: normalizeCategory(geminiData.category),
    quiz_type: 'binary_5q',
    questions,
    results,
  };
}

function hasPunchlineOption(text) {
  return /\([^)]{4,}\)/.test(String(text || ''));
}

function validateQuizRichness(payload) {
  const errors = [];
  const L = QUIZ_RICHNESS_LIMITS;

  if ((payload.title?.trim().length || 0) < L.titleMin) {
    errors.push(`title too short (min ${L.titleMin} chars)`);
  }
  if ((payload.description?.trim().length || 0) < L.descriptionMin) {
    errors.push(`description too short (min ${L.descriptionMin} chars)`);
  }

  payload.questions.forEach((q, i) => {
    const qLen = q.question_text?.trim().length || 0;
    if (qLen < L.questionMin) {
      errors.push(`Q${i + 1}: question too short (${qLen} < ${L.questionMin})`);
    }
    for (const [key, label] of [['option_a', 'A'], ['option_b', 'B']]) {
      const opt = q[key]?.trim() || '';
      if (opt.length < L.optionMin) {
        errors.push(`Q${i + 1} option ${label}: too short (${opt.length} < ${L.optionMin})`);
      }
      if (!hasPunchlineOption(opt)) {
        errors.push(`Q${i + 1} option ${label}: missing (parenthetical punchline)`);
      }
    }
  });

  payload.results.forEach((r, i) => {
    const title = (r.type_name || r.title || '').trim();
    const desc = r.description?.trim() || '';
    if (title.length < L.resultTitleMin) {
      errors.push(`Result ${i}: title too short (${title.length} < ${L.resultTitleMin})`);
    }
    if (desc.length < L.resultDescMin) {
      errors.push(`Result ${i}: description too short (${desc.length} < ${L.resultDescMin})`);
    }
    const traits = Array.isArray(r.traits) ? r.traits.filter(Boolean) : [];
    if (traits.length < L.traitsCount) {
      errors.push(`Result ${i}: need ${L.traitsCount} traits, got ${traits.length}`);
    }
  });

  return errors;
}

/** Returns validation errors (empty array = OK for publish) */
export function validateQuizPayload(payload) {
  const errors = [];
  if (!payload.title?.trim()) errors.push('empty title');
  if (payload.questions.length !== 5) errors.push(`expected 5 questions, got ${payload.questions.length}`);
  if (payload.results.length !== 8) errors.push(`expected 8 results, got ${payload.results.length}`);

  payload.questions.forEach((q, i) => {
    if (!q.question_text?.trim()) errors.push(`Q${i + 1}: empty question`);
    if (isPlaceholderOption(q.option_a) || isPlaceholderOption(q.option_b)) {
      errors.push(`Q${i + 1}: placeholder option_a/option_b`);
    }
  });

  if (payload.quiz_type !== 'mbti_12q') {
    errors.push(...validateQuizRichness(payload));
  }

  return errors;
}

export async function generateQuizContent({ apiKey, openrouterKey, categoryId, customTopic = '' }) {
  const category = normalizeCategory(categoryId);
  const systemInstruction = buildQuizSystemInstruction(category);
  const userPrompt = buildQuizUserPrompt(category, customTopic);

  const maxAttempts = 2;
  let lastErrors = [];

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const retryHint = attempt > 1
      ? `\n\nRETRY: Previous output failed validation: ${lastErrors.join('; ')}. Write LONGER, RICHER Vietnamese text.`
      : '';

    const { text } = await generateJsonViaLlm({
      geminiKey: apiKey,
      openrouterKey,
      system: systemInstruction,
      user: userPrompt + retryHint,
      temperature: attempt > 1 ? 0.85 : 0.9,
      maxOutputTokens: 8192,
      label: 'quiz-content',
    });

    const parsed = parseJsonFromLlm(text);
    parsed.category = category;
    const payload = formatQuizForDb(parsed);
    lastErrors = validateQuizPayload(payload);
    if (lastErrors.length === 0) return parsed;
  }

  throw new Error(`Quiz failed richness validation: ${lastErrors.join('; ')}`);
}

export function pickDailyCategory() {
  const day = Math.floor(Date.now() / 86_400_000);
  return QUIZ_CATEGORY_IDS[day % QUIZ_CATEGORY_IDS.length];
}

const MBTI_12Q_EXTRA = `
## MBTI 12Q mode (this request only)
- Exactly **12** questions: 3 each for dimensions EI, SN, TF, JP (in that order).
- Each question JSON must include "dimension": "EI" | "SN" | "TF" | "JP".
- option_a = first letter (E/S/T/J), option_b = second letter (I/N/F/P).
- score_a and score_b are always 0 (MBTI uses dimension voting, not binary weights).
- Exactly **16** results — one per MBTI type. Each result needs "mbti_code": "ENFP" etc.
- Result title MUST contain the 4-letter code (e.g. "INFP — Dreamer Thảo Điền").
- Scores on results are NOT used; use result order matching mbti_code list.
`;

/**
 * @param {import('./personalityArchetypes.js').PERSONALITY_ARCHETYPES[0]} archetype
 */
export function buildArchetypeUserPrompt(archetype) {
  return `Create a viral Vietnamese quiz for nambac.xyz.

GitHub topic reference: ${archetype.githubTopic}
Archetype: ${archetype.label}
Quiz type: ${archetype.quiz_type}
Category JSON field MUST be exactly: "${archetype.category}"

Topic direction:
${archetype.topicPrompt}

Result framework:
${archetype.resultFramework}

Make it King-bad + Ho Chi Minh localized (Grab, Zalo, Thao Dien, Quận 1, TikTok).
Rich content standard v5.0: long situational questions (70+ chars), options with (punchlines), result descriptions 320+ chars with 4+ sentences, 3 traits each.`;
}

export function formatMbtiQuizForDb(geminiData, category) {
  const rawQuestions = (geminiData.questions || []).slice(0, 12);
  const questions = rawQuestions.map((q, i) => {
    const dim = q.dimension || MBTI_DIMENSIONS[Math.floor(i / 3)] || 'EI';
    return {
      order_number: i + 1,
      question_text: q.question_text?.trim() || '',
      option_a: q.option_a?.trim() || '',
      option_b: q.option_b?.trim() || '',
      score_a: 0,
      score_b: 0,
      dimension: dim,
    };
  });

  const results = MBTI_TYPES.map((code, i) => {
    const found =
      (geminiData.results || []).find(
        (r) =>
          r.mbti_code === code ||
          r.title?.toUpperCase().includes(code) ||
          r.type_name?.toUpperCase().includes(code),
      ) || geminiData.results?.[i];
    const baseTitle = found?.type_name || found?.title || code;
    const title = baseTitle.toUpperCase().includes(code)
      ? baseTitle
      : `${code} — ${baseTitle}`;
    return {
      result_code: i,
      title,
      type_name: title,
      description: found?.description || '',
      traits: Array.isArray(found?.traits) ? found.traits : [],
    };
  });

  return {
    title: String(geminiData.title || '').trim() || 'Quiz MBTI mới',
    description: String(geminiData.description || geminiData.title || '').trim(),
    category: normalizeCategory(category),
    quiz_type: 'mbti_12q',
    questions,
    results,
  };
}

/**
 * Generate quiz from GitHub-style archetype (Admin factory).
 * @param {{ apiKey: string, archetype: object }} opts
 */
export async function generateArchetypeQuizContent({ apiKey, openrouterKey, archetype }) {
  if (!archetype) throw new Error('archetype required');

  const category = normalizeCategory(archetype.category);
  let systemInstruction = buildQuizSystemInstruction(category);
  if (archetype.quiz_type === 'mbti_12q') {
    systemInstruction = systemInstruction.replace(
      'Exactly 5 questions, exactly 8 results (scores 0-7).',
      'Exactly 12 questions, exactly 16 results (MBTI types).',
    );
    systemInstruction += MBTI_12Q_EXTRA;
  }

  const userPrompt = buildArchetypeUserPrompt(archetype);
  const maxAttempts = archetype.quiz_type === 'mbti_12q' ? 1 : 2;
  let lastErrors = [];

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const retryHint = attempt > 1
      ? `\n\nRETRY: Previous output failed validation: ${lastErrors.join('; ')}. Write LONGER, RICHER Vietnamese text.`
      : '';

    const { text } = await generateJsonViaLlm({
      geminiKey: apiKey,
      openrouterKey,
      system: systemInstruction,
      user: userPrompt + retryHint,
      temperature: attempt > 1 ? 0.85 : 0.88,
      maxOutputTokens: 8192,
      label: 'archetype-quiz',
    });

    const parsed = parseJsonFromLlm(text);
    parsed.category = category;

    if (archetype.quiz_type === 'mbti_12q') {
      return formatMbtiQuizForDb(parsed, category);
    }

    const formatted = formatQuizForDb(parsed);
    formatted.quiz_type = 'binary_5q';
    formatted.category = category;
    lastErrors = validateQuizPayload(formatted);
    if (lastErrors.length === 0) return formatted;
  }

  throw new Error(`Archetype quiz failed richness validation: ${lastErrors.join('; ')}`);
}

export function validateArchetypePayload(payload, quizType = 'binary_5q') {
  if (quizType === 'mbti_12q') {
    const errors = [];
    if (!payload.title?.trim()) errors.push('empty title');
    if (payload.questions.length !== 12) errors.push(`expected 12 questions, got ${payload.questions.length}`);
    if (payload.results.length !== 16) errors.push(`expected 16 results, got ${payload.results.length}`);
    payload.questions.forEach((q, i) => {
      if (!q.dimension) errors.push(`Q${i + 1}: missing dimension`);
      if (!q.question_text?.trim()) errors.push(`Q${i + 1}: empty question`);
    });
    return errors;
  }
  return validateQuizPayload(payload);
}
