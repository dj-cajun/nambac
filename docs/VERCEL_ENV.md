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
| `ADMIN_API_KEY` | 랜덤 문자열 | Admin API (스크립트·레거시) |
| `ADMIN_USERNAME` | `admin` | 어드민 페이지 로그인 아이디 |
| `ADMIN_PASSWORD` | 랜덤 문자열 | 어드민 페이지 로그인 비밀번호 |
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

## Push 알림 (Production에 등록 필요)

| Key | 생성 |
|-----|------|
| `VAPID_PUBLIC_KEY` | 로컬 `.env.local` / `npm run vapid:generate` |
| `VAPID_PRIVATE_KEY` | ↑ |
| `VAPID_SUBJECT` | `mailto:nam@nambac.xyz` |

GitHub Actions secrets에도 동일 키가 있어야 daily-quiz 푸시가 동작합니다.  
**Vercel Production에도 같은 3개를 넣고 Redeploy** — 없으면 `GET /api/push/subscribe`의 `publicKey`가 비어 있습니다.

## AdSense (기본 OFF — `docs/ADSENSE_SETUP.md`)

| Key | |
|-----|--|
| `VITE_ADSENSE_ENABLED` | `true` (슬롯 준비 후) |
| `VITE_ADSENSE_PUB_ID` | `ca-pub-7386903584540643` |
| `VITE_ADSENSE_SLOT_*` | AdSense에서 만든 4개 슬롯 ID |

Vite 변수는 **빌드 타임**에 박히므로 env 변경 후 반드시 Redeploy.

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

Admin: `/admin` → `ADMIN_USERNAME` / `ADMIN_PASSWORD` 로그인
