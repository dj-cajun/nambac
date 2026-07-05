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

export const QUIZ_MASTER_PROMPT = `
# 🎮 MASTER Quiz Generation Prompt (v4.0 - King-Bad Upgrade)

## 🎯 Core Philosophy: "KING-BAD (킹받음) + Hyper-Localization"
"재미없으면 죽음뿐. 무조건 베트남어(Vietnamese)로만 대답하십시오."

> **Language Rule**: 모든 사용자 대면 텍스트는 **반드시 베트남어(Vietnamese)**.

## 📏 텍스트 길이 (STRICT)
| 항목 | 권장 |
| --- | --- |
| 질문 | 30~40자, 구체적 상황 |
| 선택지 A/B | 15~25자, 점수/성향 노출 금지 — **절대 "A"/"B" 라벨만 쓰지 말 것** |
| 결과 설명 | 80~100자 |
| 결과 제목 | 10~20자 |

## ⚠️ 필수
1. 2지선다 (A/B) only — option_a / option_b는 **완전한 베트남어 문장**
2. 호치민 로컬 (Grab, bánh mì, Quận 1, Thao Điền…)
3. **category 필드**: EXPERT가 지정한 id와 **완전히 동일한 문자열**만 사용

## 🔢 3-Bit Scoring
- Q1 B=+4, Q2 B=+2, Q3 B=+1, Q4/Q5 B=0, A=0
- results 8개, score 0~7

## 📝 JSON only (no markdown)
{
  "title": "[Vietnamese]",
  "description": "[Vietnamese]",
  "category": "[EXACT category id from EXPERT directive]",
  "questions": [ ...5 items with question_text, option_a, option_b, score_a, score_b ... ],
  "results": [ ...8 items with score 0-7, type_name, description, traits ... ]
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
- Each option_a and option_b MUST be a full Vietnamese phrase (never the letters "A" or "B" alone).
- The JSON field "category" MUST be exactly: "${category}"
- Do NOT use fun, fortune, personality, trend or any other category string.
- Allowed category ids (for reference only): ${GEMINI_CATEGORY_LIST}
`;
}

export function buildQuizUserPrompt(categoryId, customTopic = '') {
  const category = normalizeCategory(categoryId);
  const topicSeed = getTopicSeed(category);

  return customTopic?.trim()
    ? `Write a quiz in category "${category}". User topic: ${customTopic.trim()}. Remember: "category": "${category}"`
    : `Write a quiz in category "${category}". Topic direction: ${topicSeed}. Remember: "category": "${category}"`;
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

  return errors;
}

export async function generateQuizContent({ apiKey, openrouterKey, categoryId, customTopic = '' }) {
  const category = normalizeCategory(categoryId);
  const systemInstruction = buildQuizSystemInstruction(category);
  const userPrompt = buildQuizUserPrompt(category, customTopic);

  const { text } = await generateJsonViaLlm({
    geminiKey: apiKey,
    openrouterKey,
    system: systemInstruction,
    user: userPrompt,
    temperature: 0.9,
    maxOutputTokens: 8192,
    label: 'quiz-content',
  });

  const parsed = parseJsonFromLlm(text);
  parsed.category = category;
  return parsed;
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

Make it King-bad + Ho Chi Minh localized (Grab, Zalo, Thao Dien, Quận 1, TikTok).`;
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

  const { text } = await generateJsonViaLlm({
    geminiKey: apiKey,
    openrouterKey,
    system: systemInstruction,
    user: userPrompt,
    temperature: 0.88,
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
  return formatted;
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
