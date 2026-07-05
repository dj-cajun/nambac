/**
 * Quiz text generation — single source of truth (Gemini).
 * MASTER prompt + scoring + DB formatting live here only.
 */
import { normalizeCategory, QUIZ_CATEGORY_IDS } from './categories.js';
import { QUIZ_EXPERT_PROMPTS, QUIZ_TOPIC_SEEDS } from './quizExpertPrompts.js';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

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

export async function generateQuizContent({ apiKey, categoryId, customTopic = '' }) {
  if (!apiKey) throw new Error('GEMINI_API_KEY or VITE_GEMINI_API_KEY not configured');

  const category = normalizeCategory(categoryId);
  const systemInstruction = buildQuizSystemInstruction(category);
  const userPrompt = buildQuizUserPrompt(category, customTopic);

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${systemInstruction}\n\n${userPrompt}` }] }],
      generationConfig: {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gemini failed (${response.status})`);
  }

  const data = await response.json();
  let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const match = text.match(/\{[\s\S]*\}/);
  if (match) text = match[0];

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = JSON.parse(text.replace(/,\s*([}\]])/g, '$1'));
  }

  parsed.category = category;
  return parsed;
}

export function pickDailyCategory() {
  const day = Math.floor(Date.now() / 86_400_000);
  return QUIZ_CATEGORY_IDS[day % QUIZ_CATEGORY_IDS.length];
}
