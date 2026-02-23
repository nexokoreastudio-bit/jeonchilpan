-- ============================================
-- Daily-Nexo 초기 DB 설정 - 02: 확장 테이블
-- 01-base.sql 실행 후 실행
-- ============================================

-- 1. 리드 (상담/견적 신청)
CREATE TABLE IF NOT EXISTS public.leads (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('demo', 'quote', 'consultation')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  academy_name TEXT,
  region TEXT,
  size TEXT,
  mount_type TEXT,
  quantity INTEGER,
  message TEXT,
  referrer_code TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'completed', 'cancelled')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_type ON public.leads(type);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can create leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can view all leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can update leads" ON public.leads;
CREATE POLICY "Anyone can create leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all leads" ON public.leads FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
);
CREATE POLICY "Admins can update leads" ON public.leads FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- 2. 인사이트 (교육 정보)
CREATE TABLE IF NOT EXISTS public.insights (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  category TEXT CHECK (category IN ('입시', '정책', '학습법', '상담팁', '기타')) DEFAULT '기타',
  edition_id TEXT,
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  thumbnail_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_insights_edition ON public.insights(edition_id);
CREATE INDEX IF NOT EXISTS idx_insights_published ON public.insights(is_published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_insights_published_at ON public.insights(published_at) WHERE published_at IS NOT NULL;

ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view published insights" ON public.insights;
DROP POLICY IF EXISTS "Admins can manage insights" ON public.insights;
CREATE POLICY "Anyone can view published insights" ON public.insights FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage insights" ON public.insights FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- 3. 현장 소식
CREATE TABLE IF NOT EXISTS public.field_news (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  location TEXT,
  installation_date DATE,
  images TEXT[],
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_published BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_field_news_published ON public.field_news(published_at DESC) WHERE is_published = TRUE;

ALTER TABLE public.field_news ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view published field news" ON public.field_news;
DROP POLICY IF EXISTS "Admins can insert field news" ON public.field_news;
DROP POLICY IF EXISTS "Admins can update field news" ON public.field_news;
DROP POLICY IF EXISTS "Admins can delete field news" ON public.field_news;
CREATE POLICY "Anyone can view published field news" ON public.field_news FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Admins can insert field news" ON public.field_news FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
);
CREATE POLICY "Admins can update field news" ON public.field_news FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
);
CREATE POLICY "Admins can delete field news" ON public.field_news FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- 4. 일일 출석
CREATE TABLE IF NOT EXISTS public.daily_checkins (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, checkin_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_date ON public.daily_checkins(user_id, checkin_date DESC);

ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own checkins" ON public.daily_checkins;
DROP POLICY IF EXISTS "Users can create own checkins" ON public.daily_checkins;
DROP POLICY IF EXISTS "Admins can view all checkins" ON public.daily_checkins;
CREATE POLICY "Users can view own checkins" ON public.daily_checkins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own checkins" ON public.daily_checkins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all checkins" ON public.daily_checkins FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- 출석 포인트 트리거
CREATE OR REPLACE FUNCTION public.add_points_for_daily_checkin()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.point_logs (user_id, amount, reason, related_id, related_type)
  VALUES (NEW.user_id, 5, 'daily_checkin', NEW.id, 'checkin');
  UPDATE public.users SET point = point + 5 WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_daily_checkin_created ON public.daily_checkins;
CREATE TRIGGER on_daily_checkin_created
  AFTER INSERT ON public.daily_checkins
  FOR EACH ROW EXECUTE FUNCTION public.add_points_for_daily_checkin();

-- 5. 뉴스 소스 시드 (크롤링용)
INSERT INTO public.news_sources (name, base_url, rss_url, is_active) VALUES
  ('조선일보', 'https://www.chosun.com', 'https://www.chosun.com/arc/outboundfeeds/rss/', true),
  ('중앙일보', 'https://www.joongang.co.kr', 'https://rss.joongang.co.kr/', true),
  ('동아일보', 'https://www.donga.com', 'https://www.donga.com/rss/', true),
  ('연합뉴스', 'https://www.yna.co.kr', 'https://www.yna.co.kr/rss/society.xml', true),
  ('한국일보', 'https://www.hankookilbo.com', 'https://www.hankookilbo.com/rss/allArticle.xml', true),
  ('한겨레', 'https://www.hani.co.kr', 'https://www.hani.co.kr/rss/', true),
  ('다음뉴스', 'https://news.daum.net', 'https://news.daum.net/rss/education', true)
ON CONFLICT (name) DO UPDATE SET rss_url = EXCLUDED.rss_url;
