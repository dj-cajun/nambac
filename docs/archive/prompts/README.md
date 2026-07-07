# Prompt archive index

Runtime prompts live in **`shared/*.js`** — see [`docs/AI_PROMPTS.md`](../../AI_PROMPTS.md).

| Location | Status |
|----------|--------|
| `shared/quizPrompts.js` + `quizExpertPrompts.js` | **Active** — quiz text |
| `shared/imagePrompts.js` + `imageStyles.js` | **Active** — images |
| `.claude/agents/*.md` | Reference / Claude agent defs |
| `legacy/backend/agents_nambac/prompts/*.md` | Supabase-era archive |

Do not duplicate prompt text into new `.md` files; edit the `shared/` modules instead.
