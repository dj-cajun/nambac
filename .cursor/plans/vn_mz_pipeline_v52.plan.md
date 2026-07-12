# VN MZ 피드백 — 파이프라인 개편 계획 (v5.2) ✅ 완료

> 갭 분석 + AI 생성 파이프라인 보강. UI 대규모 개편(홈 Chơi nhanh 단순화)은 범위 외 — 한 줄 hint만 추가.

## 목표

| MZ 피드백 | 파이프라인 대응 | 상태 |
|-----------|----------------|------|
| 글 많음 | `resultDescMin` 320→140, `resultDescMax` 300 (AI만), 2-pass 단문화 | ✅ |
| VI 어색 | `validateViNaturalness` + VI Editor 2차 패스 + 블록리스트 영어 검사 | ✅ |
| 지루한 카테고리 | Tier A만 일일/배치 로테이션 (Delivery/Lookalike/Trendy 제외) | ✅ |
| 운세 부족 | DOB + 다축 + money/health 전용 풀 + zodiac 24장 | ✅ |
| 퀴즈 비주얼 | 일일 생성 텍스트만 기본 (`--with-images` 옵션) | ✅ |

## Phase 0 — 퀴즈 생성 파이프라인 ✅

```
[1차] MASTER v5.2 MZ → Expert
    ↓
[2차] VI Editor (native Gen Z, 짧게, 번역체 제거)
    ↓
[clamp] MZ max soft-trim
    ↓
[검증] min + max(AI) + VI naturalness
    ↓
DB
```

**파일:** `categoryTiers.js`, `quizViEditorPrompts.js`, `quizPrompts.js`

**검증:** `npm run daily:quiz -- --dry-run` (로컬 + GitHub Actions)

## Phase 1 — 카테고리 티어 ✅

- `pickDailyCategory()` → Tier A 5개만
- `batch_generate_quizzes.mjs` → `DAILY_CATEGORY_IDS` 로테이션

## Phase 2 — 운세 ✅

- `fortuneMeta.js` — `FORTUNE_AXES` 4축
- `fortuneEngine.js` — DOB + axis hash, `getFortuneByIndexForAxis`
- `FortunePage.jsx` — 생년월일 + 축 선택 UI
- `fortuneAxisFormat.js` — 축별 lead/compat (`axisNative` 시 lead 생략)
- `fortuneAxisPools.js` + `shared/fortune-pools/fortune-*.pool.json` — money/health 전용 풀
- `fortunePrompts.js` + `fortune:axis-batch` + `fortune:merge-batch`

## Phase 3 — 이미지 정책 ✅

- **일일 퀴즈**: 텍스트만 기본
- **운세**: zodiac 24장 고정 풀 (`npm run images:zodiac`)
- **검증**: `npm run verify:fortune-images`

## Phase 4 — 홈 UX (최소) ✅

- `TodayThumbCard` 한 줄 hint (Quiz/Tử vi/Cân não/…)
- Não bạn 링크 설명

## 배포

사용자가 전체 리뷰 후 직접 push/배포.
