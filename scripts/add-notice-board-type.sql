-- 전칠판 공지사항 게시판 추가
-- 공지사항은 관리자만 작성 가능

-- 1. 기존 제약조건 제거
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_board_type_check;

-- 2. 새 제약조건 추가 (notice 포함)
ALTER TABLE public.posts
ADD CONSTRAINT posts_board_type_check
CHECK (board_type IN ('bamboo', 'materials', 'verification', 'notice'));
