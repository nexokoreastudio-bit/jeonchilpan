---
name: admin-user
description: 특정 이메일의 유저를 관리자(admin) 권한으로 변경
disable-model-invocation: true
---

## 관리자 권한 부여

인자로 이메일 주소를 받습니다.

1. `.env.local`에서 Supabase 연결 정보 읽기
2. 해당 이메일로 `users` 테이블 조회
3. 유저가 존재하면 현재 상태(role, nickname) 표시
4. role을 `admin`으로 업데이트
5. 변경 결과 확인

사용 예시: `/admin-user test@example.com`

주의: 반드시 사용자에게 확인 후 실행할 것.
