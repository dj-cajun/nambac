# nambac Roadmap (Vietnam Upgrade)

## Phase 0 — Launch Ready ✅ (2026-07)

- [x] Turso DB + Vercel API
- [x] 8 Expert categories unified
- [x] OG/meta Vietnamese + Explore/BXH + GA4 dataLayer

## Phase 1 — Growth ✅

- [x] Share URLs dynamic (`siteUrl.js`)
- [x] Result 9:16 Story download
- [x] Android PWA install prompt
- [x] Image backfill script + GTM guide
- [x] AdSense plumbing — pub ID + units + consent + `ad_impression` (`docs/ADSENSE_SETUP.md`; enable on Vercel after slot IDs)
- [x] GTM event map — quiz/fortune/feature/push (`docs/GTM_SETUP.md`; publish container in dashboard)

## Phase 2 — Viral ✅ (code)

- [x] Web push (`sw.js`, `/api/push/*`, PushPrompt)
- [x] **Daily quiz — Vercel Cron** → `/api/cron/daily-quiz` (`docs/CRON_SETUP.md`) ← **권장**
- [x] Daily quiz — n8n webhook (선택) → `docs/N8N_SETUP.md`
- [x] Influencer / brand quiz templates (`shared/quizTemplates.js`)

## Phase 3 — Monetization ✅ (code)

- [x] Sponsored quiz flow (design/config DB + CustomQuiz + Editor)
- [x] Brand dashboard — `/brands/report/:quizId/:token` + Admin Analytics tab
- [x] Premium ad-free tier — `?premium=CODE` + `src/lib/premium.js`

## Phase 4 — Platform hardening ✅ (2026-07)

- [x] Player grade tiers (guest + login merge)
- [x] Trust www Origin for visit / grade POSTs
- [x] Quiz list payload slim + CDN/memory cache
- [x] Route code-split + html2canvas lazy load
- [x] Dynamic/static sitemap with quiz URLs (www canonical)
- [x] Prod API smoke in CI
- [x] Remove unused Cloudflare Workers Git build

## Ops checklist

1. ✅ `CRON_SECRET` + Gemini — Vercel 등록됨 (배포 한도 해제 후 자동 반영)
2. ✅ `VAPID_*` — local + GitHub Actions secrets; **add same 3 keys on Vercel Production** then Redeploy (`docs/PUSH_SETUP.md`)
3. ✅ Turso migrate (`npm run db:migrate-phase2`)
4. GTM 4 events — `docs/GTM_SETUP.md` (대시보드)
5. AdSense — `docs/ADSENSE_SETUP.md` (지금 OFF)
6. ✅ `nambac.xyz` / `www` — Vercel production
7. 배포 후: `docs/VERCEL_ENV.md` smoke test / `npm run verify:api`
8. ✅ Cloudflare leftover Workers build disconnected
