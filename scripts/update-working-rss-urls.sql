-- 실제 작동하는 RSS 피드 URL로 업데이트
-- 전체 뉴스 RSS를 사용하고 필터링으로 교육 관련 기사만 추출

-- 조선일보: 전체 뉴스 RSS 사용
UPDATE public.news_sources 
SET rss_url = 'https://www.chosun.com/arc/outboundfeeds/rss/?outputType=xml'
WHERE name = '조선일보';

-- 중앙일보: 전체 뉴스 RSS 사용 (다른 형식 시도)
UPDATE public.news_sources 
SET rss_url = 'https://rss.joongang.co.kr/rss/joongang.xml'
WHERE name = '중앙일보';

-- 중앙일보 대안: RSS가 작동하지 않으면 비활성화
-- UPDATE public.news_sources 
-- SET is_active = false
-- WHERE name = '중앙일보' AND rss_url = 'https://rss.joongang.co.kr/rss/joongang.xml';

-- 동아일보: 전체 뉴스 RSS 사용 (다른 형식 시도)
UPDATE public.news_sources 
SET rss_url = 'https://www.donga.com/rss/donga.xml'
WHERE name = '동아일보';

-- 동아일보 대안: RSS가 작동하지 않으면 비활성화
-- UPDATE public.news_sources 
-- SET is_active = false
-- WHERE name = '동아일보' AND rss_url = 'https://www.donga.com/rss/donga.xml';

-- 연합뉴스: 사회 섹션 RSS 사용 (교육 뉴스 포함)
UPDATE public.news_sources 
SET rss_url = 'https://www.yna.co.kr/rss/society.xml'
WHERE name = '연합뉴스';

-- 한국일보: 전체 뉴스 RSS 사용 (다른 형식 시도)
UPDATE public.news_sources 
SET rss_url = 'https://www.hankookilbo.com/rss/allArticle.xml'
WHERE name = '한국일보';

-- 한국일보 대안: RSS가 작동하지 않으면 비활성화
-- UPDATE public.news_sources 
-- SET is_active = false
-- WHERE name = '한국일보' AND rss_url = 'https://www.hankookilbo.com/rss/allArticle.xml';

-- 한겨레 추가 (교육 뉴스가 많은 신문사)
INSERT INTO public.news_sources (name, base_url, rss_url, is_active)
SELECT '한겨레', 'https://www.hani.co.kr', 'https://www.hani.co.kr/rss/', true
WHERE NOT EXISTS (SELECT 1 FROM public.news_sources WHERE name = '한겨레');

-- 다음뉴스 교육 섹션 추가 (RSS가 작동하지 않으면 비활성화)
INSERT INTO public.news_sources (name, base_url, rss_url, is_active)
SELECT '다음뉴스', 'https://news.daum.net', 'https://news.daum.net/rss/education', false
WHERE NOT EXISTS (SELECT 1 FROM public.news_sources WHERE name = '다음뉴스');

-- 다음뉴스 대안: 전체 뉴스 RSS 사용 시도
-- UPDATE public.news_sources 
-- SET rss_url = 'https://news.daum.net/rss', is_active = true
-- WHERE name = '다음뉴스';

-- 확인
SELECT id, name, base_url, rss_url, is_active 
FROM public.news_sources 
WHERE is_active = true
ORDER BY name;

