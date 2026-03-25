---
name: audit-log
description: 최근 관리자 작업 감사 로그 조회
disable-model-invocation: true
---

## 감사 로그 조회

`admin_audit_logs` 테이블에서 최근 로그를 조회합니다.

기본 동작:
- 최근 20건 조회
- 인자로 숫자 전달 시 해당 건수 조회 (예: `/audit-log 50`)
- 인자로 액션명 전달 시 필터링 (예: `/audit-log lead.status_update`)

출력 포맷:
| 일시 | 관리자 | 액션 | 대상 | 상세 |

환경변수: `.env.local`의 Supabase 연결 정보 사용.
