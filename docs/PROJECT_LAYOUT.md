# Project layout

## Active (production)

```
api/           Vercel serverless — api/[...path].js → _lib/router.js → handlers/
shared/        Single source: quiz prompts, image prompts, categories, templates
src/           React frontend (pages, components, lib clients)
turso/         SQLite schema + migrations
public/        Static assets + generated quiz images
server/        Local dev API (dev-api.mjs)
scripts/
  db/          init, migrate, normalize categories
  images/      backfill, placeholders
  ops/         daily quiz, fix broken, audit
  dev/         demo, e2e, verify
docs/          Ops guides (CRON, Push, Vercel, AdSense, GTM)
automation/    Optional n8n workflows (Vercel Cron preferred)
```

## Archive

- `legacy/` — Supabase + FastAPI + old tools
- `docs/archive/` — old TODO/COMPLETED notes

## Prompt source of truth

| Type | File |
|------|------|
| Quiz MASTER + Gemini | `shared/quizPrompts.js` |
| 8 Expert agents | `shared/quizExpertPrompts.js` |
| Image (Vietnamese HCMC) | `shared/imagePrompts.js` |
