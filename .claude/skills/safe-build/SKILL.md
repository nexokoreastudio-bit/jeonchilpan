---
name: safe-build
description: 타입체크 + 빌드 + git 상태를 한 번에 확인하는 안전 빌드
disable-model-invocation: true
---

## 안전 빌드 체크

다음을 순서대로 실행:

1. `git status --short` — 현재 변경사항 확인
2. `npm run type-check` — TypeScript 타입 에러 확인
3. `npm run build` — Next.js 빌드 (마지막 15줄만 출력)
4. 결과 요약: 성공/실패 + 변경 파일 수 + 에러 내용

에러 발생 시:
- 에러 내용을 분석하고 수정 방안 제시
- 수정 후 재빌드할지 사용자에게 확인
