# [MASTER] Nambac Project Specification

## 1. Project Overview
**Nambac**은 호치민 로컬 트렌드와 문화를 기반으로 한 **8가지 성향 분석(Archetype) 퀴즈 플랫폼**입니다.
3인의 AI 에이전트(Director, Visual Architect, Report Analyst)가 협업하여 퀴즈 콘텐츠를 자동 생성합니다.

## 2. Tech Stack
*   **Core Logic**: OpenCode (AI Agent Workflow)
*   **Workflow Automation**: n8n
*   **Database**: Supabase (PostgreSQL)
*   **Backend API**: FastAPI (Python)
*   **Frontend**: React (Vite)

## 3. Database Schema (Confirmed)

### 3.1 `quizzes` Table (Meta Info)
퀴즈의 기본 정보를 저장합니다.
*   `id`: UUID (Primary Key)
*   `title`: Text (퀴즈 제목)
*   `description`: Text (퀴즈 설명)
*   `category`: Text (예: 'Trendy', 'Fresh Picks')
*   `image_url`: Text (메인 썸네일 URL)
*   `is_active`: Boolean (공개 여부)
*   `view_count`: Integer (조회수, Default: 0)
*   `share_count`: Integer (공유수, Default: 0)
*   `created_at`: Timestamptz

### 3.2 `questions` Table (Content & Scoring)
문항 및 점수 로직을 저장합니다.
*   `id`: UUID (Primary Key)
*   `quiz_id`: UUID (Foreign Key -> quizzes.id)
*   `order_number`: Integer (문항 순서)
*   `question_text`: Text (질문 내용)
*   `option_a`: Text (선택지 A)
*   `option_b`: Text (선택지 B)
*   `score_a`: Integer (A 선택 시 가중치, **Default: 0**)
*   `score_b`: Integer (B 선택 시 가중치, **Value: 1, 2, 4**)
*   `image_url`: Text (문항별 이미지 URL, Optional)

## 4. Core Logic: 3-Bit Binary Scoring & 8 Types
**"결과는 저장하지 않고(Stateless), 브라우저에서 즉시 계산한다"**는 원칙을 따릅니다.

### 4.1 Scoring Mechanism
3개의 핵심 질문이 각각 2의 제곱수($2^0, 2^1, 2^2$) 가중치를 가집니다. 총점(0~7)이 곧 성향 ID가 됩니다.

| 문항 | 역할 (Axis) | score_a | score_b | 비고 |
| :--- | :--- | :---: | :---: | :--- |
| **Q1** | **Axis 1** | **0** | **1** | Bit 1 ($2^0$) |
| **Q2** | **Axis 2** | **0** | **2** | Bit 2 ($2^1$) |
| **Q3** | **Axis 3** | **0** | **4** | Bit 3 ($2^2$) |
| Q4~ | Bonus | 0 | 0 | - |

### 4.2 8 Quiz Types (Archetypes)
총점에 따라 매핑될 8가지 성향 리스트입니다. (기획 단계에서 구체화 필요)
*   **Type 1 (0점)**: 000 (Pure A)
*   **Type 2 (1점)**: 001
*   **Type 3 (2점)**: 010
*   **Type 4 (3점)**: 011
*   **Type 5 (4점)**: 100
*   **Type 6 (5점)**: 101
*   **Type 7 (6점)**: 110
*   **Type 8 (7점)**: 111 (Pure B)

## 5. Development Principles
1.  **Stateless Result**: 사용자별 결과는 DB에 저장하지 않는다. (URL 파라미터나 로컬 상태로 처리)
2.  **No New Tables**: 기존 `quizzes`, `questions` 테이블 외에 새로운 테이블 생성을 지양한다.
3.  **Frontend Logic**: `QuizPage.jsx`에서 0점을 10점으로 변환하는 버그(`|| 10`)를 반드시 수정(`?? 10`)해야 한다.

## 6. Logs
- 2026-02-01: 메인 AI 엔진을 OpenRouter에서 Google AI Studio(Gemini Flash Latest)로 전격 교체함. 운영 비용 0원 달성 및 생성 속도 개선 완료.
