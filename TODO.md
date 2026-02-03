# Nambac 프로젝트 TODO

## 🎯 프로젝트 목표
호치민 로컬 트렌드 기반 8가지 성향 분석 퀴즈 플랫폼 구축 (Local-First, API-Free)

## ✅ 완료 목록 (2026-02-01)
- [x] master.md 스펙 문서 작성
- [x] OpenRouter API 연동 (factory.py)
- [x] 3-AI 에이전트 워크플로우 구현
- [x] 3-Bit Binary Scoring 로직 구현
- [x] 프론트엔드 기본 UI 구조 완성
- [x] React + Vite 프로젝트 설정
- [x] Tailwind CSS 적용
- [x] Supabase 의존성 정리 제거 (문서화)
- [x] json_manager.py 로컬 JSON 유틸리티 구현
- [x] backend/data/ 폴더 및 JSON 초기화
- [x] main.py CRUD 엔드포인트 구현
- [x] localDataClient.js 프론트엔드 API 클라이언트 구현
- [x] Admin.jsx 실제 AI API 연동
- [x] Home.jsx, QuizPage.jsx 로컬 API 연동
- [x] .gitignore 보안 설정 (.env 추가)
- [x] Phase 4: 이미지 생성 API (DALL-E 3)
- [x] Admin.jsx 핫핑크 그라데이션 UI 개선
- [x] Admin.jsx 엑셀 스타일 질문 관리 테이블
- [x] Admin.jsx 8가지 성향 유형 관리 테이블
- [x] Admin.jsx 퀴즈 메타데이터 편집 섹션

## 🔄 진행 중

### Phase 1: 로컬 데이터 저장소 구축 ✅ 완료
- [x] backend/data/ 폴더 생성
- [x] JSON 파일 저장소 구조 정의
- [x] json_manager.py 유틸리티 구현

### Phase 2: Backend API 구현 ✅ 완료
- [x] main.py에 CRUD 엔드포인트 추가
- [x] 퀴즈 목록 조회 API
- [x] 퀴즈 생성 API (AI 결과 JSON 저장)
- [x] 퀴즈 수정/삭제 API

### Phase 3: Frontend 연동 ✅ 완료
- [x] Admin.jsx에서 실제 AI API 호출
- [x] localDataClient.js 구현 (Supabase 대체)
- [x] Home.jsx 로컬 데이터 연동
- [x] QuizPage.jsx 로컬 데이터 연동

## ⏳ 대기 목록

### Phase 4: 이미지 생성
- [ ] 이미지 생성 API 연동 (DALL-E/Stable Diffusion)
- [ ] AI 생성 이미지를 로컬/CDN에 저장
- [ ] 이미지 URL 데이터베이스에 저장

### Phase 5: 인증 시스템
- [ ] 관리자 인증 구현
- [ ] API 키 기반 간단 인증

### Phase 6: 배포 및 운영
- [ ] Dockerfile 작성
- [ ] 배포 스크립트 작성
- [ ] 모니터링 로깅

### Phase 7: 테스트 및 문서
- [ ] 단위 테스트 작성
- [ ] 통합 테스트 작성
- [ ] 사용자 매뉴얼 작성

## 🎬 시나리오

### 관리자 퀴즈 생성 플로우 ✅ 작동
1. Admin 페이지 접속
2. 주제 입력 또는 템플릿 선택
3. AI 퀴즈 생성 버튼 클릭
4. Director → Architect → Analyst 에이전트 순차 실행
5. 생성된 결과가 JSON 파일로 자동 저장
6. 관리자가 결과 확인 및 수정 가능
7. 퀴즈 활성화 (is_active: true)

### 사용자 퀴즈 플레이 플로우 ✅ 작동
1. Home 페이지에서 퀴즈 선택
2. 5개 질문 답변 (Q1, Q2, Q3은 점수, Q4, Q5는 보너스)
3. 브라우저에서 즉시 점수 계산 (0~7)
4. 결과 페이지 표시 (8가지 성향 중 하나)
5. 공유 버튼 (현재는 placeholder)

## 📊 진행률
- **총 작업**: 7개 Phase, 약 25개 작업
- **완료**: 15개 (60%)
- **진행 중**: 0개 (0%)
- **대기**: 4개 Phase (40%)

## 🎉 최신 업데이트
- **2026-02-01**: Local-First 아키텍처 완전 구현
  - 로컬 JSON 저장소 (backend/data/)
  - 완전한 CRUD API 구현
  - 프론트엔드 API 클라이언트 연동
  - AI 퀴즈 생성 → JSON 저장 자동화

## 🔗 관련 문서
- [Master 스펙](backend/agents_nambac/prompts/master.md)
- [Frontend TODO](src/TODO.md)
- [Backend TODO](backend/TODO.md)
