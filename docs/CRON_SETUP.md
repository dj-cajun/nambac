# Vercel Cron — 일일 퀴즈 자동 생성

> API는 Hobby 12함수 제한 대응으로 **`api/[...path].js` 단일 라우터**에 통합되어 있습니다.

n8n 없이 **Vercel Cron**이 매일 Gemini → Turso → Push까지 처리합니다.

## 1. Vercel 환경 변수

| Key | 필수 | 설명 |
|-----|------|------|
| `CRON_SECRET` | ✅ | Cron 인증 — **직접 만든 랜덤 문자열** (Vercel이 제공하는 값 아님) |
| `VITE_GEMINI_API_KEY` | ✅ | 퀴즈 텍스트 (이미 있으면 OK) |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Push용 | `npm run vapid:generate` 후 Vercel에 3개 등록 |
| `TURSO_*` | ✅ | DB |

**Vercel 입력 예:** Name=`CRON_SECRET`, Value=`nambac-cron-2026-xxxxxxxx` (본인만 아는 문자열)

저장 후 **Redeploy** 필수.

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

## 6. Hobby 제한

- **Serverless Functions**: 1개 (`api/[...path].js`)
- **일일 배포 100회**: 한도 초과 시 익일 자동 배포 — `docs/VERCEL_ENV.md`
- Cron **Pro** 권장; 로컬 대안: `npm run daily:quiz`
