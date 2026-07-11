/**
 * Quiz text generation — single source of truth (Gemini → OpenRouter fallback).
 * MASTER prompt + scoring + DB formatting live here only.
 */
import { normalizeCategory, QUIZ_CATEGORY_IDS } from './categories.js';
import { pickDailyCategory as pickDailyCategoryFromTiers } from './categoryTiers.js';
import { QUIZ_EXPERT_PROMPTS, QUIZ_TOPIC_SEEDS } from './quizExpertPrompts.js';
import { MBTI_TYPES, MBTI_DIMENSIONS } from './personalityArchetypes.js';
import { generateJsonViaLlm, parseJsonFromLlm } from './llmJson.js';
import { QUIZ_VI_EDITOR_SYSTEM, buildViEditorUserPrompt } from './quizViEditorPrompts.js';

/** Q1 B=+4, Q2 B=+2, Q3 B=+1, Q4/Q5 B=0 — 3-bit binary scoring */
export const BINARY_5Q_SCORES = Object.freeze([
  [0, 4],
  [0, 2],
  [0, 1],
  [0, 0],
  [0, 0],
]);

/** MZ-mode targets — min for substance, max caps AI wall-of-text (enforceMax on AI path only) */
export const QUIZ_RICHNESS_LIMITS = Object.freeze({
  titleMin: 30,
  titleMax: 80,
  descriptionMin: 55,
  descriptionMax: 140,
  questionMin: 45,
  questionMax: 130,
  optionMin: 40,
  optionMax: 115,
  resultTitleMin: 12,
  resultTitleMax: 45,
  resultDescMin: 140,
  resultDescMax: 300,
  traitsCount: 3,
});

