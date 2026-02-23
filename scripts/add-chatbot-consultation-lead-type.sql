-- 리드 타입에 chatbot_consultation 추가 (챗봇에서 연락처 제출 시 구분)
-- Supabase SQL Editor에서 실행하세요

-- 기존 type CHECK 제약 제거 후 새 타입 추가
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_type_check;
ALTER TABLE public.leads
  ADD CONSTRAINT leads_type_check
  CHECK (type IN ('demo', 'quote', 'consultation', 'chatbot_consultation'));
