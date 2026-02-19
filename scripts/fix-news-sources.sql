-- 뉴스 소스 데이터 수정 및 업데이트
-- Supabase SQL Editor에서 실행하세요

-- 기존 데이터 업데이트 (RSS URL 추가)
UPDATE public.news_sources 
SET rss_url = 'https://www.chosun.com/site/data/rss/education.xml'
WHERE name = '조선일보' AND rss_url IS NULL;

UPDATE public.news_sources 
SET rss_url = 'https://rss.joongang.co.kr/education.xml'
WHERE name = '중앙일보' AND rss_url IS NULL;

UPDATE public.news_sources 
SET rss_url = 'https://www.donga.com/rss/news/education.xml'
WHERE name = '동아일보' AND rss_url IS NULL;

-- 조선일보가 없으면 추가
INSERT INTO public.news_sources (name, base_url, rss_url, is_active)
SELECT '조선일보', 'https://www.chosun.com', 'https://www.chosun.com/site/data/rss/education.xml', true
WHERE NOT EXISTS (SELECT 1 FROM public.news_sources WHERE name = '조선일보');

-- 활성화된 소스 확인
SELECT id, name, base_url, rss_url, is_active, last_crawled_at 
FROM public.news_sources 
WHERE is_active = true
ORDER BY name;

