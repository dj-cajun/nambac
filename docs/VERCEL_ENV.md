# Vercel Environment Variables — 체크리스트

배포 한도(일 100회)와 무관하게, **다음 배포 전** 아래를 확인하세요.

상세 보안: [`docs/SECURITY.md`](./SECURITY.md)

## 필수

| Key | 예시 | 용도 |
|-----|------|------|
| `TURSO_DATABASE_URL` | `libsql://....turso.io` | DB |
| `TURSO_AUTH_TOKEN` | `eyJ...` | DB |
| `VITE_API_URL` | `/api` | 프론트 → API |
| `GEMINI_API_KEY` | `AIza...` | AI 퀴즈 텍스트 (서버) |
| `OPENROUTER_API_KEY` | `sk-or-...` | AI 이미지 (서버) |
| `ADMIN_API_KEY` | 랜덤 문자열 | Admin API — Production 필수 |
| `GOOGLE_CLIENT_ID` | `....apps.googleusercontent.com` | Google 로그인 |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-...` | Google 로그인 (서버 전용) |
| `SESSION_SECRET` | 랜덤 문자열 | 로그인 세션 쿠키 서명 |
| `ADMIN_ALLOWED_EMAILS` | `you@gmail.com` | Google 로그인 시 admin 권한 |
| `CRON_SECRET` | 랜덤 문자열 | 일일 퀴즈 Cron |

## Production에서 제거

| Key | 이유 |
|-----|------|
| `VITE_GEMINI_API_KEY` | 브라우저 Gemini 제거 — 서버 `GEMINI_API_KEY`만 사용 |
| `VITE_ADMIN_API_KEY` | Admin unlock은 sessionStorage — 번들 노출 불필요 |

## Push 알림 (선택)

| Key | 생성 |
|-----|------|
| `VAPID_PUBLIC_KEY` | `npm run vapid:generate` |
| `VAPID_PRIVATE_KEY` | ↑ |
| `VAPID_SUBJECT` | `mailto:nam@nambac.xyz` |

## AdSense (기본 OFF — `docs/ADSENSE_SETUP.md`)

| Key | |
|-----|--|
| `VITE_ADSENSE_ENABLED` | `true` 로 켜기 |
| `VITE_ADSENSE_PUB_ID` | ca-pub-... |
| `VITE_ADSENSE_SLOT_*` | 4개 슬롯 |

## 기타

| Key | |
|-----|--|
| `VITE_SITE_URL` | `https://www.nambac.xyz` (실제 접속 도메인과 동일) |
| `VITE_PREMIUM_CODE` | 설정 시에만 광고 제거 (`?premium=CODE`) |

## Hobby 제한

- **Serverless Functions**: API는 `api/handler.js` **1개**로 통합
- **일일 배포 100회**: 한도 초과 시 다음 날 자동 배포 또는 수동 1회만
- 한도 중에는 **로컬 검증**으로 대체: `npm run dev` → `npm run verify:api` → `npm run smoke:og`

## 배포 전 로컬 smoke test

```bash
npm run dev          # 터미널 1
npm run verify:api   # API 200 확인
npm run smoke:og     # OG HTML + 합성 이미지 1200×630
npm run build        # 프론트 빌드
npm run audit:quizzes
npm run lint
```

## 배포 후 smoke test

```bash
curl -s https://nambac.vercel.app/api/quizzes | head -c 80
curl -s -X POST https://nambac.vercel.app/api/cron/daily-quiz \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" -d '{"notify":false}'
```

Admin: `/admin` → `ADMIN_API_KEY` 입력 unlock
