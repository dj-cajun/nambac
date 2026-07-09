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
