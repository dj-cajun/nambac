# nambac 코드베이스 정리 기획서

> 작성: 2026-07-07  
> 목적: 폴더·파일 구조 정리, 유령 코드 제거, 보안 취약점 해소, 유지보수성 개선

---

## 1. 현재 아키텍처 (유지)

```
Production
├── src/              React SPA (Vite → dist/)
├── api/handler.js    Vercel 단일 진입 → _lib/router.js → handlers/*
├── shared/           퀴즈·이미지 프롬프트 SoT (API + 스크립트 공용)
├── turso/            DB 스키마·마이그레이션
├── public/           정적 자산 + quiz webp
└── server/           로컬 dev API (viteApiPlugin)

배포 제외 (.vercelignore)
├── legacy/           구 Supabase + FastAPI 아카이브
├── scripts/          DB·이미지·운영 스크립트
├── docs/             운영 가이드
└── data/             구 JSON 스냅샷 (Feb 2026)
```

**프롬프트 단일 소스**

| 용도 | 파일 |
|------|------|
| 퀴즈 MASTER | `shared/quizPrompts.js` |
| Expert 8종 | `shared/quizExpertPrompts.js` |
| 이미지 규칙 | `shared/imagePrompts.js` + `imageStyles.js` + `imagePromptEngine.js` |

---

## 2. 문제 요약

### 2.1 보안 (P0 — 즉시)

| # | 이슈 | 위치 | 위험 |
|---|------|------|------|
| S1 | Admin 키 미설정 시 **인증 통과** | `api/_lib/adminAuth.js` L3 | `/api/admin/*`, generate-image 전면 개방 |
| S2 | `VITE_ADMIN_API_KEY` 클라이언트 노출 | `Admin.jsx`, `adminApi.js` | 번들에서 키 유출 |
| S3 | `VITE_GEMINI_API_KEY` 브라우저 호출 | `src/lib/gemini.js` | API 키 남용 |
| S4 | `VITE_PREMIUM_CODE` 기본값 `nambac-vip` | `src/lib/premium.js` | 광고 우회 trivial |
| S5 | hidden 퀴즈 ID만 알면 조회 | `quizById` / `getQuizById` | draft 유출 |
| S6 | stats API 무인증 | `POST /api/quizzes/:id/stats` | view/participate 조작 |
| S7 | n8n webhook 검증 없이 퀴즈 생성 | `n8nQuiz.js` | `validateQuizPayload` 미적용 |
| S8 | CORS `*` 전 route | 모든 handler | cross-origin + 키 탈취 시 악용 |

### 2.2 유령 코드 (P1 — 삭제)

| 파일 | 상태 |
|------|------|
| `src/lib/imagen.js` | `@deprecated`, import 0 |
| `src/components/ShareModal.jsx` | import 0 |
| `src/styles/pencilBox.css` | import 0 |
| `public/images/compare_*` | AI 모델 비교 실험 산출물 |
| `public/images/compare_models_result.json` | 실험 메타 |
| `public/vite.svg` | Vite 템플릿 잔재 |
| `api/admin/`, `api/brand/`, `api/cron/`, `api/push/`, `api/quizzes/`, `api/webhooks/` | **빈 디렉터리** — 구 per-route 잔재 |
| `scripts/dev/seed_github_style_quizzes.mjs` | npm script 미등록 |

### 2.3 중복 (P2 — 통합)

| 중복 | 조치 |
|------|------|
| `src/constants/categories.js`의 `getExpertPrompt` 등 | `shared/quizPrompts.js`만 사용, UI 메타만 src에 유지 |
| `api/_lib/categories.js` | 삭제 → `shared/categories.js` 직접 import |
| `legacy/.../prompts/*.md` + `.claude/agents/*.md` | `docs/archive/prompts/`로 통합 (런타임 무관) |
| `data/` (root) vs `legacy/backend/data/` | 스크립트는 legacy만 참조 → root `data/` git untrack |

### 2.4 의존성 (P2)

| 패키지 | 조치 |
|--------|------|
| `@types/react`, `@types/react-dom` | TS 미사용 → devDeps 유지 또는 제거 |
| `express` | `server/dev-api.mjs` 전용 → **devDependencies**로 이동 |

### 2.5 문서 outdated (P3)

| 파일 | 수정 |
|------|------|
| `docs/PROJECT_LAYOUT.md` | `api/[...path].js` → `api/handler.js` |
| `.claude/MASTER_DIRECTIVE.md` | Supabase Auth → Turso 현행 반영 |

---

## 3. 폴더 정리안 (목표 구조)

변경 **최소화** — 이동은 Phase 3, 삭제는 Phase 1~2.

