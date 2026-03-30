# TODO List - Backend

## ✅ 완료 목록
- [x] FastAPI 서버 기본 구조 (main.py)
- [x] OpenRouter API 연동 (factory.py)
- [x] 3-AI 에이전트 워크플로우 구현
- [x] Director, Architect, Analyst 프롬프트 완성
- [x] 3-Bit Binary Scoring 로직 검증
- [x] factory.py 점수 강제 보정 로직
- [x] json_manager.py 로컬 JSON 읽기/쓰기 유틸리티 구현
- [x] backend/data/ 폴더 생성
- [x] quizzes.json, questions.json, results.json 초기화
- [x] main.py CRUD 엔드포인트 구현
- [x] factory.py JSON 저장 로직 연동 (save_quiz_complete)

## 🔄 진행 중
- 없음

## ⏳ 대기 목록

### backend/logic/
- [ ] aiofiles 라이브러리 도입 (비동기 파일 I/O)
- [ ] 파일 락 메커니즘 (동시성 문제 방지)

### backend/main.py
- [ ] API 키 기반 인증 미들웨어
- [ ] 요청 속도 제한 (Rate Limiting)
- [ ] CORS 환경변수 관리

### backend/scripts/
- [ ] 데이터베이스 마이그레이션 스크립트 (Supabase → 로컬 JSON)
- [ ] 초기 퀴즈 데이터 생성 스크립트
- [ ] 데이터 백업 스크립트

## 🎯 우선순위
1. **중간**: aiofiles 라이브러리 도입, 인증 미들웨어
2. **낮음**: 데이터 마이그레이션 스크립트

## 📝 기술적 고려사항
- [ ] JSON 파일은 backend/data/ 폴더에 저장 ✅
- [ ] 파일 I/O는 동기 처리 (개선 필요)
- [ ] 동시성 문제 처리 (미구현)
- [ ] 데이터 백업 방안 고려
