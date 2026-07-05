# Web Push 설정 (Phase 2)

## 1. VAPID 키 생성

```bash
npm run vapid:generate
```

출력된 값을 `.env.local` 및 Vercel에 추가:

```
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:nam@nambac.xyz
```

## 2. DB 마이그레이션

```bash
npm run db:migrate-phase2
```

`push_subscriptions` 테이블 생성.

## 3. 동작

- `public/sw.js` — 푸시 수신 + 클릭 시 퀴즈 URL 열기
- `PushPrompt` — 홈/퀴즈 하단 구독 배너
- `POST /api/push/subscribe` — 구독 저장
- `POST /api/push/notify` — Admin 전체 발송 (X-Admin-Key)

## 4. Admin 테스트 발송

```bash
curl -X POST https://nambac.vercel.app/api/push/notify \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: YOUR_ADMIN_KEY" \
  -d '{"title":"nambac","body":"Quiz mới!","url":"/"}'
```

## 5. Premium (광고 제거)

URL: `?premium=nambac-vip` 또는 env `VITE_PREMIUM_CODE`  
localStorage에 저장되어 AdSense 숨김.
