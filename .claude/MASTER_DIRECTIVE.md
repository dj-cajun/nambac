# 📂 Project: nambac.xyz Master Directive (v1.2)

> **Status**: Final Deployment Prep  
> **Core Strategy**: Platform as a Hub, External AI Integration, Localized Humour.
> **Guiding Principle**: "High-tech logic, Low-brow humour."

---

## 1. Vision & Core Identity

`nambac.xyz`는 호치민의 MZ세대를 위한 '병맛' 콘텐츠 포털이며, 자체 퀴즈와 외부 AI 서비스를 연결하는 허브 역할을 수행한다.

* **Brand Vibe**: 핑크색 메인 테마, Y2K/Kitsch 디자인, 둥근 모서리(Rounded UI), 킹받는 B급 감성.
* **Target**: 호치민 거주 한국인 및 현지 로컬 MZ세대.
* **Localization**: 레탄똔, 타오디엔, 랜드마크 81, 그랩 기사, 카페 콩 등 호치민만의 로컬 소스를 100% 활용.

---

## 2. Technical Stack & Engine Roles

| 구분 | 기술 / 도구 | 비중 및 역할 |
| :--- | :--- | :--- |
| **Frontend** | React (Vite) + Tailwind | Antigravity를 통한 고속 UI 구현 및 핑크 테마 유지. |
| **Backend/Auth** | Supabase | Google OAuth 및 퀴즈/외부링크 데이터베이스 관리. |
| **Main Engine** | **Google Gemini (API)** | **Grade A**: 보안, 아키텍처 설계, 복잡한 기능 구현. |
| **Sub Engine** | **OpenRouter (GLM-4)** | **Grade B**: 병맛 퀴즈 시나리오 대량 생성 및 번역. |
| **Automation** | **n8n + OpenCode CLI** | 24/7 콘텐츠 자동 생성, DB 업데이트, SNS 포스팅. |

---

## 3. Specialized Agent Army (전문 에이전트 군단)

모든 콘텐츠 생성 및 관리는 분야별 전문 에이전트가 담당하며, n8n에 의해 개별 호출된다.

* **[Agent: Sisyphus] (Lead)**: 전체 프로젝트 지휘 및 에이전트 간 업무 통합/검수.
* **[Agent: PastLife] (전생)**: 호치민 로컬 직업군 기반의 황당한 전생 스토리 전문 생성.
* **[Agent: MBTI] (심리)**: 베트남 MZ 라이프스타일을 반영한 엉뚱한 심리 테스트 설계.
* **[Agent: Linker_Lookalike] (외부 연동)**: 얼굴 분석/관상 등 외부 AI 서비스 링크 관리 및 결과 재해석.
* **[Agent: HCMC_Guide] (매거진)**: 호치민 1~7군 소식을 '병맛 매거진' 톤으로 큐레이션.
* **[Agent: Delivery_King] (미식)**: 그랩/쇼피푸드 트렌드 기반의 킹받는 메뉴 추천 로직.
* **[Agent: Fortune] (운세)**: 베트남 민속 신앙을 믹스한 '황당한 오늘의 예언'.
* **[Agent: Trend_Hunter] (분석)**: n8n과 연동하여 실시간 SNS 트렌드를 수집하고 소재 공급.

---

## 4. Operational Roadmap (실행 계획)

### **Phase 1: Foundation (Current)**

* [ ] Supabase 기반 구글 로그인 시스템 구축.

* [ ] 관리자 페이지(`Admin.jsx`): 퀴즈 데이터 및 **외부 서비스 URL** 관리 기능.
* [ ] 홈 화면(`Home.jsx`): 핑크 테마의 퀴즈/외부 연동 카드 섹션 배치.

### **Phase 2: Automation Integration**

* [ ] `opencode serve` 서버 가동 및 n8n 워크플로우 연결.

* [ ] 트렌드 뉴스 기반 퀴즈 자동 생성 파이프라인 완성.

### **Phase 3: Viral & Expansion**

* [ ] 퀴즈 결과 공유(SNS) 최적화 및 로컬 매거진 섹션 활성화.

---

## 5. Development Protocols (준수 사항)

1. **디자인 가이드**: `1.jpg`, `2.jpg`, `3.jpg`의 키치한 디자인 시스템을 모든 페이지에 강제 적용한다.
2. **데이터 관리**: 모든 퀴즈 정보와 외부 링크는 하드코딩하지 않고 Supabase DB에서 호출한다.
3. **보안**: API 키와 설정 정보는 반드시 `.env`에서 관리하며 Git 노출을 금지한다.
4. Master Directive v1.3 업데이트 지침
[Quality Control Protocol]

Priority: Quantity is secondary; one high-quality content per day is the goal.

Agent Role: [Agent: Inspector_J_Bad] must verify the "King-bad" humor level and localization accuracy before any DB insert.

Visuals: All quiz results must be associated with a sharable video/image asset that matches the Y2K Pink aesthetic.
