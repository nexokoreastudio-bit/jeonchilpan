-- 학원 선생님 구인/구직 게시판 추가
-- 실행: Supabase SQL Editor에서 실행

-- 1. 기존 board_type CHECK 제약조건 제거
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_board_type_check;

-- 2. job(구인/구직) 추가
ALTER TABLE public.posts
ADD CONSTRAINT posts_board_type_check
CHECK (board_type IN ('bamboo', 'materials', 'verification', 'notice', 'job'));
