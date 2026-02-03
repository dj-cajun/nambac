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
  4. **Deployment**: Uploads to Supabase.

## Setup

1. Ensure `OPENAI_API_KEY` or `GEMINI_API_KEY` is set in your `.env`.
2. Install python dependencies: `pip install requests supabase`.
3. Run n8n: `npx n8n start`.
