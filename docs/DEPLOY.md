# Deploy notes — nambac.xyz

## Canonical host
- **Production URL:** `https://www.nambac.xyz`
- Apex `https://nambac.xyz` redirects to www
- Set `VITE_SITE_URL=https://www.nambac.xyz` in Vercel + GitHub Actions

## Hosting
- **Primary:** Vercel (frontend + `api/handler.js` serverless)
- DNS for `www` / apex points at Vercel

## Cloudflare (removed)
Unused Cloudflare Workers/Pages Git integration for `nambac` was **disconnected and deleted** (2026-07).

- Production traffic was never on Cloudflare (Vercel serves `www.nambac.xyz`)
- Old GitHub check **Workers Builds: nambac** was noise from a broken build command (`/`)
- New pushes should no longer show that check

If a stale failure still appears on an old commit, ignore it — only the latest commit checks matter.

## Google OAuth (로그인)

Google Cloud Console → OAuth 클라이언트 → **승인된 리디렉션 URI**에 아래를 등록:

- `https://www.nambac.xyz/api/auth/google/callback` (필수 — canonical)
- `https://nambac.xyz/api/auth/google/callback` (선택 — apex 리다이렉트 대비)

`GOOGLE_REDIRECT_URI` env를 비우면 Vercel에서 www 콜백을 자동 사용합니다.

## Cache
`GET /api/quizzes` sets:
- `Cache-Control` / `CDN-Cache-Control` / `Vercel-CDN-Cache-Control`
- `s-maxage=60, stale-while-revalidate=300`
- plus a 30s in-memory cache on warm serverless instances

Public GET stats (`/api/balance`, `/api/fortune/stats`, `/api/feature/stats`) use short CDN cache (`s-maxage=30`).

## Sitemap
- Static file: `public/sitemap.xml` (committed, includes quiz URLs)
- Regenerate: `npm run sitemap:generate`
- Daily quiz workflow regenerates + commits sitemap after new quizzes
