-- 뉴스 토론 게시판 추가를 위한 데이터베이스 스키마 수정
-- Supabase SQL Editor에서 실행

-- 1. posts 테이블에 news_id 컬럼 추가
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS news_id INTEGER REFERENCES public.crawled_news(id) ON DELETE SET NULL;

-- 2. news_id에 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_posts_news_id ON public.posts(news_id);

-- 3. board_type CHECK 제약조건 수정 (news_discussion 추가)
-- 기존 제약조건 제거
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_board_type_check;

-- 새로운 제약조건 추가 (news_discussion 포함)
ALTER TABLE public.posts 
ADD CONSTRAINT posts_board_type_check 
CHECK (board_type IN ('free', 'qna', 'tip', 'market', 'news_discussion'));

-- 4. 확인 쿼리
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'posts' AND column_name = 'news_id';

SELECT 
  constraint_name, 
  check_clause
FROM information_schema.check_constraints 
WHERE constraint_name = 'posts_board_type_check';

