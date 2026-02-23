-- 커뮤니티 첫 글 작성
-- Supabase SQL Editor에서 실행하세요

INSERT INTO public.posts (board_type, title, content, author_id)
SELECT 
  'free_talk',
  '넥소가 바쁘신 원장님들을 위한 교육 커뮤니티를 운영합니다.',
  '안녕하세요 (주)넥소 입니다. ^^

언제나 바쁘신 원장님들을 위한 교육 뉴스 및 컬럼 커뮤니티를 오픈 했습니다.

앞으로 유익한 교육 정보와 함께 소통하는 공간이 되었으면 합니다.
많은 참여 부탁드립니다!',
  (SELECT id FROM public.users ORDER BY created_at DESC LIMIT 1);
