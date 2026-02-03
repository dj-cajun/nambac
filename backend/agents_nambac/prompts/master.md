# [MASTER] Nambac Project Specification

## 1. Project Overview
**Nambac**은 호치민 로컬 트렌드와 문화를 기반으로 한 **8가지 성향 분석(Archetype) 퀴즈 플랫폼**입니다.
3인의 AI 에이전트(Director, Visual Architect, Report Analyst)가 협업하여 퀴즈 콘텐츠를 자동 생성합니다.

## 2. Tech Stack
*   **Core Logic**: OpenRouter (AI Agent Workflow)
*   **Backend API**: FastAPI (Python)
*   **Frontend**: React (Vite)

## 3. Core Logic: 3-Bit Binary Scoring & 8 Types
**"결과는 저장하지 않고(Stateless), 브라우저에서 즉시 계산한다"**는 원칙을 따릅니다.

### 3.1 Scoring Mechanism
3개의 핵심 질문이 각각 2의 제곱수($2^0, 2^1, 2^2$) 가중치를 가집니다. 총점(0~7)이 곧 성향 ID가 됩니다.

| 문항 | 역할 (Axis) | score_a | score_b | 비고 |
| :--- | :--- | :---: | :---: | :--- |
| **Q1** | **Axis 1** | **0** | **1** | Bit 1 ($2^0$) |
| **Q2** | **Axis 2** | **0** | **2** | Bit 2 ($2^1$) |
| **Q3** | **Axis 3** | **0** | **4** | Bit 3 ($2^2$) |
| Q4~ | Bonus | 0 | 0 | - |

### 3.2 8 Quiz Types (Archetypes)
총점에 따라 매핑될 8가지 성향 리스트입니다. (기획 단계에서 구체화 필요)
*   **Type 1 (0점)**: 000 (Pure A)
*   **Type 2 (1점)**: 001
*   **Type 3 (2점)**: 010
*   **Type 4 (3점)**: 011
*   **Type 5 (4점)**: 100
*   **Type 6 (5점)**: 101
*   **Type 7 (6점)**: 110
*   **Type 8 (7점)**: 111 (Pure B)

## 4. Development Principles
1.  **Local-First**: 모든 데이터는 로컬 JSON 파일로 관리한다.
2.  **Stateless Result**: 사용자별 결과는 저장하지 않고 브라우저에서 즉시 계산한다. (URL 파라미터나 로컬 상태로 처리)
3.  **API-Free**: AI 에이전트는 로컬에서 직접 실행되고, 결과는 JSON으로 출력한다.

## 5. Logs
- 2026-02-01: OpenRouter 기반 AI 에이전트 워크플로우 구현 완료. 3인의 에이전트(Director, Architect, Analyst) 협업 시스템 가동.
