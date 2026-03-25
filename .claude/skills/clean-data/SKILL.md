---
name: clean-data
description: 테스트/샘플 데이터를 정리하고 관리자 계정만 유지
disable-model-invocation: true
---

## 테스트 데이터 정리

1. 관리자(admin) 계정 목록 먼저 표시
2. 비관리자 유저 수 + 관련 데이터(posts, comments, likes, point_logs, leads) 카운트 표시
3. 사용자에게 삭제 확인 요청
4. 확인 후 FK 순서에 맞게 삭제:
   - likes → comments → point_logs → posts → leads → users (비admin만)
5. 삭제 결과 + 남은 계정 목록 표시

주의: 반드시 사용자 확인 후 실행. leads는 전체 삭제할지 비관리자 관련만 삭제할지 확인.
