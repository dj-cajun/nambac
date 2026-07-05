# 🤖 Nambac Automation Hub

This directory contains the brain of the **24/7 Content Factory**.
It connects **n8n** (Automation) with **OpenCode Agents** (Intelligence) to produce "King-bad" quizzes automatically.

## Directory Structure

- **`workflows/`**: JSON files for n8n workflows. Import these into your n8n instance.
- **`scripts/`**: Python/Shell scripts used by n8n to interact with the system (e.g., Supabase upload, Agent invocation).

## Core Workflows

### 1. Daily HCMC Buzz Quiz (`daily_quiz_gen.json`)

- **Trigger**: Every day at 10:00 AM.
- **Process**:
  1. **Trend Hunting**: Scrapes keywords.
  2. **Agent Assembly**: Calls `@PastLife` or `@MBTI` based on topic.
  3. **Inspector J Bad**: Verifies humor quality.
  4. **Deployment**: Uploads to Turso via `/api/webhooks/n8n-quiz` (see `daily_quiz_gen_turso.json`).

## Setup

1. Ensure `GEMINI_API_KEY` or agent keys are set in your `.env`.
2. Set `N8N_WEBHOOK_SECRET` on Vercel and n8n.
3. Run `npm run db:migrate-phase2` for push subscriptions table.
4. Run n8n: `npx n8n start` and import `workflows/daily_quiz_gen_turso.json`.

See `docs/N8N_SETUP.md` and `docs/PUSH_SETUP.md`.
