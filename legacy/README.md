# Legacy (not used in production)

Turso + Vercel Cron + `shared/` prompts replaced this stack.

| Path | Was |
|------|-----|
| `backend/` | FastAPI + Python `NambacFactory` |
| `supabase/` | Supabase CLI + migrations |
| `supabase_setup*.sql` | Manual Supabase DDL |
| `tools/` | One-off JSON category migration |

**Production:** `api/`, `shared/`, `turso/`, `scripts/`.

## Import 금지

- 런타임 코드(`src/`, `api/`, `shared/`)에서 `legacy/`를 **import 하지 마세요**.
- `.vercelignore`로 배포에서 제외됩니다.
- 참고·아카이브·과거 프롬프트 열람용으로만 유지합니다 (monorepo 유지 결정).

n8n agent path (optional): `automation/scripts/invoke_agent.py` → `legacy/backend/logic/factory.py`.
