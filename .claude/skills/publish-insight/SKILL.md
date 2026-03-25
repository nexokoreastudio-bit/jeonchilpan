---
name: publish-insight
description: 인사이트 콘텐츠 작성 및 DB 발행 지원
disable-model-invocation: true
---

## 인사이트 발행

인사이트를 작성하고 Supabase `insights` 테이블에 저장합니다.

### 입력 방식
1. URL 전달 시: 해당 URL의 뉴스를 요약하여 인사이트 초안 작성
2. 주제 전달 시: 주제 기반으로 인사이트 초안 작성
3. 인자 없이 실행 시: 최근 크롤링 뉴스에서 추천

### 인사이트 구조
- title: 학부모 상담에 활용 가능한 제목
- summary: 2-3문장 요약
- content: HTML 형식 본문 (넥소 에디터 관점 해석 포함)
- category: 입시/정책/학습법/상담팁/기타
- thumbnail_url: (선택) Unsplash에서 관련 이미지

### 발행 프로세스
1. 초안 작성 → 사용자 확인
2. 수정 요청 반영
3. DB 저장 (is_published: true, published_at: now)
4. 발행 완료 안내

콘텐츠 작성 시 NEXO 회사 입장에서 작성할 것.
