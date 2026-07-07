# Project layout

> 상세 정리 기획: [`CODEBASE_CLEANUP_PLAN.md`](./CODEBASE_CLEANUP_PLAN.md)

## Active (production)

```
api/           Vercel serverless — api/handler.js → _lib/router.js → handlers/
shared/        Single source: quiz prompts, image prompts, categories, templates
src/           React frontend (pages, components, lib clients)
turso/         SQLite schema + migrations
public/        Static assets + generated quiz images
server/        Local dev API (viteApiPlugin.mjs)
scripts/
  db/          init, migrate, normalize categories
  images/      backfill, placeholders
  ops/         daily quiz, fix broken, audit
  dev/         demo, e2e, verify
docs/          Ops guides (CRON, Push, Vercel, Security, AI_PROMPTS)
automation/    Optional n8n workflows (Vercel Cron preferred)
```

## Archive

- `legacy/` — Supabase + FastAPI + old tools (runtime import 금지)
- `docs/archive/` — old TODO/COMPLETED notes
- `data/` — Feb 2026 JSON snapshot (runtime 미사용)

## Prompt source of truth

| Type | File |
|------|------|
| Quiz MASTER + Gemini | `shared/quizPrompts.js` |
| 8 Expert agents | `shared/quizExpertPrompts.js` |
| Image prompts | `shared/imagePrompts.js` + `imageStyles.js` + `imagePromptEngine.js` |
