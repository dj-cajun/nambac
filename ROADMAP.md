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
- [ ] Real AdSense slot IDs — Vercel env에 슬롯 ID 입력 (코드 준비됨)
- [ ] GTM triggers — `docs/GTM_SETUP.md` 대시보드 설정 (코드 준비됨)

## Phase 2 — Viral ✅ (code)

- [x] Web push (`sw.js`, `/api/push/*`, PushPrompt)
- [x] **Daily quiz — Vercel Cron** → `/api/cron/daily-quiz` (`docs/CRON_SETUP.md`) ← **권장**
- [x] Daily quiz — n8n webhook (선택) → `docs/N8N_SETUP.md`
- [x] Influencer / brand quiz templates (`shared/quizTemplates.js`)

## Phase 3 — Monetization ✅ (code)

- [x] Sponsored quiz flow (design/config DB + CustomQuiz + Editor)
- [x] Brand dashboard — `/brands/report/:quizId/:token` + Admin Analytics tab
- [x] Premium ad-free tier — `?premium=CODE` + `src/lib/premium.js`

## Ops checklist

1. `CRON_SECRET` + Gemini key on Vercel → Redeploy (Cron 10:00 ICT)
2. `npm run vapid:generate` → Vercel env (push)
3. `npm run db:migrate-phase2` on Turso
4. GTM 4 events publish (`docs/GTM_SETUP.md`)
5. AdSense slot IDs in Vercel env
6. `nambac.xyz` domain restore (Onamae clientHold)
