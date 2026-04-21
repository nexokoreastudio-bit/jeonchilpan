-- 커뮤니티 고도화: pin, report, search
-- Supabase Dashboard > SQL Editor에서 실행하세요

-- 1. posts 테이블에 is_pinned 컬럼 추가
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_posts_pinned ON public.posts(is_pinned DESC, created_at DESC);

-- 2. 게시글 신고 테이블
CREATE TABLE IF NOT EXISTS public.post_reports (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, reporter_id) -- 같은 유저가 같은 글 중복 신고 방지
);

CREATE INDEX IF NOT EXISTS idx_post_reports_status ON public.post_reports(status);
CREATE INDEX IF NOT EXISTS idx_post_reports_post ON public.post_reports(post_id);

-- RLS
ALTER TABLE public.post_reports ENABLE ROW LEVEL SECURITY;

-- 로그인 유저는 신고 가능
CREATE POLICY "Authenticated users can report posts"
  ON public.post_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- 자신의 신고만 조회 가능
CREATE POLICY "Users can view own reports"
  ON public.post_reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- 관리자는 모든 신고 조회 가능
CREATE POLICY "Admins can view all reports"
  ON public.post_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- 관리자만 신고 상태 업데이트 가능
CREATE POLICY "Admins can update reports"
  ON public.post_reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- 3. posts 테이블에 전문 검색 인덱스 (한국어 지원)
CREATE INDEX IF NOT EXISTS idx_posts_title_search ON public.posts USING gin(to_tsvector('simple', title));
