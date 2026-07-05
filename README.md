# 🎯 Nambac — Trắc nghiệm tính cách AI (Gen Z Sài Gòn)

> **nambac.xyz** — AI quiz platform for Vietnamese Gen Z

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + Vite 7 + Tailwind CSS 4 |
| **API** | Vercel Serverless (`api/`) + Express dev proxy (`server/dev-api.mjs`) |
| **Database** | Turso (LibSQL) |
| **AI Text** | Google Gemini 2.5 Flash |
| **AI Images** | OpenRouter (FLUX Klein) |
| **Analytics** | Google Tag Manager → GA4 events |
| **Deploy** | Vercel (frontend + API routes) |

## 🚀 Quick Start

### 1. Environment

```bash
git clone <repo-url>
cd nambac
cp .env.example .env.local
# Fill in Turso, Gemini, OpenRouter, Admin keys
```

### 2. Database init (first time)

```bash
npm install
npm run db:init
npm run db:migrate      # if migrating from legacy JSON
```

### 3. Local development (two terminals)

```bash
npm run dev:api         # Turso API → http://localhost:8787
npm run dev             # Vite → http://localhost:5173
```

Vite proxies `/api/*` to port 8787.

## 📁 Project Structure

```
nambac/
├── api/                  # Vercel serverless routes
│   ├── _lib/             # Turso client, quiz DB, categories
│   ├── quizzes/          # Public + admin quiz CRUD
│   ├── generate-image.js # OpenRouter image proxy
│   └── og.js             # SSR Open Graph for bots
├── shared/               # Shared modules (categories — NOT under /api)
├── server/dev-api.mjs    # Local API dev server
├── src/
│   ├── pages/            # Home, Quiz, Result, Admin, Editor, Brands…
│   ├── lib/              # quizApi, gemini, analytics, adsConfig
│   └── constants/        # QUIZ_CATEGORIES (8 Expert agents)
├── public/               # Static assets, manifest, og-default.png
└── scripts/              # db init, migrate, e2e tests
```

## 🎮 Core Features

- **8 category Expert agents** — MBTI, Personality, PastLife, Fortune, Survival, Trendy, Delivery, Lookalike
- **5-question binary quiz** → 8 results (3-bit scoring)
- **AI quiz generation** — Gemini text + OpenRouter cover/result images
- **So Kèo compatibility** — friend result matching
- **B2B brand inquiries** — `/brands` landing + Admin CRM tab
- **Explore / BXH** — viral share ranking & view leaderboard

## 📊 Analytics Events (GTM dataLayer)

| Event | Trigger |
|---|---|
| `quiz_start` | User starts a quiz |
| `quiz_complete` | Result page loads |
| `share_zalo` | Zalo / compat share |
| `compat_start` | Compatibility page loads |

## 🧪 Testing

```bash
npm run test:e2e        # Requires dev servers running
npm run build           # Production build
```

## 🌐 Production Deploy

Deploy to Vercel with env vars from `.env.example`.  
Turso credentials are server-side only (`TURSO_*`, no `VITE_` prefix).

## 📜 Legacy

`backend/main.py` (FastAPI) is legacy — production uses `api/` + Turso.  
Do not import from `api/_lib/` in frontend; use `shared/categories.js` instead (Vite `/api` proxy conflict).
