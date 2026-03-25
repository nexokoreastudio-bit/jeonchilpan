---
name: deploy
description: 안전 빌드 → develop 머지 → 배포 준비 프로세스
disable-model-invocation: true
---

## 배포 프로세스

단계별로 실행하며 매 단계 사용자 확인을 받습니다.

### Step 1: 사전 점검
- `git status` — 미커밋 변경사항 확인
- 미커밋 있으면 커밋 먼저 진행할지 확인

### Step 2: 안전 빌드
- `npm run type-check` → `npm run build`
- 실패 시 중단 + 에러 안내

### Step 3: 브랜치 확인
- 현재 브랜치 확인
- feature 브랜치면 → develop 머지 제안
- develop이면 → main 머지 제안

### Step 4: 머지
- 사용자 확인 후 머지 실행
- 충돌 발생 시 안내

### Step 5: Push
- 사용자 확인 후 원격에 push
- Netlify 자동 배포 트리거 안내

주의: 각 단계에서 반드시 사용자 확인 후 진행. --force 절대 사용 금지.