export const QUIZ_MASTER_PROMPT = `
# 🎮 MASTER Quiz Generation Prompt (v5.2 - MZ Mode: Native VI + Punchy)

## 🎯 Core Philosophy: "Native Gen Z Sài Gòn + situational humor — NOT wall of text"
"재미없으면 죽음뿐. 무조건 베트남어(Vietnamese)로만 대답하십시오."
건조한 퀴즈는 **실패**이지만, **너무 긴 설명도 실패**입니다. MZ는 스크롤 짧게 — 임팩트 우선.

> **Language Rule**: 모든 사용자 대면 텍스트는 **반드시 베트남어(Vietnamese)**. 괄호 안 영어 설명 금지.

## 📏 텍스트 길이 (MIN + MAX — out of range = reject)
| 항목 | 최소 | 최대 | 스타일 |
| --- | --- | --- | --- |
| title | 30자 | 80자 | 훅 + 따옴표 슬랭 ('trà xanh', 'thả thính'…) |
| description | 55자 | 140자 | 티저 + (괄호 한 방) |
| question_text | 45자 | 130자 | **미니 시나리오**: Zalo/Quận 1 + 갈등 + "Bạn sẽ làm gì?" |
| option_a / option_b | 40자 | 115자 | 행동/대사 + **(베트남어 펀치라인)** 필수 |
| type_name (결과 제목) | 12자 | 45자 | 아키타입: 'Thánh Lầy ẩn mình', 'Thánh Thả Thính' |
| description (결과) | 140자 | 300자 | **2~3문장**: ①아키타입 ②팩폭/반응 ③조언 한 줄 |
| traits | 3개 | 3개 | 각 1~3단어 (Hài hước, Bí ẩn, Dè dặt) |

## ✍️ MZ Writing Rules
1. **Every option** has a Vietnamese punchline in parentheses: (Cao thủ ẩn mình!), (Tính sau cũng được!)
2. Use **VN slang**: 'thả thính', 'cưa đổ', 'thảo mai', 'flop', 'sống ảo', 'toxic' — NO English meta labels in parens
3. Name **local brands**: Grab, Zalo, TikTok, Quận 1, Thảo Điền, bánh mì, trà chanh
4. Result descriptions: 2–3 sentences max — "Bạn là…" + plot twist + one advice line
5. Never generic one-liners. Never bare "A"/"B" labels. Never King-bad / speedrun / YOLO in output.

## ⚠️ 필수
1. 2지선다 (A/B) only — option_a / option_b는 **완전한 베트남어 문장**
2. 호치민 로컬 디테일 필수
3. **category 필드**: EXPERT가 지정한 id와 **완전히 동일한 문자열**만 사용

## 🚫 Anti-Duplication & Leakage Rules (STRICT — v5.1 patch)

1. **NO duplicate closing sentences.** Each result description ends with
   exactly ONE advice/roast sentence. NEVER repeat the same sentence,
   phrase, or CTA twice in the same description — even if it feels like
   a good closer. Before finalizing, scan every description and delete
   any sentence that already appears earlier in that same field.

2. **NO meta/source leakage.** The "topic seed" or "custom topic" text
   given to you is INSPIRATION ONLY — it may contain research notes,
   platform names (e.g. "GitHub", "repo", "trending on X"), or English
   analytical framing. NEVER copy these words, phrases, or concepts into
   the actual Vietnamese output. The final quiz must read as 100%
   organic Sài Gòn Gen Z content — no trace of "how this was researched"
   should appear. Banned words in output: GitHub, repo, README, commit,
   badge, issue, star count, CI/CD, unit test, open-source, maintainer,
   patch note, changelog — or any other software/engineering jargon
   unrelated to the quiz's real-world theme.

3. **NO dual-version pileup.** Never output two rewritten versions of
   the same title/description/result separated by " | " (or any other
   separator). Pick ONE final Vietnamese version and commit to it.
   If you draft multiple options while composing, discard all but the
   best one before writing the final JSON.

4. **Self-check before returning JSON:**
   - [ ] No sentence appears twice in any single field
   - [ ] No English tech/meta jargon outside the approved slang list
     ('thả thính', 'cưa đổ', 'thảo mai', 'flop', 'sống ảo', 'toxic', etc.)
   - [ ] No " | " or "/" splitting two paraphrases of the same content
   - [ ] Every question/option/result reads like ONE clean, final draft

## 🔢 3-Bit Scoring
- Q1 B=+4, Q2 B=+2, Q3 B=+1, Q4/Q5 B=+0, A=0
- results 8개, score 0~7 (each score = unique archetype)

## 📝 JSON only (no markdown)
{
  "title": "[Vietnamese, rich hook]",
  "description": "[Vietnamese teaser with parenthetical punchline]",
  "category": "[EXACT category id from EXPERT directive]",
  "questions": [ ...5 items ... ],
  "results": [ ...8 items: score 0-7, type_name, description (140–300 chars), traits [3 strings] ... ]
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
- Meet ALL min AND max character counts in the MZ table (v5.2).
- Each option_a and option_b MUST be a full Vietnamese phrase (never the letters "A" or "B" alone).
- Each option MUST include a parenthetical punchline in Vietnamese (…).
- Each result description MUST be 140–300 Vietnamese characters with 2–3 sentences.
- Each result MUST have exactly 3 traits.
- No sentence, phrase, or CTA may appear twice within the same field (title, description, or any result description).
- No reference to the topic's inspiration source, research platform, or English technical/meta terminology (e.g. GitHub, repo, README) may appear anywhere in the output.
- No field may contain two alternate phrasings joined by "|" or "/" — output exactly one final version per field.
- The JSON field "category" MUST be exactly: "${category}"
- Do NOT use fun, fortune, personality, trend or any other category string.
- Allowed category ids (for reference only): ${GEMINI_CATEGORY_LIST}
`;
}

export function buildQuizUserPrompt(categoryId, customTopic = '') {
  const category = normalizeCategory(categoryId);
  const topicSeed = getTopicSeed(category);
  const customTopicNote =
    '⚠️ Note for custom topic input: Write the topic direction as a plain creative brief only (e.g. "attachment style ở Sài Gòn"). Do NOT paste research notes, source links, or phrases like "inspired by GitHub personality-test repos" — the LLM may copy these verbatim into the final quiz text. Topic is INSPIRATION ONLY; never leak source/meta jargon into output.';

  return customTopic?.trim()
    ? `Write a punchy, native-Vietnamese quiz in category "${category}". User topic (inspiration only — do not copy meta/source words): ${customTopic.trim()}. ${customTopicNote} MZ mode: situational questions, Vietnamese (parenthetical punchlines), result descriptions 140–300 chars (2–3 sentences). Remember: "category": "${category}"`
    : `Write a punchy, native-Vietnamese quiz in category "${category}". Topic direction: ${topicSeed}. MZ mode: mini-scenarios (Zalo, crush, Grab), Vietnamese punchlines in parens, 8 unique archetype results with 140–300 char descriptions. Remember: "category": "${category}"`;
}

