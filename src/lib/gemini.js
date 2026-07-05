import {
  normalizeCategory,
  GEMINI_CATEGORY_LIST,
  getExpertPrompt,
  getTopicSeed,
} from '../constants/categories';

/**
 * Gemini quiz generation — category-locked to QUIZ_CATEGORY_IDS (8 Expert agents)
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const MASTER_PROMPT = `
# 🎮 MASTER Quiz Generation Prompt (v4.0 - King-Bad Upgrade)

## 🎯 Core Philosophy: "KING-BAD (킹받음) + Hyper-Localization"
"재미없으면 죽음뿐. 무조건 베트남어(Vietnamese)로만 대답하십시오."

> **Language Rule**: 모든 사용자 대면 텍스트는 **반드시 베트남어(Vietnamese)**.

## 📏 텍스트 길이 (STRICT)
| 항목 | 권장 |
| --- | --- |
| 질문 | 30~40자, 구체적 상황 |
| 선택지 A/B | 15~25자, 점수/성향 노출 금지 |
| 결과 설명 | 80~100자 |
| 결과 제목 | 10~20자 |

## ⚠️ 필수
1. 2지선다 (A/B) only
2. 호치민 로컬 (Grab, bánh mì, Quận 1, Thao Điền…)
3. **category 필드**: 아래 EXPERT가 지정한 id와 **완전히 동일한 문자열**만 사용

## 🔢 3-Bit Scoring
- Q1 B=+4, Q2 B=+2, Q3 B=+1, Q4/Q5 B=0, A=0
- results 8개, score 0~7

## 📝 JSON only (no markdown)
{
  "title": "[Vietnamese]",
  "description": "[Vietnamese]",
  "category": "[EXACT category id from EXPERT directive]",
  "questions": [ ...5 items with score_a, score_b ... ],
  "results": [ ...8 items with score 0-7, type_name, description, traits ... ]
}
`;

/**
 * @param {string} categoryId - One of QUIZ_CATEGORY_IDS (MBTI, Personality, …)
 * @param {string} [customTopic] - Optional user topic in any language
 */
export async function generateQuizContent(categoryId, customTopic = '') {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing VITE_GEMINI_API_KEY. Please add it to your environment variables.');
  }

  const category = normalizeCategory(categoryId);
  const expertPrompt = getExpertPrompt(category);
  const topicSeed = getTopicSeed(category);

  const systemInstruction = `${MASTER_PROMPT}

## 🎭 EXPERT AGENT (ACTIVE CATEGORY: ${category})
${expertPrompt}

STRICT RULES:
- Return ONLY valid JSON.
- All user-facing text in Vietnamese.
- Exactly 5 questions, exactly 8 results (scores 0-7).
- The JSON field "category" MUST be exactly: "${category}"
- Do NOT use fun, fortune, personality, trend or any other category string.
- Allowed category ids (for reference only): ${GEMINI_CATEGORY_LIST}
`;

  const userPrompt = customTopic?.trim()
    ? `Write a quiz in category "${category}". User topic: ${customTopic.trim()}. Remember: "category": "${category}"`
    : `Write a quiz in category "${category}". Topic direction: ${topicSeed}. Remember: "category": "${category}"`;

  const requestBody = {
    contents: [{ parts: [{ text: `${systemInstruction}\n\n${userPrompt}` }] }],
    generationConfig: {
      temperature: 0.9,
      topK: 1,
      topP: 1,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
    },
  };

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Gemini API request failed');
    }

    const data = await response.json();
    let resultText = data.candidates[0].content.parts[0].text;

    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    if (jsonMatch) resultText = jsonMatch[0];

    let parsed;
    try {
      parsed = JSON.parse(resultText);
    } catch {
      resultText = resultText.replace(/,\s*([}\]])/g, '$1');
      parsed = JSON.parse(resultText);
    }

    parsed.category = category;
    return parsed;
  } catch (error) {
    if (error.message?.includes('JSON')) {
      throw new Error('AI 생성 내용에 오류가 있습니다. 다시 시도해주세요. (JSON Parse Error)');
    }
    console.error('Gemini Generation Error:', error);
    throw error;
  }
}
