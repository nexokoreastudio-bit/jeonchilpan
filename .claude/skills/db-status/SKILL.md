---
name: db-status
description: Supabase DB 테이블별 데이터 현황을 한눈에 조회
disable-model-invocation: true
---

## DB 현황 조회

Supabase service role key를 사용하여 주요 테이블의 row count를 조회합니다.

조회 대상 테이블:
- `users` (전체 / admin / 일반)
- `posts` (게시글)
- `comments` (댓글)
- `leads` (상담신청 — 상태별)
- `resources` (자료실)
- `insights` (인사이트 — 발행/미발행)
- `field_news` (현장소식)
- `crawled_news` (크롤링 뉴스)
- `admin_audit_logs` (감사 로그)
- `point_logs` (포인트 로그)

환경변수 위치: `.env.local`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

결과를 테이블 형태로 깔끔하게 출력.
