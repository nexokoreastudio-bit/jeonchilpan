-- ============================================
-- NEXO Daily 팬덤·마켓플레이스 - 핵심 테이블만
-- Supabase SQL Editor에서 한 번에 실행
-- ============================================

-- 1. digital_materials (P2P 마켓플레이스)
CREATE TABLE IF NOT EXISTS public.digital_materials (
  id SERIAL PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  subject_category TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_digital_materials_author ON public.digital_materials(author_id);
CREATE INDEX IF NOT EXISTS idx_digital_materials_subject ON public.digital_materials(subject_category);
CREATE INDEX IF NOT EXISTS idx_digital_materials_created ON public.digital_materials(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_digital_materials_price ON public.digital_materials(price);

ALTER TABLE public.digital_materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view published materials" ON public.digital_materials;
CREATE POLICY "Anyone can view published materials" ON public.digital_materials
  FOR SELECT USING (is_published = true OR auth.uid() = author_id);

DROP POLICY IF EXISTS "Authenticated users can create materials" ON public.digital_materials;
CREATE POLICY "Authenticated users can create materials" ON public.digital_materials
  FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can update own materials" ON public.digital_materials;
CREATE POLICY "Authors can update own materials" ON public.digital_materials
  FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can delete own materials" ON public.digital_materials;
CREATE POLICY "Authors can delete own materials" ON public.digital_materials
  FOR DELETE USING (auth.uid() = author_id);

-- 2. marketplace_purchases
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

-- 3. quiz_leads
CREATE TABLE IF NOT EXISTS public.quiz_leads (
  id SERIAL PRIMARY KEY,
  quiz_type TEXT NOT NULL,
  result_type TEXT,
  result_summary JSONB,
  email TEXT,
  name TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_leads_quiz_type ON public.quiz_leads(quiz_type);
CREATE INDEX IF NOT EXISTS idx_quiz_leads_email ON public.quiz_leads(email);
CREATE INDEX IF NOT EXISTS idx_quiz_leads_created ON public.quiz_leads(created_at DESC);

ALTER TABLE public.quiz_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can create quiz leads" ON public.quiz_leads;
CREATE POLICY "Anyone can create quiz leads" ON public.quiz_leads
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view quiz leads" ON public.quiz_leads;
CREATE POLICY "Admins can view quiz leads" ON public.quiz_leads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );
