-- NEXO Daily Lean 리뉴얼: board_type 통폐합
-- bamboo: 원장님 대나무숲 (익명/하소연)
-- materials: 공유자료실 (다운로드 전용)

-- 1. 기존 제약조건 제거
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_board_type_check;

-- 2. 기존 board_type을 bamboo 또는 materials로 매핑
UPDATE public.posts SET board_type = 'bamboo'
WHERE board_type IN (
  'struggle', 'regional', 'free_talk', 'free', 'qna', 'review',
  'job_board', 'regional_network', 'news_discussion'
);

UPDATE public.posts SET board_type = 'materials'
WHERE board_type IN ('material', 'material_share', 'tip', 'market');

-- 3. 새 제약조건 추가 (bamboo, materials만 허용)
ALTER TABLE public.posts
ADD CONSTRAINT posts_board_type_check
CHECK (board_type IN ('bamboo', 'materials'));

-- 4. NULL이 있으면 bamboo로 설정
UPDATE public.posts SET board_type = 'bamboo' WHERE board_type IS NULL;

-- 5. NOT NULL 제약 (선택)
-- ALTER TABLE public.posts ALTER COLUMN board_type SET NOT NULL;
-- ALTER TABLE public.posts ALTER COLUMN board_type SET DEFAULT 'bamboo';
