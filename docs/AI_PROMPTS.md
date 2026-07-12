# AI Prompt Map — nambac

> **Single source of truth**는 `shared/` JS 모듈. `.claude/agents/*.md`와 `legacy/` 프롬프트는 아카이브·참고용.

## Quiz text (v5.2 MZ mode)

| 역할 | 파일 | 주요 export |
|------|------|-------------|
| MASTER + scoring + validation + 2-pass | `shared/quizPrompts.js` | `QUIZ_MASTER_PROMPT` (v5.2 MZ), `QUIZ_RICHNESS_LIMITS`, `generateQuizContent`, `validateQuizPayload`, `validateViNaturalness`, `clampPayloadToMzLimits` |
| VI Editor 2nd pass | `shared/quizViEditorPrompts.js` | `QUIZ_VI_EDITOR_SYSTEM`, `buildViEditorUserPrompt` |
| Category tiers (daily rotation) | `shared/categoryTiers.js` | `DAILY_CATEGORY_IDS`, `pickDailyCategory` |
| 8 Expert agents + topic seeds | `shared/quizExpertPrompts.js` | `QUIZ_EXPERT_PROMPTS`, `QUIZ_TOPIC_SEEDS` |
| MBTI / personality archetypes | `shared/personalityArchetypes.js` | `getArchetypesByGroup`, archetype quiz builders |
| LLM JSON (Gemini → OpenRouter) | `shared/llmJson.js` | `generateJsonViaLlm`, `parseJsonFromLlm` |
| Gemini key rotation | `shared/geminiKeys.js` | `withGeminiKeys` (server only on Vercel) |

**호출 경로**

- Admin UI: `POST /api/admin/generate-quiz-content` → `api/_lib/geminiQuiz.js`
- Cron daily: `POST /api/cron/daily-quiz` → Tier A categories only via `pickDailyCategory`
- Local/CI dry-run: `npm run daily:quiz -- --dry-run` (no Turso write)
- GitHub Actions: `Daily quiz` workflow → `dry_run: true` input
- Archetype factory: `POST /api/admin/generate-archetype-quiz` → `shared/quizPrompts.js` (`generateArchetypeQuizContent`)

**Pipeline (v5.2):** Generate → VI Editor polish → `clampPayloadToMzLimits` → validate (`enforceMax` + `enforceVi` on AI path)

## Fortune text

| 역할 | 파일 | 주요 export |
|------|------|-------------|
| Multi-axis brand copy | `shared/fortuneMeta.js` | `FORTUNE_AXES`, `getFortuneBrand` |
| Axis-native pools (money/health) | `shared/fortune-pools/fortune-*.pool.json` | JSON pools merged via `fortune:merge-batch` |
| Pool loader | `shared/fortuneAxisPools.js` | `FORTUNE_MONEY_RESULTS`, `FORTUNE_HEALTH_RESULTS` |
| Axis display framing | `shared/fortuneAxisFormat.js` | `formatFortuneForAxis` (lead + compat; skips lead when `axisNative`) |
| Zodiac asset mapping (DOB → image) | `shared/zodiacFortune.js` | `resolveFortuneZodiacAsset`, `getWesternZodiacFromDob`, `getChineseZodiacFromDob` |
| Zodiac image prompts (24 assets) | `shared/zodiacImagePrompts.js` | `listAllZodiacImageJobs` |
| Static zodiac image loader | `api/_lib/zodiacImageService.js` | `ensureZodiacFortuneImage` |
| AI fortune batch (expansion) | `shared/fortunePrompts.js` | `generateFortuneArchetypes` |
| Deterministic engine | `shared/fortuneEngine.js` | `calculateTodayFortune` (name + DOB + axis) |

**Axis pools:** love/general → shared 20 (`fortuneData.js`). money/health → dedicated JSON pool when present (`getFortuneByIndexForAxis`).

**Zodiac images (one-time):** `npm run images:zodiac` → `public/images/zodiac_west_*.webp` (12) + `zodiac_cn_*.webp` (12). No daily AI.

**Batch ops:**

```bash
npm run fortune:axis-batch -- --axis=money --count=5   # → data/fortune-batch/
npm run fortune:merge-batch -- --axis=money              # → shared/fortune-pools/fortune-money.pool.json
npm run verify:fortune-images
```

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
- Daily quiz images: **off by default** — `npm run daily:quiz -- --with-images` or Actions `with_images: true`
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
