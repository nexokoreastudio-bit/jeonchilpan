-- ============================================
-- NEXO Daily 팬덤·바이럴·마켓플레이스 통합 구축
-- Supabase SQL Editor에서 실행하세요
-- 유입(Inflow) -> 팬덤(Fandom) -> 수익화(Revenue) 선순환 구조
-- ============================================

-- ============================================
-- 1. 게시판 카테고리(board_type) 세분화
-- ============================================
-- struggle: 원장님 생존기/고민 상담 (진정성 기반 팬덤)
-- regional: 지역 학원 동향/네트워킹
-- material: 과목별 수업/상담 자료 공유

-- 1-1. 기존 CHECK 제약조건 제거
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_board_type_check;

-- 1-2. 새 board_type 값 추가 (신규 3종 + 기존 호환용)
ALTER TABLE public.posts
ADD CONSTRAINT posts_board_type_check
CHECK (board_type IN (
  'struggle',         -- 원장님 생존기/고민 상담
  'regional',         -- 지역 학원 동향/네트워킹
  'material',         -- 과목별 수업/상담 자료 공유
  'material_share', 'regional_network', 'job_board', 'free_talk', 'free', 'qna', 'tip', 'market', 'review', 'news_discussion'
));

-- 1-3. 기존 게시글 마이그레이션 (신규 3종으로 매핑)
UPDATE public.posts SET board_type = 'struggle' WHERE board_type IN ('free_talk', 'free', 'qna', 'review');
UPDATE public.posts SET board_type = 'regional' WHERE board_type IN ('regional_network', 'news_discussion', 'job_board');
UPDATE public.posts SET board_type = 'material' WHERE board_type IN ('material_share', 'tip', 'market');

-- 1-4. (선택) 기존 타입 완전 제거 후 신규 3종만 유지
-- ALTER TABLE public.posts DROP CONSTRAINT posts_board_type_check;
-- ALTER TABLE public.posts
-- ADD CONSTRAINT posts_board_type_check
-- CHECK (board_type IN ('struggle', 'regional', 'material'));

-- ============================================
-- 2. 마켓플레이스 테이블 (digital_materials)
-- ============================================
CREATE TABLE IF NOT EXISTS public.digital_materials (
  id SERIAL PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  subject_category TEXT,           -- 과목(국어, 수학, 영어 등)
  price INTEGER NOT NULL DEFAULT 0, -- 포인트 가격 (0 = 무료)
  downloads_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_digital_materials_author ON public.digital_materials(author_id);
CREATE INDEX IF NOT EXISTS idx_digital_materials_subject ON public.digital_materials(subject_category);
CREATE INDEX IF NOT EXISTS idx_digital_materials_created ON public.digital_materials(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_digital_materials_price ON public.digital_materials(price);

-- RLS 활성화
ALTER TABLE public.digital_materials ENABLE ROW LEVEL SECURITY;

-- 모든 사용자 조회 가능 (is_published = true)
DROP POLICY IF EXISTS "Anyone can view published materials" ON public.digital_materials;
CREATE POLICY "Anyone can view published materials" ON public.digital_materials
  FOR SELECT USING (
    is_published = true OR
    auth.uid() = author_id
  );

-- 로그인 사용자만 등록 가능
DROP POLICY IF EXISTS "Authenticated users can create materials" ON public.digital_materials;
CREATE POLICY "Authenticated users can create materials" ON public.digital_materials
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- 본인만 수정/삭제 가능
DROP POLICY IF EXISTS "Authors can update own materials" ON public.digital_materials;
CREATE POLICY "Authors can update own materials" ON public.digital_materials
  FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can delete own materials" ON public.digital_materials;
CREATE POLICY "Authors can delete own materials" ON public.digital_materials
  FOR DELETE USING (auth.uid() = author_id);

-- ============================================
-- 3. 마켓플레이스 구매 내역 (marketplace_purchases)
-- ============================================
CREATE TABLE IF NOT EXISTS public.marketplace_purchases (
  id SERIAL PRIMARY KEY,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  material_id INTEGER NOT NULL REFERENCES public.digital_materials(id) ON DELETE CASCADE,
  price_paid INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(buyer_id, material_id)
);

CREATE INDEX IF NOT EXISTS idx_marketplace_purchases_buyer ON public.marketplace_purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_purchases_material ON public.marketplace_purchases(material_id);

ALTER TABLE public.marketplace_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own purchases" ON public.marketplace_purchases;
CREATE POLICY "Users can view own purchases" ON public.marketplace_purchases
  FOR SELECT USING (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Authenticated users can purchase" ON public.marketplace_purchases;
CREATE POLICY "Authenticated users can purchase" ON public.marketplace_purchases
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- ============================================
-- 4. 퀴즈 결과/리드 캡처 (quiz_leads)
-- ============================================
-- 바이럴 퀴즈 결과지 PDF 수령을 위한 가입 유도
CREATE TABLE IF NOT EXISTS public.quiz_leads (
  id SERIAL PRIMARY KEY,
  quiz_type TEXT NOT NULL,           -- e.g. 'academy_personality'
  result_type TEXT,                  -- 퀴즈 결과 유형
  result_summary JSONB,              -- 결과 요약 JSON
  email TEXT,
  name TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_leads_quiz_type ON public.quiz_leads(quiz_type);
CREATE INDEX IF NOT EXISTS idx_quiz_leads_email ON public.quiz_leads(email);
CREATE INDEX IF NOT EXISTS idx_quiz_leads_created ON public.quiz_leads(created_at DESC);

ALTER TABLE public.quiz_leads ENABLE ROW LEVEL SECURITY;

-- 누구나 퀴즈 리드 생성 가능 (비회원 가입 유도)
DROP POLICY IF EXISTS "Anyone can create quiz leads" ON public.quiz_leads;
CREATE POLICY "Anyone can create quiz leads" ON public.quiz_leads
  FOR INSERT WITH CHECK (true);

-- 관리자만 조회
DROP POLICY IF EXISTS "Admins can view quiz leads" ON public.quiz_leads;
CREATE POLICY "Admins can view quiz leads" ON public.quiz_leads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- ============================================
-- 5. leads 테이블에 quiz 타입 추가 (선택)
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'leads') THEN
    ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_type_check;
    ALTER TABLE public.leads
    ADD CONSTRAINT leads_type_check
    CHECK (type IN ('demo', 'quote', 'consultation', 'quiz'));
  END IF;
END $$;

-- ============================================
-- 6. point_logs related_type에 marketplace, quiz 추가
-- ============================================
ALTER TABLE public.point_logs DROP CONSTRAINT IF EXISTS point_logs_related_type_check;
ALTER TABLE public.point_logs
ADD CONSTRAINT point_logs_related_type_check
CHECK (related_type IS NULL OR related_type IN ('article', 'post', 'comment', 'resource', 'checkin', 'marketplace', 'quiz'));

-- ============================================
-- 7. users.point 컬럼 확인 (이미 존재함)
-- ============================================
-- users 테이블에 point 컬럼이 있다면 스킵
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'point'
  ) THEN
    ALTER TABLE public.users ADD COLUMN point INTEGER DEFAULT 0;
  END IF;
END $$;
