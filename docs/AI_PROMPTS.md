# AI Prompt Map — nambac

> **Single source of truth**는 `shared/` JS 모듈. `.claude/agents/*.md`와 `legacy/` 프롬프트는 아카이브·참고용.

## Quiz text

| 역할 | 파일 | 주요 export |
|------|------|-------------|
| MASTER + scoring + validation | `shared/quizPrompts.js` | `QUIZ_MASTER_PROMPT`, `generateQuizContent`, `validateQuizPayload`, `formatQuizForDb` |
| 8 Expert agents + topic seeds | `shared/quizExpertPrompts.js` | `QUIZ_EXPERT_PROMPTS`, `QUIZ_TOPIC_SEEDS` |
| MBTI / personality archetypes | `shared/personalityArchetypes.js` | `getArchetypesByGroup`, archetype quiz builders |
| LLM JSON (Gemini → OpenRouter) | `shared/llmJson.js` | `generateJsonViaLlm`, `parseJsonFromLlm` |
| Gemini key rotation | `shared/geminiKeys.js` | `withGeminiKeys` (server only on Vercel) |

**호출 경로**

- Admin UI: `POST /api/admin/generate-quiz-content` → `api/_lib/geminiQuiz.js`
- Cron daily: `POST /api/cron/daily-quiz` → same
- Archetype factory: `POST /api/admin/generate-archetype-quiz` → `shared/quizPrompts.js` (`generateArchetypeQuizContent`)

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
