# Deploy notes — nambac.xyz

## Canonical host
- **Production URL:** `https://www.nambac.xyz`
- Apex `https://nambac.xyz` redirects to www
- Set `VITE_SITE_URL=https://www.nambac.xyz` in Vercel + GitHub Actions

## Hosting
- **Primary:** Vercel (frontend + `api/handler.js` serverless)
- DNS for `www` / apex points at Vercel

## Cloudflare Workers Builds (GitHub check)
A GitHub check named **Workers Builds: nambac** may still run on every push and fail.

This repo is **not** a Cloudflare Workers app (no `wrangler.toml` / OpenNext). The check comes from a leftover Cloudflare GitHub App / Workers Builds link.

**Fix (dashboard, one-time):**
1. Open [Cloudflare Dashboard → Workers → nambac](https://dash.cloudflare.com/)
2. Disconnect **Git integration / Workers Builds** for this repository  
   (or delete the unused Workers script if it is not serving traffic)
3. Optionally uninstall the Cloudflare GitHub App from the `dj-cajun/nambac` repo if unused

Until disconnected, the red check is noise — Vercel deploy is what serves production.

## Cache
`GET /api/quizzes` sets:
- `Cache-Control` / `CDN-Cache-Control` / `Vercel-CDN-Cache-Control`
- `s-maxage=60, stale-while-revalidate=300`
- plus a 30s in-memory cache on warm serverless instances

## Sitemap
- Static file: `public/sitemap.xml` (committed, includes quiz URLs)
- Regenerate: `npm run sitemap:generate`
- Daily quiz workflow regenerates + commits sitemap after new quizzes
