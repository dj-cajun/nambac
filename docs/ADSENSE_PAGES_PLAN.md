# Google AdSense 페이지 기획서 — nambac.xyz

> 작성: 2026-07-07  
> 목적: AdSense **사이트 승인** + **정책 준수**에 필요한 페이지·링크·동의 UI 설계

---

## 1. Google이 보는 것 (요약)

| 영역 | 요구 |
|------|------|
| **콘텐츠** | 독창적·유용한 텍스트, 얇은 페이지·공사 중·로그인만 있는 사이트 지양 |
| **정책 페이지** | Privacy Policy (광고·쿠키 명시), 이용약관 |
| **연락처** | 운영자/사이트 연락 수단 (이메일 등) **쉽게 찾을 수 있어야** 함 |
| **탐색** | Footer 등 **모든 페이지**에서 정책 링크 접근 |
| **광고 고지** | 제3자 광고(AdSense), cookie, Google opt-out 링크 |
| **EEA/UK** | 개인화 광고 **동의 배너(CMP)** — Google 인증 CMP 권장 |
| **기술** | `ads.txt`, 도메인 일치, AdSense 계정 메타 |

---

## 2. 현재 상태

| 항목 | URL / 파일 | 상태 | 비고 |
|------|------------|------|------|
| Privacy Policy | `/privacy-policy` | ✅ 있음 | AdSense·Analytics 섹션 포함, **날짜 2026-04** |
| Terms of Service | `/terms-of-service` | ✅ 있음 | 광고·제3자 링크 조항 있음 |
| About | `/about` | ✅ 있음 | 미션·AI·카테고리 설명 충분 |
| FAQ | `/faq` | ✅ 있음 | 10+ Q&A, contact 이메일 |
| Contact **전용** | — | ❌ 없음 | 이메일만 About/FAQ/Terms에 분산 |
| Cookie Policy **전용** | — | ⚠️ Privacy에 일부 | EEA용 **동의 UI** 없음 |
| Editorial / Disclaimer | — | ❌ 없음 | AI 퀴즈·엔터테인먼트 면책 권장 |
| Footer 링크 | `Footer.jsx` | ⚠️ **홈 intro 버튼으로 대체** | Giới thiệu·FAQ·Privacy·Terms — **퀴즈/결과엔 없음** |
| ads.txt | `/ads.txt` | ✅ 있음 | `pub-7386903584540643` |
| sitemap.xml | — | ❌ 없음 | 크롤·심사 도움 |
| robots.txt | — | ❌ 없음 | 선택 |
| AdSense meta | `index.html` | ✅ 있음 | `google-adsense-account` |
| 실제 광고 | env OFF | ⏸ | 승인 후 `VITE_ADSENSE_ENABLED=true` |

**콘텐츠량:** active 퀴즈 ~30개 + 법적 페이지 4개 → 퀴즈는 충분, **정적 신뢰 페이지·Footer**가 약함.

---

## 3. 페이지 기획 (신규 + 개선)

### P0 — 승인 전 필수

#### 3.1 법적 링크 — **홈 하단 버튼 (이미 구현됨)** ✅

`Home.jsx` `home-intro-btns`:

| 버튼 | 모달 요약 | 전체 페이지 |
|------|-----------|-------------|
| Giới thiệu | ✅ | `/about` |
| FAQ | ✅ | `/faq` |
| Bảo mật | ✅ (AdSense 언급) | `/privacy-policy` |
| Điều khoản | ✅ | `/terms-of-service` |
| Hợp tác thương hiệu | ✅ | `/brands` |

→ **Footer.jsx를 새로 만드는 게 아니라**, 이 패턴을 AdSense 심사 기준에 맞게 **보완**하면 됨.

**AdSense 관점:** 홈 intro 버튼 + 전용 URL(`/privacy-policy` 등)이면 **대부분 충분**. 심사 봇은 sitemap·직접 URL로 정책 페이지 크롤.

