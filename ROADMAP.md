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
- [x] Daily quiz automation — n8n → `/api/webhooks/n8n-quiz` (`docs/N8N_SETUP.md`)
- [x] Influencer / brand quiz templates (`shared/quizTemplates.js`)

## Phase 3 — Monetization ✅ (code)

- [x] Sponsored quiz flow (design/config DB + CustomQuiz + Editor)
- [x] Brand dashboard — `/brands/report/:quizId/:token` + Admin Analytics tab
- [x] Premium ad-free tier — `?premium=CODE` + `src/lib/premium.js`

## Ops checklist

1. `npm run vapid:generate` → Vercel env
2. `npm run db:migrate-phase2` on Turso
3. `N8N_WEBHOOK_SECRET` on Vercel + n8n workflow import
4. GTM 4 events publish
5. AdSense slot IDs in Vercel env
6. `nambac.xyz` domain restore (Onamae clientHold)
