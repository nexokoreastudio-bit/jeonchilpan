---
name: crawl-news
description: 교육 뉴스 수동 크롤링 실행 및 결과 확인
disable-model-invocation: true
---

## 뉴스 크롤링

프로젝트의 뉴스 크롤링 API를 수동으로 호출합니다.

### 실행 방법
1. 로컬 서버가 실행 중인지 확인
2. `/api/crawl-news` 엔드포인트 호출
3. 크롤링 결과 표시 (새로 수집된 뉴스 수, 제목 목록)

### 결과 확인
- `crawled_news` 테이블에서 최근 수집 뉴스 10건 조회
- 카테고리별 분포 표시

### 분석 (선택)
- 인자로 `--analyze` 전달 시 `/api/analyze-news` 도 함께 호출
- AI 분석 결과 확인