function isPlaceholderOption(text) {
  const t = text?.trim();
  return !t || /^[ABab]$/.test(t);
}

const META_LEAK_RE =
  /\b(GitHub|README|CI\/CD|unit test|open[- ]?source|maintainer|changelog|patch note|star count)\b|\brepo\b|\bcommit\b/i;

const BANNED_VI_PHRASES_RE =
  /\b(King[- ]?bad|speedrun|burnout speedrun|Yes person|YOLO priority|adulting|Delayed gratification|Strategic natural|Human decency|Know your rights)\b/i;

const ALLOWED_ENGLISH_BRANDS = new Set([
  'grab', 'zalo', 'tiktok', 'shopee', 'facebook', 'threads', 'teams', 'instagram',
  'netflix', 'spotify', 'youtube', 'mbti', 'otp', 'fomo', 'wifi', 'app',
]);

/** Gen Z quiz / MBTI terms that may appear in Vietnamese copy */
const ALLOWED_ENGLISH_QUIZ = new Set([
  'dna', 'gen', 'genz', 'logic', 'type', 'quiz', 'bio', 'vibe', 'flex', 'ship',
  'ghosting', 'crush', 'trend', 'toxic', 'chill', 'cool', 'team', 'boss', 'deadline',
  'online', 'offline', 'story', 'feed', 'post', 'chat', 'group', 'match', 'introvert',
  'extrovert', 'infp', 'enfp', 'intj', 'entj', 'istp', 'estp', 'isfj', 'esfj',
  'istj', 'estj', 'isfp', 'esfp', 'infj', 'enfj', 'intp', 'entp',
]);

/** Clear English leakage — not unaccented Vietnamese (quan, hay, cho, …) */
const ENGLISH_LEAK_WORDS = new Set([
  'the', 'and', 'you', 'your', 'with', 'this', 'that', 'what', 'when', 'where', 'why', 'how',
  'because', 'however', 'although', 'something', 'everything', 'nothing', 'someone', 'everyone',
  'strategic', 'healing', 'energy', 'priority', 'decision', 'actually', 'basically',
  'literally', 'honestly', 'seriously', 'definitely', 'probably', 'please', 'thanks',
  'sorry', 'hello', 'people', 'person', 'thing', 'things', 'really', 'very', 'just',
  'speedrun', 'burnout', 'adulting', 'maintainer', 'changelog', 'readme', 'commit',
  'gratification', 'decency', 'rights', 'source', 'maintainer', 'github', 'readme',
  'natural', 'human', 'delayed', 'know', 'king', 'person', 'yolo', 'adulting',
]);

function isAllowedLatinWord(word) {
  const lower = word.toLowerCase();
  return ALLOWED_ENGLISH_BRANDS.has(lower) || ALLOWED_ENGLISH_QUIZ.has(lower);
}

function unexpectedEnglishWords(text) {
  const words = String(text || '').match(/\b[A-Za-z]{3,}\b/g) || [];
  return words.filter((w) => {
    if (isAllowedLatinWord(w)) return false;
    return ENGLISH_LEAK_WORDS.has(w.toLowerCase());
  });
}

function hasAwkwardEnglishParen(text) {
  const parens = String(text || '').match(/\([^)]+\)/g) || [];
  for (const p of parens) {
    const inner = p.slice(1, -1);
    const bad = unexpectedEnglishWords(inner);
    if (bad.length >= 2) return true;
  }
  return false;
}

/** VI naturalness checks — used on AI-generated content */
export function validateViNaturalness(payload) {
  const errors = [];
  const fields = [
    ['title', payload.title],
    ['description', payload.description],
    ...payload.questions.flatMap((q, i) => [
      [`Q${i + 1}`, q.question_text],
      [`Q${i + 1} A`, q.option_a],
      [`Q${i + 1} B`, q.option_b],
    ]),
    ...payload.results.flatMap((r, i) => [
      [`Result ${i} title`, r.type_name || r.title],
      [`Result ${i} desc`, r.description],
    ]),
  ];

  for (const [label, text] of fields) {
    const s = String(text || '');
    if (BANNED_VI_PHRASES_RE.test(s)) {
      errors.push(`${label}: banned translation-ese phrase`);
    }
    if (hasAwkwardEnglishParen(s)) {
      errors.push(`${label}: awkward English in parentheses`);
    }
    const badWords = unexpectedEnglishWords(s);
    if (badWords.length > 2) {
      errors.push(`${label}: too much unexpected English (${badWords.slice(0, 3).join(', ')}…)`);
    }
  }
  return errors;
}

