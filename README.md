# 🎯 Nambac — 호치민 MZ세대 퀴즈 플랫폼

> **nambac.xyz** — AI 에이전트가 만드는 성향 분석 퀴즈 플랫폼

## 🏗️ 기술 스택

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + Vite 7 |
| **Styling** | Tailwind CSS 4 |
| **Backend** | FastAPI (Python 3.11) |
| **AI Engine** | Google Gemini + OpenRouter (3인 에이전트 협업) |
| **Data** | Local JSON Storage |
| **Deployment** | Docker + Nginx + Supervisor |

## 🚀 Quick Start

### 1. 환경 설정

```bash
git clone <repo-url>
cd nambac
cp .env.example .env
# .env 파일에 실제 API 키 입력
```

### 2. Frontend 개발 서버

```bash
npm install
npm run dev
```

### 3. Backend 개발 서버

```bash
cd backend
pip install -r requirements.txt
python3 -m uvicorn main:app --reload --port 8000
```

### 4. 프로덕션 배포 (Docker)

```bash
./deploy.sh
```

## 📁 프로젝트 구조

```
nambac/
├── src/                    # React Frontend
│   ├── pages/              # 페이지 컴포넌트 (Home, QuizPage, Result, Admin)
│   ├── components/         # 공통 컴포넌트 (Navbar, Footer, Header)
│   ├── lib/                # API 클라이언트 (apiConfig.js, localDataClient.js)
│   └── logic/              # 비즈니스 로직 (scoring.js — 3-bit binary scoring)
├── backend/
│   ├── main.py             # FastAPI 서버 (CRUD + AI 엔드포인트)
│   ├── logic/              # AI Factory, JSONManager, ImageGenerator
│   ├── agents_nambac/      # AI 에이전트 프롬프트
│   └── data/               # JSON 데이터 저장소
├── nginx/                  # Nginx 설정 (리버스 프록시 + Rate Limiting)
├── Dockerfile              # 멀티스테이지 빌드
├── docker-compose.yml      # 컨테이너 오케스트레이션
└── deploy.sh               # 원클릭 배포 스크립트
```

## 🔐 환경 변수

| 변수 | 설명 | 필수 |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API | ✅ |
| `OPENROUTER_API_KEY` | OpenRouter AI 모델 | ✅ |
| `ADMIN_API_KEY` | Backend Admin 인증 키 | ✅ |
| `VITE_ADMIN_API_KEY` | Frontend → Backend 인증 | ✅ |
| `VITE_ADMIN_PASSWORD` | Admin 페이지 접근 비밀번호 | ✅ |
| `VITE_API_URL` | Backend API URL | ✅ |
| `VITE_GA_MEASUREMENT_ID` | Google Analytics ID | ❌ |

## 🎮 핵심 기능

- **3-Bit Binary Scoring**: 5문항 → 8가지 결과 (0~7점)
- **AI 퀴즈 생성**: Director → Visual Architect → Report Analyst 3인 에이전트 협업
- **소셜 공유**: 서버사이드 OG 태그 렌더링 (Facebook, Zalo, Twitter)
- **Admin Dashboard**: 퀴즈 CRUD, AI 생성, 서비스 관리

## 📜 License

Private — All Rights Reserved
