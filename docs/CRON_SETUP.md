# Vercel Cron — 일일 퀴즈 자동 생성

n8n 없이 **Vercel Cron**이 매일 Gemini → Turso → Push까지 처리합니다.

## 1. Vercel 환경 변수

| Key | 필수 | 설명 |
|-----|------|------|
| `CRON_SECRET` | ✅ | Cron 인증 (임의의 긴 문자열) |
| `VITE_GEMINI_API_KEY` 또는 `GEMINI_API_KEY` | ✅ | 퀴즈 텍스트 생성 |
| `TURSO_*` | ✅ | DB |
| `VAPID_*` | 선택 | 생성 후 Push 알림 |

Vercel Dashboard → Settings → Environment Variables → **Redeploy**

## 2. 스케줄

`vercel.json`:

```json
"crons": [{ "path": "/api/cron/daily-quiz", "schedule": "0 3 * * *" }]
```

- **03:00 UTC** = **10:00 호치민 (ICT)**
- 카테고리는 8 Expert 중 **날짜별 로테이션** (MBTI → … → Lookalike)

## 3. 수동 실행

로컬 (dev API 실행 중):

```bash
# .env.local에 CRON_SECRET 추가
npm run dev:api   # 터미널 1
npm run daily:quiz   # 터미널 2
```

특정 카테고리:

```bash
npm run daily:quiz -- --category=Trendy
```

프로덕션 curl:

```bash
curl -X POST "https://nambac.vercel.app/api/cron/daily-quiz" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## 4. Vercel Cron 보안

Vercel이 Cron 호출 시 `Authorization: Bearer ${CRON_SECRET}` 헤더를 자동 전송합니다.  
`CRON_SECRET`은 Git에 커밋하지 마세요.

## 5. n8n vs Cron

| | Vercel Cron | n8n |
|--|-------------|-----|
| 설치 | 없음 | 별도 |
| 일 1퀴즈 | ✅ 기본 | 가능 |
| 이미지 9장 | ❌ (수동/backfill) | 파이프라인 확장 가능 |
| SNS/Slack | 코드 추가 필요 | GUI |

이미지가 필요하면 생성 후 `npm run images:backfill -- --quiz-id=...` 실행.

## 6. Hobby 플랜

Cron은 **Pro**에서 안정적입니다. Hobby는 제한이 있을 수 있어, 실패 시 `npm run daily:quiz`를 GitHub Actions cron으로 대체할 수 있습니다.