function buildRetryHint(errors) {
  const joined = errors.join('; ');
  const needsShorter = errors.some((e) => /too long/i.test(e));
  const needsLonger = errors.some((e) => /too short/i.test(e));
  const needsVi = errors.some((e) => /English|translation|banned/i.test(e));

  if (needsShorter && needsVi) {
    return `\n\nRETRY: ${joined}. Shorten text AND rewrite in native Vietnamese — no English in parentheses.`;
  }
  if (needsShorter) {
    return `\n\nRETRY: ${joined}. Shorten to MZ limits — result descriptions 2–3 sentences only.`;
  }
  if (needsLonger) {
    return `\n\nRETRY: ${joined}. Add situational detail but stay under max length.`;
  }
  if (needsVi) {
    return `\n\nRETRY: ${joined}. Rewrite in native Gen Z Sài Gòn Vietnamese — fix awkward English.`;
  }
  return `\n\nRETRY: ${joined}. Native Gen Z Sài Gòn Vietnamese, punchy and within min/max limits.`;
}

/** title/description에서 " | " 로 이어붙인 이중 버전 중 첫 번째만 채택 */
function stripPipeVariants(text) {
  if (!text) return text;
  const s = String(text).trim();
  return s.includes(' | ') ? s.split(' | ')[0].trim() : s;
}

/** 완전히 동일한 문장이 반복되면 두 번째 이후는 제거 (CTA 패딩 중복 포함) */
function stripDuplicateSentences(text) {
  if (!text) return text;
  let s = String(text).trim();

  // Handcrafted padDesc CTA — collapse exact repeated blocks first
  const marker = 'Kết quả mang tính giải trí Gen Z Sài Gòn';
  if (s.split(marker).length - 1 >= 2) {
    const second = s.indexOf(marker, s.indexOf(marker) + marker.length);
    if (second !== -1) s = s.slice(0, second).trim();
  }

  const sentences = s.match(/[^.!?…]+[.!?…]+(\s|$)|[^.!?…]+$/g) || [s];
  const seen = new Set();
  const deduped = [];
  for (const raw of sentences) {
    const part = raw.trim();
    const key = part.toLowerCase().replace(/\s+/g, ' ');
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(part);
  }
  return deduped.join(' ').trim();
}

function hasDuplicateSentence(text) {
  const sentences = (text || '').match(/[^.!?…]+[.!?…]+/g) || [];
  const seen = new Set();
  for (const raw of sentences) {
    const key = raw.trim().toLowerCase().replace(/\s+/g, ' ');
    if (!key) continue;
    if (seen.has(key)) return true;
    seen.add(key);
  }
  return false;
}

function sanitizeQuizField(text) {
  return stripDuplicateSentences(stripPipeVariants(text));
}

/**
 * Normalize Gemini JSON → DB payload. Enforces binary_5q scores; never falls back to "A"/"B".
 * Also strips dual-version " | " pileups and duplicate closing sentences (v5.1 postprocess).
 * Dedup may drop length below min — validateQuizPayload can reject and force regeneration.
 */
