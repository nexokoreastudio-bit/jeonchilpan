---
name: health-check
description: DB 연결, 환경변수, 테이블 상태, 빌드 상태를 종합 점검
---

## 프로젝트 헬스 체크

다음 항목을 순서대로 점검합니다:

### 1. 환경변수
- `.env.local` 존재 여부
- 필수 키 존재 확인: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY
- NEXT_PUBLIC_KAKAO_JS_KEY 설정 여부 (보류 상태 안내)

### 2. DB 연결
- Supabase에 간단한 쿼리 실행 (users 테이블 select limit 1)
- 연결 성공/실패 표시

### 3. 주요 테이블 존재 확인
- users, posts, comments, leads, resources, insights, admin_audit_logs 등

### 4. Git 상태
- 현재 브랜치, 미커밋 변경사항, 원격 대비 상태

### 5. 빌드 상태
- 마지막 빌드 성공 여부 (.next 디렉토리 존재 확인)

결과를 체크리스트 형태로 출력.
