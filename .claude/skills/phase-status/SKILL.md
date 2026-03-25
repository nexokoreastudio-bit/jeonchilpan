---
name: phase-status
description: 전칠판 고도화 진행 상태 + 다음 작업 확인
---

## 고도화 Phase 상태 확인

프로젝트 메모리에서 현재 진행 상태를 읽고 요약합니다.

### 확인 항목
1. 현재 브랜치 + 커밋 히스토리 (feature 브랜치 기준)
2. 미커밋 변경사항 유무
3. 메모리 파일에서 다음 작업 목록 읽기:
   - `/Users/nexo_jo/.claude/projects/-Users-nexo-jo/memory/project_daily_nexo_phase1_status.md`
4. 보류 사항 (카카오 키 등)

### 출력
- 완료된 Phase 목록 (커밋 기준)
- 다음 해야 할 작업 목록
- 보류 사항
- 추천 다음 액션

세션 시작 시 자동으로 호출될 수 있음.
