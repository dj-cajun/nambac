# AI Prompt Map — nambac

> **Single source of truth**는 `shared/` JS 모듈. `.claude/agents/*.md`와 `legacy/` 프롬프트는 아카이브·참고용.

## Quiz text (v5.2 MZ mode)

| 역할 | 파일 | 주요 export |
|------|------|-------------|
| MASTER + scoring + validation + 2-pass | `shared/quizPrompts.js` | `QUIZ_MASTER_PROMPT` (v5.2 MZ), `QUIZ_RICHNESS_LIMITS`, `generateQuizContent`, `validateQuizPayload`, `validateViNaturalness` |
| VI Editor 2nd pass | `shared/quizViEditorPrompts.js` | `QUIZ_VI_EDITOR_SYSTEM`, `buildViEditorUserPrompt` |
| Category tiers (daily rotation) | `shared/categoryTiers.js` | `DAILY_CATEGORY_IDS`, `pickDailyCategory` |
| 8 Expert agents + topic seeds | `shared/quizExpertPrompts.js` | `QUIZ_EXPERT_PROMPTS`, `QUIZ_TOPIC_SEEDS` |
| MBTI / personality archetypes | `shared/personalityArchetypes.js` | `getArchetypesByGroup`, archetype quiz builders |
| LLM JSON (Gemini → OpenRouter) | `shared/llmJson.js` | `generateJsonViaLlm`, `parseJsonFromLlm` |
| Gemini key rotation | `shared/geminiKeys.js` | `withGeminiKeys` (server only on Vercel) |

**호출 경로**

- Admin UI: `POST /api/admin/generate-quiz-content` → `api/_lib/geminiQuiz.js`
- Cron daily: `POST /api/cron/daily-quiz` → Tier A categories only via `pickDailyCategory`
- Archetype factory: `POST /api/admin/generate-archetype-quiz` → `shared/quizPrompts.js` (`generateArchetypeQuizContent`)

**Pipeline (v5.2):** Generate → VI Editor polish → validate (min+max+VI on AI path)

## Fortune text

| 역할 | 파일 | 주요 export |
|------|------|-------------|
| Multi-axis brand copy | `shared/fortuneMeta.js` | `FORTUNE_AXES`, `getFortuneBrand` |
| Zodiac asset mapping (DOB → image) | `shared/zodiacFortune.js` | `resolveFortuneZodiacAsset`, `getWesternZodiacFromDob`, `getChineseZodiacFromDob` |
| Zodiac image prompts (24 assets) | `shared/zodiacImagePrompts.js` | `listAllZodiacImageJobs` |
| Static zodiac image loader | `api/_lib/zodiacImageService.js` | `ensureZodiacFortuneImage` |
| AI fortune batch (optional expansion) | `shared/fortunePrompts.js` | `generateFortuneArchetypes` |
| Deterministic engine | `shared/fortuneEngine.js` | `calculateTodayFortune` (name + DOB + axis) |

**Zodiac images (one-time):** `npm run images:zodiac` → `public/images/zodiac_west_*.webp` (12) + `zodiac_cn_*.webp` (12). No daily AI.

## Quiz images

| 역할 | 파일 | 주요 export |
|------|------|-------------|
| Style per quiz (cover + 8 results) | `shared/imageStyles.js` | `pickQuizStyle`, `QUIZ_IMAGE_STYLES` |
| Scene rules + no-text guards | `shared/imagePrompts.js` | `finalizeCoverImagePrompt`, `finalizeResultImagePrompt`, `NO_TEXT_RULES` |
| Prompt engine (LLM → image prompt) | `shared/imagePromptEngine.js` | `generateQuizImagePrompts` |
| Image generation orchestration | `api/_lib/generateQuizImage.js` | cover=Gemini Image, results=Flux (configurable) |

**호출 경로**

- Admin batch: `POST /api/admin/generate-quiz-images`
- Backfill: `npm run images:backfill`
- Single: `POST /api/generate-image` (admin)

## Categories (normalization)

| 파일 | 용도 |
|------|------|
| `shared/categories.js` | `normalizeCategory`, `QUIZ_CATEGORY_IDS` |
| `src/constants/categories.js` | UI labels/colors only (Home, Admin filter) |

## Archive (do not import at runtime)

- `legacy/backend/agents_nambac/prompts/*.md`
- `.claude/agents/*.md`
- Index: `docs/archive/prompts/README.md`
