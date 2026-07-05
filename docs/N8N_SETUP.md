# n8n → Turso 자동 퀴즈 배포

## 1. 환경 변수 (n8n + Vercel)

| Key | 위치 | 용도 |
|-----|------|------|
| `N8N_WEBHOOK_SECRET` | Vercel + n8n | `/api/webhooks/n8n-quiz` 인증 |
| `TURSO_*` | Vercel only | DB (웹훅 API가 처리) |

Vercel에 `N8N_WEBHOOK_SECRET` 추가 후 Redeploy.

## 2. 워크플로 Import

`automation/workflows/daily_quiz_gen_turso.json` → n8n Import

- **10:00 AM** 스케줄
- Trend Hunter → Quiz Agent → **HTTP POST** Turso API

## 3. Webhook 페이로드 형식

```json
{
  "title": "Quiz title (Vietnamese)",
  "description": "...",
  "category": "Trendy",
  "quiz_type": "binary_5q",
  "notify": true,
  "questions": [
    { "question_text": "...", "option_a": "...", "option_b": "...", "score_a": 0, "score_b": 4 }
  ],
  "results": [
    { "result_code": 0, "title": "...", "description": "..." }
  ]
}
```

## 4. 수동 테스트

```bash
curl -X POST https://nambac.vercel.app/api/webhooks/n8n-quiz \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: YOUR_SECRET" \
  -d '{"title":"Test Quiz","category":"Trendy","questions":[],"results":[]}'
```

## 5. Push 알림

`notify: true`(기본)이면 새 퀴즈 생성 후 구독자에게 Web Push 발송.  
VAPID 설정은 `docs/PUSH_SETUP.md` 참고.
