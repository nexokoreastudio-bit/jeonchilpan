-- 리드 상태 확장: 상담중, 시연신청완료, 견적완료, 상담완료 추가
-- Supabase SQL Editor에서 실행하세요

ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE public.leads
  ADD CONSTRAINT leads_status_check
  CHECK (status IN (
    'pending',           -- 대기중
    'in_consultation',   -- 상담중
    'contacted',         -- 연락완료
    'demo_completed',    -- 시연신청완료
    'quote_completed',   -- 견적완료
    'consultation_completed',  -- 상담완료
    'completed',         -- 완료 (기존)
    'cancelled'          -- 취소
  ));
