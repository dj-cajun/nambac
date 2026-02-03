# [SOP] bkit - Build Automation Kit

bkit은 Nambac 프로젝트의 빌드, 테스트, 배포 작업을 자동화하는 스킬입니다.

## 역할
- 프론트엔드 빌드 (Vite)
- 백엔드 검증 및 빌드
- 코드 린트 및 타입 체크
- 배포 준비

## 작업 흐름

### 1. 프론트엔드
```bash
npm run build
npm run lint
npm run preview
```

### 2. 백엔드
```bash
cd backend
python3 -m ruff check .
python3 -m uvicorn main:app --reload
```

### 3. 배포 전 체크리스트
- [ ] 모든 Supabase 의존성 제거
- [ ] 로컬 데이터 테스트 완료
- [ ] API 키 보안 확인 (.env)
- [ ] 빌드 에러 없음
