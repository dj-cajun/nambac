# Web Push 설정

## 1. VAPID 키

로컬에 키가 있으면:

```bash
# already generated → keep in .env.local
# regenerate only if rotating:
npm run vapid:generate
```

Required keys:

```env
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:nam@nambac.xyz
```

## 2. Where to register

| Target | Status / action |
|--------|-----------------|
| `.env.local` | Local keys (for `npm run dev`) |
| **GitHub Actions secrets** | Synced for daily-quiz push notify |
| **Vercel Production env** | **Required** for `GET /api/push/subscribe` on www |

Vercel dashboard → Project → Settings → Environment Variables → add the 3 `VAPID_*` keys for **Production** → **Redeploy**.

Without Vercel env, the site still works but push subscribe returns an empty `publicKey`.

## 3. DB

```bash
npm run db:migrate-phase2
```

Creates `push_subscriptions`.

## 4. App behavior

- `public/sw.js` — receive + open URL
- `PushPrompt` — subscribe banner (`push_prompt` GTM events)
- `GET /api/push/subscribe` — returns `{ publicKey }`
- `POST /api/push/subscribe` — store subscription
- `POST /api/push/notify` — admin broadcast

## 5. Verify

```bash
npm run verify:ops
curl -s https://www.nambac.xyz/api/push/subscribe
# expect: {"publicKey":"..."}  (non-empty after Vercel env + redeploy)
```

## 6. Premium (ad-free)

`?premium=nambac-vip` or `VITE_PREMIUM_CODE` — hides AdSense.
