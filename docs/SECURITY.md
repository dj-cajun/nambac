# Security — nambac

> Phase 1 (2026-07) 기준. env·인증·공개 API 정책.

## Environment variables

### Server-only (Vercel — `VITE_` prefix 금지)

| Key | 용도 |
|-----|------|
| `TURSO_DATABASE_URL` | Turso DB |
| `TURSO_AUTH_TOKEN` | Turso auth |
| `ADMIN_API_KEY` | Admin API (`X-Admin-Key`) — **Production 필수** |
| `GEMINI_API_KEY` (+ `_2` / `GEMINI_API_KEYS`) | 퀴즈 텍스트·이미지 (서버) |
| `OPENROUTER_API_KEY` | 이미지·LLM fallback |
| `CRON_SECRET` | `/api/cron/*` |
| `N8N_WEBHOOK_SECRET` | `/api/webhooks/*` |
| `VAPID_*` | Web Push |

### Client-safe (`VITE_`)

| Key | 용도 |
|-----|------|
| `VITE_API_URL` | API base (`/api`) |
| `VITE_SITE_URL` | OG·canonical URL |
| `VITE_ADSENSE_*` | AdSense (선택) |
| `VITE_PREMIUM_CODE` | 광고 제거 코드 (미설정 시 비활성) |

### 사용하지 않음 (Production)

- `VITE_GEMINI_API_KEY` — 브라우저 Gemini 호출 제거됨
- `VITE_ADMIN_API_KEY` — Admin unlock은 sessionStorage; 번들 노출 불필요

로컬 dev 편의: `.env.local`에 `VITE_ADMIN_API_KEY` 선택 가능.

## Admin

- `api/_lib/adminAuth.js`: Production에서 `ADMIN_API_KEY` 없으면 **503** (fail-closed).
- `/admin` UI: 첫 방문 시 Admin key 입력 → `sessionStorage` (탭 종료 시 소멸).
- 추가 보호 (권장): Vercel **Deployment Protection** 또는 IP allowlist.

## Public API

| Route | 정책 |
|-------|------|
| `GET /api/quizzes` | active + non-hidden 목록 |
| `GET /api/quizzes/:id` | active + non-hidden만 (draft/hidden ID 유출 방지) |
| `POST /api/quizzes/:id/stats` | active 퀴즈만; Production Referer/Origin 검증 |
| `GET /api/admin/quizzes/:id` | Admin key — hidden 포함 |

## Webhooks & Cron

- Cron: `Authorization: Bearer CRON_SECRET` 또는 `?secret=`
- n8n: `X-Webhook-Secret` / Bearer / `?secret=` + `validateQuizPayload` (questions/results 있을 때)

## 배포 체크리스트

1. Vercel Production env: `ADMIN_API_KEY`, `GEMINI_API_KEY`, `CRON_SECRET` 설정
2. `VITE_GEMINI_API_KEY`, `VITE_ADMIN_API_KEY` **제거**
3. `npm run build` + `npm run verify:api` (로컬)
4. 배포 후 `/admin` unlock + hidden 퀴즈 public 404 확인
