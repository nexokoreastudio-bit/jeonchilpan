-- 구독자 인증글 게시판 추가
-- 가입 후 인증글을 남기면 관리자가 승인하는 방식

ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_board_type_check;

ALTER TABLE public.posts
ADD CONSTRAINT posts_board_type_check
CHECK (board_type IN ('bamboo', 'materials', 'verification'));
