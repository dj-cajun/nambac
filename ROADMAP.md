# nambac Roadmap (Vietnam Upgrade)

## Phase 0 — Launch Ready ✅ (2026-07)

- [x] Turso DB + Vercel API
- [x] 8 Expert categories unified (Home / Editor / Gemini)
- [x] `shared/categories.js` (Vite proxy fix)
- [x] index.html OG/meta 100% Vietnamese
- [x] `public/og-default.png`
- [x] ShareRedirect + Compatibility OG tags
- [x] GA4 events via GTM dataLayer (`quiz_start`, `quiz_complete`, `share_zalo`, `compat_start`)
- [x] AdSense env-based slots (no placeholder IDs in prod)
- [x] Explore (`/explore`) + BXH (`/leaderboard`) MVP
- [x] Home sort tabs (Hot / Viral / Mới)
- [x] Footer + Editor + Admin Vietnamese UI
- [x] README + `.env.example` updated

## Phase 1 — Growth (in progress)

- [ ] Real AdSense slot IDs in production env
- [ ] GTM triggers for 4 custom events (dashboard)
- [x] Batch image backfill script (`npm run images:backfill`)
- [x] GTM setup guide (`docs/GTM_SETUP.md`)
- [x] Share URLs dynamic (`vercel.app` until domain restored)
- [x] Result 9:16 Story download
- [x] Android PWA install prompt (`beforeinstallprompt`)

## Phase 2 — Viral

- [ ] Web push notifications
- [ ] Daily quiz automation (n8n → Turso)
- [ ] Influencer / brand quiz templates

## Phase 3 — Monetization

- [ ] Sponsored quiz type full flow
- [ ] Brand dashboard analytics
- [ ] Premium ad-free tier (optional)
