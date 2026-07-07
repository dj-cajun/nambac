# 원격 작업 가이드 (로컬 PC 없이)

로컬에서 `npm run dev` / 백필을 돌릴 수 없을 때 **GitHub Actions**로 계속 진행합니다.

## 1. GitHub Secrets 등록 (최초 1회)

Repository → **Settings → Secrets and variables → Actions → New repository secret**

| Secret | 필수 | 값 |
|--------|------|-----|
| `TURSO_DATABASE_URL` | ✅ | `.env.local`과 동일 |
| `TURSO_AUTH_TOKEN` | ✅ | `.env.local`과 동일 |
| `GEMINI_API_KEY` | ✅ | Google AI 키 |
| `OPENROUTER_API_KEY` | ✅ | OpenRouter 키 (이미지 + Gemini fallback) |
| `VITE_GEMINI_API_KEY` | 권장 | Gemini 키 (없으면 `GEMINI_API_KEY`만) |
| `OPENROUTER_TEXT_MODEL` | 선택 | 기본 `deepseek/deepseek-v4-pro` (Gemini 실패 시) |
| `OPENROUTER_IMAGE_MODEL` | 선택 | 기본 `black-forest-labs/flux.2-klein-4b` |

터미널에서 한 번에 등록 (로컬 `.env.local` 있을 때):

```bash
gh secret set TURSO_DATABASE_URL --body "$(grep TURSO_DATABASE_URL .env.local | cut -d= -f2-)"
gh secret set TURSO_AUTH_TOKEN --body "$(grep TURSO_AUTH_TOKEN .env.local | cut -d= -f2-)"
gh secret set GEMINI_API_KEY --body "$(grep GEMINI_API_KEY .env.local | cut -d= -f2-)"
gh secret set OPENROUTER_API_KEY --body "$(grep OPENROUTER_API_KEY .env.local | cut -d= -f2-)"
```

## 2. 이미지 백필 실행 (원격)

### 수동 실행 (휴대폰·다른 PC에서도 가능)

1. https://github.com/dj-cajun/nambac/actions/workflows/backfill-images.yml
2. **Run workflow** → `max_batches` (기본 15), `force` 필요 시 체크
3. 완료 후 Vercel이 자동 배포 (이미지 커밋 시)

### 자동 스케줄

- **6시간마다** 누락 cover+결과 8장 채움 (`max_batches=10`)
- Gemini 할당량 초과 시 → OpenRouter DeepSeek V4 Pro fallback

### 동작 요약

```
GitHub Runner → Turso DB 업데이트 → `public/images/backfill_*.webp` 커밋 → push → Vercel 배포
```

## 3. 일일 퀴즈 (이미 설정됨)

Vercel Cron `03:00 UTC` = **10:00 ICT** — `docs/CRON_SETUP.md` 참고.

수동 트리거:

```bash
curl -X POST "https://nambac.vercel.app/api/cron/daily-quiz" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## 4. 진행 확인

- Actions 탭 → **Remote image backfill** → 로그 / Artifacts `backfill-log-*`
- Admin → 퀴즈 썸네일 / 결과 페이지 이미지 확인

## 5. 로컬에만 있는 이미지

로컬 `public/images/backfill_*.webp`가 아직 push 안 됐으면:

- **옵션 A**: 원격 워크플로우가 DB 기준으로 다시 생성 (API 비용)
- **옵션 B**: 로컬 복귀 후 `git add public/images/backfill_*.webp && git push`

## 6. Cursor Cloud Agent

코드 수정은 Cursor **Cloud Agent**에 같은 repo 연결 후 채팅으로 이어갈 수 있습니다.  
이미지·DB 작업은 위 GitHub Actions를 사용하세요.