```
nambac/
├── api/                    # Vercel only (handler.js + _lib/)
├── shared/                 # 비즈니스·프롬프트 SoT
├── src/
│   ├── pages/
│   ├── components/
│   ├── lib/                # 클라이언트 API만 (gemini.js 제거 예정)
│   ├── hooks/
│   ├── logic/
│   └── constants/          # UI 카테고리 메타만
├── public/images/          # webp only 정책 (png 레거시 점진 삭제)
├── turso/
├── server/                 # (선택) scripts/dev/server/ 로 이동
├── scripts/
│   ├── db/
│   ├── images/
│   ├── ops/
│   └── dev/
├── docs/
│   ├── CODEBASE_CLEANUP_PLAN.md  ← 본 문서
│   ├── PROJECT_LAYOUT.md
│   └── archive/            # legacy prompts, old TODO
├── legacy/                 # git 유지, 배포·import 금지
└── automation/             # n8n 선택 (Cron이 기본)
```

---

## 4. 실행 페이즈

### Phase 0 — 즉시 (1일, 리스크 낮음) ✅ 완료

- [x] `public/images/compare_*` 삭제
- [x] 빈 `api/{admin,brand,cron,push,quizzes,webhooks}/` — 이미 없음 (handler.js 단일 진입만 존재)
- [x] `src/lib/imagen.js`, `ShareModal.jsx`, `pencilBox.css` 삭제
- [x] `public/vite.svg` — 이미 없음

### Phase 1 — 보안 (1~2일, **배포 전 필수**) ✅ 완료

1. **adminAuth fail-closed** — production에서 `ADMIN_API_KEY` 없으면 503  
2. **Gemini 서버 전용** — `POST /api/admin/generate-quiz-content`, `src/lib/gemini.js` 삭제  
3. **Admin key** — sessionStorage unlock UI (번들에 `VITE_ADMIN_API_KEY` 불필요)  
4. **Public API** — hidden 퀴즈 필터, stats Referer 검증 + active만  
5. **n8n** — `validateQuizPayload` 적용  
6. **Premium** — 기본 코드 제거, env 없으면 비활성

### Phase 2 — 코드 정리 (2~3일) ✅ 완료

- [x] categories 중복 제거 (`api/_lib/categories.js` 삭제, UI는 `src/constants/categories.js`)
- [x] `legacy/` README import 금지 명시
- [x] root `data/` git untrack (`.gitignore` 유지)
- [x] `scripts/dev/seed_github_style_quizzes.mjs` 삭제
- [x] `express` → devDependencies
- [x] `npm run audit:quizzes` 실행 (로컬)

### Phase 3 — 문서·DX (1일) ✅ 완료

- [x] `docs/PROJECT_LAYOUT.md` 갱신
- [x] `docs/SECURITY.md` 신규
- [x] `docs/AI_PROMPTS.md` + `docs/archive/prompts/README.md`
- [x] eslint CI (`.github/workflows/lint.yml`), tailwind eslint 플러그인 제거 (v4 호환)
- [x] `docs/VERCEL_ENV.md`, `.claude/MASTER_DIRECTIVE.md` Turso 반영

### Phase 4 — 기능 (별도 기획)

- Google 로그인 + Turso `users` / likes / comments  
- ShareModal 재도입 또는 Result 공유 UX 통합

---

## 5. 삭제하면 **안 되는** 것

| 경로 | 이유 |
|------|------|
| `legacy/` | GitHub 스타일 참고·구 프롬프트 아카이브 |
| `scripts/images/` | backfill·fix-urls 운영 필수 |
| `public/images/backfill_*` | DB URL과 연결된 프로덕션 자산 |
| `.github/workflows/` | CI backfill |
| `api/_lib/fonts/` | OG resvg 렌더링 |

---

## 6. API 인증 매트릭스 (현재 → 목표)

| Route | 현재 | 목표 |
|-------|------|------|
| GET /api/quizzes | public | public |
| GET /api/quizzes/:id | public (hidden 노출) | active만 |
| POST .../stats | 무인증 | throttle + optional signed |
| /api/admin/* | admin (bypass 가능) | **키 필수** |
| /api/cron/* | cron secret | 유지 |
| /api/webhooks/* | webhook secret | + payload validate |

---

## 7. 체크리스트 (완료 정의)

- [x] P0 보안 Phase 1 적용 — Vercel `ADMIN_API_KEY`·`GEMINI_API_KEY` 설정 확인 필요  
- [x] 유령 파일 Phase 0 대상 삭제 완료 (grep import 0 확인)  
- [x] 빈 api stub 디렉터리 0건  
- [x] `docs/PROJECT_LAYOUT.md` 현행화  
- [x] `npm run lint` / `npm run build` 통과  
- [x] smoke: 로컬 `verify:api` / `audit:quizzes` (배포 후 production curl은 Vercel env 필요)

---

## 8. 우선순위 한 줄

**보안(Admin 키) → 유령 코드 삭제 → 중복 통합 → 문서 → 로그인/UGC**

담당자 결정:

1. ~~`legacy/` repo에서 분리 submodule vs monorepo 유지?~~ → **A. monorepo 유지** (`legacy/`는 아카이브, 배포·import 금지 유지)
2. Admin UI IP 화이트리스트 / Vercel Password Protection?  
3. png 레거시 일괄 webp 전환 일정?
