# Backend 완료 파일 목록

## 📁 backend/
- [x] main.py - FastAPI 서버 및 CRUD 엔드포인트 완성
- [x] requirements.txt - 의존성 목록

## 📁 backend/logic/
- [x] factory.py - AI 에이전트 워크플로우 및 JSON 저장
- [x] json_manager.py - 로컬 JSON 읽기/쓰기 유틸리티

## 📁 backend/agents_nambac/prompts/
- [x] director_j_bad.md - 디렉터 프롬프트
- [x] visual_architect.md - 아키텍트 프롬프트
- [x] report_analyst.md - 애널리스트 프롬프트
- [x] master.md - 마스터 스펙 문서

## 📁 backend/data/ (신규)
- [x] quizzes.json - 퀴즈 메타 데이터 저장소
- [x] questions.json - 질문 데이터 저장소
- [x] results.json - 결과 유형 데이터 저장소

## 📁 backend/scripts/
- [x] final_quiz.py - 퀴즈 데이터 처리
- [x] insert_8type_quiz.py - 8타입 퀴즈 삽입
- [x] insert_mz_quiz.py - MZ 퀴즈 삽입

## ✨ 최신 변경사항
- 2026-02-01: json_manager.py 구현 (로컬 JSON CRUD)
- 2026-02-01: main.py에 완전한 CRUD API 엔드포인트 추가
- 2026-02-01: factory.py JSON 저장 로직 연동
- 2026-02-01: backend/data/ 폴더 및 JSON 초기화

## 🚀 제공되는 API 엔드포인트
- GET /api/quizzes - 퀴즈 목록 조회
- GET /api/quizzes/{id} - 특정 퀴즈 조회
- POST /api/quizzes - 퀴즈 생성 (AI 기반)
- PUT /api/quizzes/{id} - 퀴즈 수정
- DELETE /api/quizzes/{id} - 퀴즈 삭제
- GET /api/quizzes/{id}/questions - 질문 목록 조회
- PUT /api/questions/{id} - 질문 수정
- DELETE /api/questions/{id} - 질문 삭제
- GET /api/quizzes/{id}/results - 결과 유형 조회
