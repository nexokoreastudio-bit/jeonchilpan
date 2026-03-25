---
name: dev
description: 로컬 개발 서버 시작/재시작 (포트 지정 가능)
disable-model-invocation: true
---

## 로컬 개발 서버 관리

1. 인자로 포트가 전달되면 해당 포트 사용, 없으면 기본 5170
2. 해당 포트에서 실행 중인 프로세스가 있으면 kill
3. `npx next dev -p {포트}` 를 백그라운드로 실행
4. 서버 Ready 확인 후 URL 안내

사용 예시:
- `/dev` → 5170 포트로 시작
- `/dev 3000` → 3000 포트로 시작
