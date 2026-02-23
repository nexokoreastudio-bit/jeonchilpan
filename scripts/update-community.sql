-- ============================================
-- NEXO Daily 커뮤니티 고도화 및 세미나 메뉴 DB 마이그레이션
-- Supabase SQL Editor에서 실행하세요
-- 기존 구조 유지, ALTER로 필요한 값만 추가/수정
-- ============================================

-- ============================================
-- 1. posts.board_type 세분화
-- ============================================
-- 새 board_type: material_share, regional_network, job_board, free_talk

-- 1-1. 기존 CHECK 제약조건 제거
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_board_type_check;

-- 1-2. 새 board_type 값 추가를 위한 제약조건 (기존+신규 모두 허용하여 마이그레이션)
ALTER TABLE public.posts 
ADD CONSTRAINT posts_board_type_check 
CHECK (board_type IN (
  'material_share',   -- 과목별 전자칠판 템플릿/자료 공유
  'regional_network', -- 지역별 학원장 모임/동향
  'job_board',        -- 학원 구인구직
  'free_talk',        -- 강사/원장 자유소통
  'free', 'qna', 'tip', 'market', 'review', 'news_discussion'  -- 기존 호환용
));

-- 1-3. 기존 게시글 board_type 마이그레이션
UPDATE public.posts SET board_type = 'free_talk' WHERE board_type = 'free';
UPDATE public.posts SET board_type = 'free_talk' WHERE board_type = 'qna';
UPDATE public.posts SET board_type = 'material_share' WHERE board_type = 'tip';
UPDATE public.posts SET board_type = 'job_board' WHERE board_type = 'market';
UPDATE public.posts SET board_type = 'free_talk' WHERE board_type = 'review';
UPDATE public.posts SET board_type = 'regional_network' WHERE board_type = 'news_discussion';

-- 1-4. (선택) 기존 enum 완전 제거 후 신규만 유지하려면 아래 실행
-- ALTER TABLE public.posts DROP CONSTRAINT posts_board_type_check;
-- ALTER TABLE public.posts 
-- ADD CONSTRAINT posts_board_type_check 
-- CHECK (board_type IN ('material_share', 'regional_network', 'job_board', 'free_talk'));

-- ============================================
-- 2. 세미나(seminars) 테이블 생성
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

-- RLS 활성화
ALTER TABLE public.seminars ENABLE ROW LEVEL SECURITY;

-- RLS: 모든 사용자가 세미나 조회 가능
DROP POLICY IF EXISTS "Anyone can view seminars" ON public.seminars;
CREATE POLICY "Anyone can view seminars" ON public.seminars
  FOR SELECT USING (true);

-- 관리자만 세미나 생성/수정/삭제
DROP POLICY IF EXISTS "Admins can manage seminars" ON public.seminars;
CREATE POLICY "Admins can manage seminars" ON public.seminars
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- ============================================
-- 3. 세미나 신청(seminar_applications) 테이블
-- ============================================
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

-- RLS
ALTER TABLE public.seminar_applications ENABLE ROW LEVEL SECURITY;

-- 누구나 신청 가능
DROP POLICY IF EXISTS "Anyone can create seminar applications" ON public.seminar_applications;
CREATE POLICY "Anyone can create seminar applications" ON public.seminar_applications
  FOR INSERT WITH CHECK (true);

-- 관리자만 조회/수정
DROP POLICY IF EXISTS "Admins can view seminar applications" ON public.seminar_applications;
CREATE POLICY "Admins can view seminar applications" ON public.seminar_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update seminar applications" ON public.seminar_applications;
CREATE POLICY "Admins can update seminar applications" ON public.seminar_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- ============================================
-- 4. 세미나 시드 데이터 (샘플) - 테이블이 비어 있을 때만 삽입
-- ============================================
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
