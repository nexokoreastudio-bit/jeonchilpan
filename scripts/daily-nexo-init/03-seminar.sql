-- ============================================
-- Daily-Nexo 초기 DB 설정 - 03: 세미나
-- 02-extensions.sql 실행 후 실행
-- ============================================

CREATE TABLE IF NOT EXISTS public.seminars (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  format TEXT NOT NULL CHECK (format IN ('offline', 'online', 'vod')),
  status TEXT DEFAULT 'recruiting' CHECK (status IN ('recruiting', 'closed', 'completed')),
  access_type TEXT DEFAULT 'free' CHECK (access_type IN ('free', 'point', 'gold')),
  point_cost INTEGER DEFAULT 0,
  thumbnail_url TEXT,
  event_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  max_participants INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seminars_status ON public.seminars(status);
CREATE INDEX IF NOT EXISTS idx_seminars_format ON public.seminars(format);
CREATE INDEX IF NOT EXISTS idx_seminars_event_date ON public.seminars(event_date);

ALTER TABLE public.seminars ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view seminars" ON public.seminars;
CREATE POLICY "Anyone can view seminars" ON public.seminars FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage seminars" ON public.seminars;
CREATE POLICY "Admins can manage seminars" ON public.seminars FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- 세미나 신청
CREATE TABLE IF NOT EXISTS public.seminar_applications (
  id SERIAL PRIMARY KEY,
  seminar_id INTEGER NOT NULL REFERENCES public.seminars(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  academy_name TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(seminar_id, email)
);

CREATE INDEX IF NOT EXISTS idx_seminar_applications_seminar_id ON public.seminar_applications(seminar_id);
CREATE INDEX IF NOT EXISTS idx_seminar_applications_email ON public.seminar_applications(email);

ALTER TABLE public.seminar_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can create seminar applications" ON public.seminar_applications;
CREATE POLICY "Anyone can create seminar applications" ON public.seminar_applications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view seminar applications" ON public.seminar_applications;
CREATE POLICY "Admins can view seminar applications" ON public.seminar_applications FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
);

DROP POLICY IF EXISTS "Admins can update seminar applications" ON public.seminar_applications;
CREATE POLICY "Admins can update seminar applications" ON public.seminar_applications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- 샘플 세미나 데이터
INSERT INTO public.seminars (title, description, format, status, access_type, point_cost)
SELECT '대치동 입시 트렌드 & 넥소 전자칠판 활용 세미나',
       '대치동 입시 현장의 최신 트렌드를 파악하고, 넥소 전자칠판을 활용한 효율적인 수업 노하우를 공유합니다.',
       'offline', 'recruiting', 'free', 0
WHERE NOT EXISTS (SELECT 1 FROM public.seminars LIMIT 1);

INSERT INTO public.seminars (title, description, format, status, access_type, point_cost)
SELECT '초보 강사를 위한 전자칠판 판서 마스터 과정',
       '전자칠판 판서의 기본부터 활용까지, 초보 강사님들을 위한 실전 VOD 과정입니다.',
       'vod', 'recruiting', 'point', 5000
WHERE (SELECT COUNT(*) FROM public.seminars) < 2;
