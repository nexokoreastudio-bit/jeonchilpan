---
name: og-check
description: 특정 페이지의 OG 태그, 메타데이터, SEO 상태 검증
disable-model-invocation: true
---

## OG 태그 / SEO 검증

인자로 경로를 받아 해당 페이지의 메타데이터를 검증합니다.

### 검증 항목
1. **metadata export 확인**: 해당 page.tsx에서 metadata 또는 generateMetadata 존재 여부
2. **OG 태그 필수 항목**:
   - og:title (있는지, 70자 이내인지)
   - og:description (있는지, 160자 이내인지)
   - og:image (있는지, 이미지 파일 존재하는지)
   - og:url
3. **Twitter 카드**: twitter:card, twitter:title, twitter:image
4. **구조화 데이터**: JSON-LD 존재 여부
5. **카카오 공유**: ShareBar 컴포넌트 배치 여부

### 사용 예시
- `/og-check /community` → 커뮤니티 페이지 검증
- `/og-check /leads/consultation` → 상담신청 페이지 검증
- `/og-check` (인자 없음) → 주요 페이지 전체 일괄 검증
