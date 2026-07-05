# Legacy (not used in production)

Turso + Vercel Cron + `shared/` prompts replaced this stack.

| Path | Was |
|------|-----|
| `backend/` | FastAPI + Python `NambacFactory` |
| `supabase/` | Supabase CLI + migrations |
| `supabase_setup*.sql` | Manual Supabase DDL |
| `tools/` | One-off JSON category migration |

**Production:** `api/`, `shared/`, `turso/`, `scripts/`.

n8n agent path (optional): `automation/scripts/invoke_agent.py` → `legacy/backend/logic/factory.py`.