export function formatQuizForDb(geminiData) {
  const results = Array.from({ length: 8 }, (_, i) => {
    const found = (geminiData.results || []).find(
      (r) => (r.score ?? r.result_code) === i,
    ) || geminiData.results?.[i];
    return {
      result_code: i,
      title: stripPipeVariants(found?.type_name || found?.title || `Level ${i}`),
      type_name: stripPipeVariants(found?.type_name || found?.title || null),
      description: stripDuplicateSentences(
        stripPipeVariants(found?.description || ''),
      ),
      traits: Array.isArray(found?.traits) ? found.traits : [],
    };
  });

  const rawQuestions = (geminiData.questions || []).slice(0, 5);
  const questions = rawQuestions.map((q, i) => {
    const [score_a, score_b] = BINARY_5Q_SCORES[i] || [0, 0];
    const option_a = stripPipeVariants(q.option_a?.trim() || '');
    const option_b = stripPipeVariants(q.option_b?.trim() || '');

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
    title: stripPipeVariants(String(geminiData.title || '').trim()) || 'Quiz mới nambac',
    description: stripDuplicateSentences(
      stripPipeVariants(String(geminiData.description || geminiData.title || '').trim()),
    ),
    category: normalizeCategory(geminiData.category),
    quiz_type: 'binary_5q',
    questions,
    results,
  };
}

const MZ_CLAMP_SOFT_OVER = 15;

function clampMzField(text, max) {
  const s = String(text || '').trim();
  if (s.length <= max) return s;
  if (s.length > max + MZ_CLAMP_SOFT_OVER) return s;
  const cut = s.slice(0, max);
  const sp = cut.lastIndexOf(' ');
  return (sp > max * 0.55 ? cut.slice(0, sp) : cut).trim();
}

/** Trim fields that barely exceed MZ max — avoids rejecting 141 vs 140 chars */
export function clampPayloadToMzLimits(payload) {
  const L = QUIZ_RICHNESS_LIMITS;
  return {
    ...payload,
    title: clampMzField(payload.title, L.titleMax),
    description: clampMzField(payload.description, L.descriptionMax),
    questions: payload.questions.map((q) => ({
      ...q,
      question_text: clampMzField(q.question_text, L.questionMax),
      option_a: clampMzField(q.option_a, L.optionMax),
      option_b: clampMzField(q.option_b, L.optionMax),
    })),
    results: payload.results.map((r) => ({
      ...r,
      title: clampMzField(r.title || r.type_name, L.resultTitleMax),
      type_name: clampMzField(r.type_name || r.title, L.resultTitleMax),
      description: clampMzField(r.description, L.resultDescMax),
    })),
  };
}

function hasPunchlineOption(text) {
  return /\([^)]{4,}\)/.test(String(text || ''));
}

function validateQuizRichness(payload, options = {}) {
  const errors = [];
  const L = QUIZ_RICHNESS_LIMITS;
  const enforceMax = options.enforceMax === true;

  const checkLen = (label, len, min, max) => {
    if (len < min) errors.push(`${label} too short (${len} < ${min})`);
    if (enforceMax && len > max) errors.push(`${label} too long (${len} > ${max})`);
  };

  checkLen('title', payload.title?.trim().length || 0, L.titleMin, L.titleMax);
  checkLen('description', payload.description?.trim().length || 0, L.descriptionMin, L.descriptionMax);
  if (/\s\|\s/.test(payload.title || '') || /\s\|\s/.test(payload.description || '')) {
    errors.push('title/description has dual-version " | " pileup');
  }
  if (META_LEAK_RE.test(`${payload.title || ''} ${payload.description || ''}`)) {
    errors.push('title/description leaks tech/meta jargon (GitHub/repo/etc.)');
  }

  payload.questions.forEach((q, i) => {
    const qLen = q.question_text?.trim().length || 0;
    checkLen(`Q${i + 1}: question`, qLen, L.questionMin, L.questionMax);
    for (const [key, label] of [['option_a', 'A'], ['option_b', 'B']]) {
      const opt = q[key]?.trim() || '';
      checkLen(`Q${i + 1} option ${label}`, opt.length, L.optionMin, L.optionMax);
      if (!hasPunchlineOption(opt)) {
        errors.push(`Q${i + 1} option ${label}: missing (parenthetical punchline)`);
      }
    }
  });

  payload.results.forEach((r, i) => {
    const title = (r.type_name || r.title || '').trim();
    const desc = r.description?.trim() || '';
    checkLen(`Result ${i}: title`, title.length, L.resultTitleMin, L.resultTitleMax);
    checkLen(`Result ${i}: description`, desc.length, L.resultDescMin, L.resultDescMax);
    if (hasDuplicateSentence(desc)) {
      errors.push(`Result ${i}: description contains duplicate sentence(s)`);
    }
    const traits = Array.isArray(r.traits) ? r.traits.filter(Boolean) : [];
    if (traits.length < L.traitsCount) {
      errors.push(`Result ${i}: need ${L.traitsCount} traits, got ${traits.length}`);
    }
    if (/\s\|\s/.test(title) || /\s\|\s/.test(desc)) {
      errors.push(`Result ${i}: dual-version " | " pileup`);
    }
    if (META_LEAK_RE.test(`${title} ${desc}`)) {
      errors.push(`Result ${i}: tech/meta jargon leak`);
    }
    const marker = 'Kết quả mang tính giải trí Gen Z Sài Gòn';
    if (desc.split(marker).length - 1 >= 2) {
      errors.push(`Result ${i}: duplicate closing CTA`);
    }
  });

  return errors;
}

