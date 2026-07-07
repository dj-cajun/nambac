# 일일 퀴즈 자동 생성 (GitHub Actions)

> Vercel Cron은 사용하지 않습니다. **GitHub Actions**에서 퀴즈 생성·이미지 백필·커밋까지 한 번에 처리합니다.

## 1. 스케줄

`.github/workflows/daily-quiz.yml`:

```yaml
schedule:
  - cron: '0 3 * * *'   # 03:00 UTC = 10:00 ICT
```

카테고리는 8 Expert 중 **날짜별 로테이션** (MBTI → … → Lookalike).

## 2. GitHub Secrets (Actions)

| Secret | 필수 | 설명 |
|--------|------|------|
| `TURSO_DATABASE_URL` | ✅ | Turso DB |
| `TURSO_AUTH_TOKEN` | ✅ | Turso 토큰 |
| `GEMINI_API_KEY` | ✅ | 퀴즈 텍스트 생성 |
| `OPENROUTER_API_KEY` | ✅ | 이미지 + Gemini fallback |
| `VITE_GEMINI_API_KEY` | 권장 | Gemini 키 (없으면 `GEMINI_API_KEY`) |
| `OPENROUTER_TEXT_MODEL` | 선택 | Gemini 실패 시 텍스트 모델 |
| `OPENROUTER_IMAGE_MODEL` | 선택 | 이미지 모델 |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Push용 | `npm run vapid:generate` 후 등록 |

등록 방법: `docs/REMOTE_OPS.md` §1 참고.

## 3. 동작 흐름

```
GitHub Actions (03:00 UTC)
  → Gemini 퀴즈 생성 → Turso 저장
  → Web Push (VAPID 있을 때)
  → cover + 결과 8장 backfill
  → public/images/backfill_*.webp 커밋 → push → Vercel 자동 배포
```

누락 이미지 보완: `.github/workflows/backfill-images.yml` (2시간마다 스캔).

## 4. 수동 실행

### 로컬 (권장)

```bash
# .env.local에 TURSO_*, GEMINI_API_KEY, OPENROUTER_API_KEY
npm run daily:quiz
```

특정 카테고리:

```bash
npm run daily:quiz -- --category=Trendy
```

이미지·푸시 생략:

```bash
npm run daily:quiz -- --no-images --no-push
```

### GitHub Actions UI

1. https://github.com/dj-cajun/nambac/actions/workflows/daily-quiz.yml
2. **Run workflow** → 카테고리·옵션 선택

### Vercel API (레거시, 텍스트만)

`CRON_SECRET`이 Vercel에 설정되어 있으면 수동 curl 가능. 이미지는 GHA에서 처리하므로 API 기본값은 `backfill: false`.

```bash
curl -X POST "https://nambac.xyz/api/cron/daily-quiz" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

로컬에서 API 경유:

```bash
npm run daily:quiz:api -- --prod
```

## 5. Vercel Cron 비활성화

`vercel.json`에서 `crons` 배열을 제거했습니다. Vercel 대시보드 Cron 탭에 항목이 남아 있으면 삭제하세요.

## 6. Hobby 제한

- Vercel serverless에서 이미지 파일 저장 불가 → GHA에서 커밋 후 배포
- 일일 배포 한도: `docs/VERCEL_ENV.md`
