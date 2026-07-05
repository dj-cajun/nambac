import { normalizeCategory, QUIZ_CATEGORY_IDS } from './categories.js';
import { QUIZ_EXPERT_PROMPTS, QUIZ_TOPIC_SEEDS } from '../../src/lib/quizExpertPrompts.js';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const MASTER_PROMPT = `
# MASTER Quiz Generation (Daily Cron)
- All user-facing text: Vietnamese only
- Exactly 5 binary (A/B) questions, 8 results (scores 0-7)
- Q1 B=+4, Q2 B=+2, Q3 B=+1, Q4/Q5 B=0
- HCMC local humor (Grab, bánh mì, Quận 1…)
- Return ONLY valid JSON, no markdown
`;

function getApiKey() {
  return process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
}

export function pickDailyCategory() {
  const day = Math.floor(Date.now() / 86_400_000);
  return QUIZ_CATEGORY_IDS[day % QUIZ_CATEGORY_IDS.length];
}

export async function generateQuizContent(categoryId, customTopic = '') {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('GEMINI_API_KEY or VITE_GEMINI_API_KEY not configured');

  const category = normalizeCategory(categoryId);
  const expertPrompt = QUIZ_EXPERT_PROMPTS[category] || QUIZ_EXPERT_PROMPTS.Personality;
  const topicSeed = QUIZ_TOPIC_SEEDS[category] || QUIZ_TOPIC_SEEDS.Personality;

  const systemInstruction = `${MASTER_PROMPT}

## EXPERT (${category})
${expertPrompt}

STRICT: "category" must be exactly "${category}"
`;

  const userPrompt = customTopic?.trim()
    ? `Quiz category "${category}". Topic: ${customTopic.trim()}`
    : `Quiz category "${category}". Direction: ${topicSeed}`;

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${systemInstruction}\n\n${userPrompt}` }] }],
      generationConfig: {
        temperature: 0.9,
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

  return {
    title: geminiData.title,
    description: geminiData.description || geminiData.title,
    category: normalizeCategory(geminiData.category),
    quiz_type: 'binary_5q',
    questions: (geminiData.questions || []).slice(0, 5).map((q, i) => ({
      order_number: i + 1,
      question_text: q.question_text || '',
      option_a: q.option_a || 'A',
      option_b: q.option_b || 'B',
      score_a: q.score_a ?? 0,
      score_b: q.score_b ?? 0,
    })),
    results,
  };
}