/** Returns validation errors (empty array = OK for publish) */
export function validateQuizPayload(payload, options = {}) {
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
    errors.push(...validateQuizRichness(payload, options));
    if (options.enforceVi === true) {
      errors.push(...validateViNaturalness(payload));
    }
  }

  return errors;
}

async function polishQuizVi({ apiKey, openrouterKey, payload }) {
  const { text } = await generateJsonViaLlm({
    geminiKey: apiKey,
    openrouterKey,
    system: QUIZ_VI_EDITOR_SYSTEM,
    user: buildViEditorUserPrompt(payload),
    temperature: 0.55,
    maxOutputTokens: 8192,
    label: 'quiz-vi-editor',
  });
  const parsed = parseJsonFromLlm(text);
  parsed.category = payload.category;
  return formatQuizForDb(parsed);
}

export async function generateQuizContent({ apiKey, openrouterKey, categoryId, customTopic = '' }) {
  const category = normalizeCategory(categoryId);
  const systemInstruction = buildQuizSystemInstruction(category);
  const userPrompt = buildQuizUserPrompt(category, customTopic);
  const aiValidateOpts = { enforceMax: true, enforceVi: true };

  const maxAttempts = 3;
  let lastErrors = [];

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const retryHint = attempt > 1 ? buildRetryHint(lastErrors) : '';

    const { text } = await generateJsonViaLlm({
      geminiKey: apiKey,
      openrouterKey,
      system: systemInstruction,
      user: userPrompt + retryHint,
      temperature: attempt > 1 ? 0.75 : 0.88,
      maxOutputTokens: 8192,
      label: 'quiz-content',
    });

    const parsed = parseJsonFromLlm(text);
    parsed.category = category;
    let payload = formatQuizForDb(parsed);

    try {
      payload = await polishQuizVi({ apiKey, openrouterKey, payload });
    } catch (err) {
      console.warn('quiz-vi-editor pass failed, using draft', err.message);
    }

    payload = clampPayloadToMzLimits(payload);

    lastErrors = validateQuizPayload(payload, aiValidateOpts);
    if (lastErrors.length === 0) {
      return {
        title: payload.title,
        description: payload.description,
        category: payload.category,
        questions: payload.questions.map((q) => ({
          question_text: q.question_text,
          option_a: q.option_a,
          option_b: q.option_b,
        })),
        results: payload.results.map((r) => ({
          score: r.result_code,
          type_name: r.type_name || r.title,
          description: r.description,
          traits: r.traits,
        })),
      };
    }
  }

  throw new Error(`Quiz failed MZ validation: ${lastErrors.join('; ')}`);
}

export { pickDailyCategoryFromTiers as pickDailyCategory };

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

Make it native Gen Z Sài Gòn (Grab, Zalo, Thao Dien, Quận 1, TikTok).
MZ mode v5.2: situational questions (45–130 chars), Vietnamese punchlines in parens, result descriptions 140–300 chars (2–3 sentences), 3 traits each.`;
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

  const aiValidateOpts = { enforceMax: true, enforceVi: true };

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const retryHint = attempt > 1 ? buildRetryHint(lastErrors) : '';

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

    let polished = formatted;
    try {
      polished = await polishQuizVi({ apiKey, openrouterKey, formatted });
      polished.quiz_type = 'binary_5q';
      polished.category = category;
    } catch (err) {
      console.warn('archetype quiz-vi-editor pass failed', err.message);
    }

    lastErrors = validateQuizPayload(polished, aiValidateOpts);
    if (lastErrors.length === 0) return polished;
  }

  throw new Error(`Archetype quiz failed MZ validation: ${lastErrors.join('; ')}`);
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