**보완안:** ~~퀴즈/결과 Legal strip~~ — **하지 않음 (홈만)**. Contact/Cookie 버튼 + 전용 페이지만 유지.

#### 3.2 Contact 페이지 🆕 `/contact`

| 섹션 | 내용 |
|------|------|
| H1 | Liên hệ với nambac.xyz |
| 운영 | nambac.xyz — nền tảng trắc nghiệm AI (Giải trí) |
| Email | **contact@nambac.xyz** (mailto 링크) |
| 응답 | 24–48 giờ làm việc |
| 용도 | Góp ý, báo lỗi, hợp tác thương hiệu → `/brands` 링크 |
| 주소 | (선택) Ho Chi Minh City, Vietnam — 실제 없으면 "Việt Nam"만 |

폼은 **선택** — AdSense는 이메일만으로도 통과 가능. Brands 폼과 중복 피하려면 Contact는 **이메일 + FAQ 링크**만.

#### 3.3 Cookie Policy 🆕 `/cookie-policy`

Privacy와 **분리 짧은 페이지** (또는 Privacy §2 확장 + 별도 URL redirect):

- 사용 cookie 종류: 필수, Analytics, AdSense/DoubleClick
- 목적·보관 기간
- 브라우저에서 거부 방법
- [Google 광고 설정](https://www.google.com/settings/ads), [aboutads.info](https://www.aboutads.info/)
- Privacy Policy 상호 링크

#### 3.4 Cookie 동의 배너 🆕 (EEA + Google 정책)

| 옵션 | 설명 |
|------|------|
| **A (권장)** | Google **Funding Choices** / AdSense 내 CMP 연동 |
| **B** | Cookiebot / iubenda 등 Google-certified CMP |
| **C (MVP)** | 자체 배너: "Chấp nhận / Từ chối cá nhân hóa" + `localStorage` — **EEA 트래픽 있으면 A/B 필수** |

동의 **전**에는 `loadAdSenseScript()` 호출 금지 (`adsConfig.js` 연동).

#### 3.5 Privacy / Terms 소폭 개선

- `last-updated` → **Tháng 7, 2026**
- Privacy에 **Vercel Analytics**, **Web Push**(선택 구독) 명시
- Terms에 **AI 생성 콘텐츠·엔터테인먼트 면책** 1절 (아래 Editorial과 중복 가능)

---

### P1 — 승인률·신뢰도 향상

#### 3.6 Editorial & Disclaimer 🆕 `/editorial-policy`

퀴즈·AI 사이트에 AdSense/Google **유용한 콘텐츠** 신호:

| 섹션 | 내용 |
|------|------|
| 콘텐츠 제작 | AI(Gemini) + 편집 검수, 매일 신규 퀴즈 |
| 정확성 | Giải trí — không thay thế tư vấn y khoa/tâm lý chuyên nghiệp |
| 광고 | Quảng cáo không ảnh hưởng kết quả trắc nghiệm |
| 이미지 | AI 생성 illustration |
| 신고 | contact@nambac.xyz |

#### 3.7 How it works 🆕 `/how-it-works` (선택)

- 5 câu → kết quả → chia sẻ flow (스크린샷/일러스트)
- 홈 intro FAQ와 중복 최소화 — **SEO·심사용 정적 랜딩**

#### 3.8 sitemap.xml 🆕 `public/sitemap.xml`

포함 URL:

```
/  /about  /faq  /contact  /privacy-policy  /terms-of-service
/cookie-policy  /editorial-policy  /brands  /explore
+ active quiz /quiz/{id} (최근 50개 또는 전체)
```

`index.html` 또는 Vercel rewrite로 `/sitemap.xml` 서빙.

---

### P2 — 승인 후

- AdSense 슬롯 활성화 (`docs/ADSENSE_SETUP.md`)
- Search Console에 sitemap 제출
- 정책 위반 모니터링 (invalid traffic, accidental clicks)

---

## 4. IA (정보 구조)

```
nambac.xyz
├── /                    홈 (퀴즈 + intro + 광고 슬롯)
├── /explore             탐색
├── /quiz/:id            플레이
├── /quiz/:id/result     결과 (+ 광고)
├── /about               Giới thiệu
├── /faq                 FAQ
├── /contact             Liên hệ          🆕
├── /privacy-policy      Bảo mật
├── /cookie-policy       Cookie           🆕
├── /terms-of-service    Điều khoản
├── /editorial-policy    Nội dung & AI    🆕 P1
├── /how-it-works        Cách chơi        🆕 P1 선택
└── /brands              B2B (기존)
```

**Footer (전 페이지):** About · FAQ · Contact · Privacy · Cookie · Terms · (Editorial)

---

## 5. UI/UX 가이드 (법적 페이지)

- `LegalPages.css` 재사용 — **glass-card + solid 배경** (Push 배너처럼 투명 금지)
- 본문 **15–16px**, line-height 1.6+
- 각 페이지 **800단어 이상** 목표 (베트남어)
- `<Helmet>` title/description (SEO)
- 페이지 상단 **breadcrumb:** Trang chủ → Liên hệ

---

## 6. AdSense 심사 체크리스트

### 제출 전

- [ ] 커스텀 도메인 `nambac.xyz` (또는 vercel.app — **도메인과 AdSense 등록 일치**)
- [ ] Footer/Legal strip **모든** public 페이지
- [ ] `/contact` 접근 가능 + mailto
- [ ] Privacy + Cookie + Terms 링크 상호 연결
- [ ] `ads.txt` 200 응답
- [ ] `sitemap.xml` 제출
- [ ] 로그인 벽 없음 (퀴즈 플레이 무로그인 유지)
- [ ] 깨진 링크·빈 페이지 없음
- [ ] EEA CMP (EU 트래픽 예상 시)

### AdSense 콘솔

1. 사이트 추가 → `https://nambac.xyz`
2. 코드/메타 확인 (`index.html` meta 이미 있음)
3. **검토 요청** — 보통 수일~2주
4. 승인 후 광고 단위 생성 → env 슬롯 ID

---

## 7. 구현 Phase

| Phase | 작업 | 예상 |
|-------|------|------|
| **1** | 홈 intro에 Contact·Cookie 버튼 + 전용 페이지; 퀴즈/결과 Legal strip | 0.5일 |
| **2** | Privacy/Terms 날짜·Analytics·Push 보강 | 0.5일 |
| **3** | Cookie CMP + `adsConfig` 동의 연동 | 1일 |
| **4** | `/editorial-policy` + sitemap.xml | 0.5일 |
| **5** | Search Console + AdSense 검토 요청 | 0.5일 |

**총 ~3일** (Phase 3 CMP 제외 시 ~1.5일)

---

## 8. 하지 말 것

- Privacy/Terms **기계 번역만**으로 얇게 채우기
- Footer 없이 Home intro만으로 정책 노출
- 승인 전 `VITE_ADSENSE_ENABLED=true` + 가짜 광고 placeholder 대량 노출
- 클릭 유도 문구 ("Click ads to support us")
- 퀴즈 결과에 광고 **과다** (현재 result 2슬롯 — 유지, 3+ 지양)

---

## 9. 우선순위 한 줄

**Footer 링크 → Contact → Cookie(페이지+배너) → Privacy 보강 → Editorial → sitemap → AdSense 검토**

(홈 intro 버튼 4+1개는 **완료** — 퀴즈/결과 strip + Contact/Cookie만 추가)

---

## 10. 참고

- [AdSense 프로그램 정책](https://support.google.com/adsense/answer/48182)
- [EU user consent](https://support.google.com/adsense/answer/13554116)
- 내부: `docs/ADSENSE_SETUP.md`, `src/lib/adsConfig.js`
