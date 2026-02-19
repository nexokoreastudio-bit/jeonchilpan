-- 교육 뉴스 크롤링 기능을 위한 테이블 생성
-- Supabase SQL Editor에서 실행하세요

-- ============================================
-- 1. 크롤링된 뉴스 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS public.crawled_news (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL, -- 신문사명 (예: '조선일보', '중앙일보', '한국일보')
  category TEXT CHECK (category IN ('입시', '학업', '취업', '교육정책', '기타')) DEFAULT '기타',
  summary TEXT, -- 기사 요약 (선택사항)
  thumbnail_url TEXT, -- 썸네일 이미지 URL (선택사항)
  published_at TIMESTAMP WITH TIME ZONE, -- 원본 기사 발행일
  crawled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- 크롤링 시각
  is_featured BOOLEAN DEFAULT FALSE, -- 메인에 표시할지 여부
  view_count INTEGER DEFAULT 0, -- 조회수
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_crawled_news_category ON public.crawled_news(category, crawled_at DESC);
CREATE INDEX IF NOT EXISTS idx_crawled_news_source ON public.crawled_news(source, crawled_at DESC);
CREATE INDEX IF NOT EXISTS idx_crawled_news_featured ON public.crawled_news(is_featured, crawled_at DESC);
CREATE INDEX IF NOT EXISTS idx_crawled_news_published_at ON public.crawled_news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_crawled_news_url ON public.crawled_news(url);

-- RLS 활성화
ALTER TABLE public.crawled_news ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 모든 사용자는 조회 가능
DROP POLICY IF EXISTS "Crawled news are viewable by everyone" ON public.crawled_news;
CREATE POLICY "Crawled news are viewable by everyone" ON public.crawled_news
  FOR SELECT USING (true);

-- RLS 정책: 관리자만 관리 가능
DROP POLICY IF EXISTS "Admins can manage crawled news" ON public.crawled_news;
CREATE POLICY "Admins can manage crawled news" ON public.crawled_news
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- ============================================
-- 2. 뉴스 소스 관리 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS public.news_sources (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE, -- 신문사명
  base_url TEXT NOT NULL, -- 기본 URL
  rss_url TEXT, -- RSS 피드 URL (선택사항)
  category_filter TEXT[], -- 크롤링할 카테고리 필터
  is_active BOOLEAN DEFAULT TRUE, -- 활성화 여부
  crawl_interval_hours INTEGER DEFAULT 24, -- 크롤링 간격 (시간)
  last_crawled_at TIMESTAMP WITH TIME ZONE, -- 마지막 크롤링 시각
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_news_sources_active ON public.news_sources(is_active);

-- RLS 활성화
ALTER TABLE public.news_sources ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 모든 사용자는 조회 가능
DROP POLICY IF EXISTS "News sources are viewable by everyone" ON public.news_sources;
CREATE POLICY "News sources are viewable by everyone" ON public.news_sources
  FOR SELECT USING (true);

-- RLS 정책: 관리자만 관리 가능
DROP POLICY IF EXISTS "Admins can manage news sources" ON public.news_sources;
CREATE POLICY "Admins can manage news sources" ON public.news_sources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- ============================================
-- 3. 기본 뉴스 소스 데이터 삽입
-- ============================================
INSERT INTO public.news_sources (name, base_url, rss_url, is_active) VALUES
  -- 전체 뉴스 RSS를 사용하고 필터링으로 교육 관련 기사만 추출
  ('조선일보', 'https://www.chosun.com', 'https://www.chosun.com/arc/outboundfeeds/rss/', true),
  ('중앙일보', 'https://www.joongang.co.kr', 'https://rss.joongang.co.kr/', true),
  ('동아일보', 'https://www.donga.com', 'https://www.donga.com/rss/', true),
  ('연합뉴스', 'https://www.yna.co.kr', 'https://www.yna.co.kr/rss/society.xml', true),
  ('한국일보', 'https://www.hankookilbo.com', 'https://www.hankookilbo.com/rss/allArticle.xml', true),
  -- 추가 뉴스 소스
  ('한겨레', 'https://www.hani.co.kr', 'https://www.hani.co.kr/rss/', true),
  ('다음뉴스', 'https://news.daum.net', 'https://news.daum.net/rss/education', true)
ON CONFLICT (name) DO UPDATE SET rss_url = EXCLUDED.rss_url;

-- ============================================
-- 4. 트리거: updated_at 자동 업데이트
-- ============================================
CREATE OR REPLACE FUNCTION public.update_crawled_news_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_crawled_news_updated_at ON public.crawled_news;
CREATE TRIGGER trigger_update_crawled_news_updated_at
  BEFORE UPDATE ON public.crawled_news
  FOR EACH ROW
  EXECUTE FUNCTION public.update_crawled_news_updated_at();

CREATE OR REPLACE FUNCTION public.update_news_sources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_news_sources_updated_at ON public.news_sources;
CREATE TRIGGER trigger_update_news_sources_updated_at
  BEFORE UPDATE ON public.news_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_news_sources_updated_at();

