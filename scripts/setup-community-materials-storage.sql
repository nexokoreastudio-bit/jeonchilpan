-- 공유자료실 파일 업로드용 Storage 버킷 설정
-- Supabase Dashboard > Storage > New bucket 에서 먼저 'community-materials' 버킷을 생성하세요.
-- (Public bucket 체크)
--
-- 또는 아래 스크립트로 버킷 생성 후 SQL Editor에서 정책 실행

-- ============================================
-- 정책 1: 모든 사용자 읽기 (SELECT)
-- ============================================
DROP POLICY IF EXISTS "Community materials are viewable by everyone" ON storage.objects;

CREATE POLICY "Community materials are viewable by everyone"
ON storage.objects
FOR SELECT
USING (bucket_id = 'community-materials');

-- ============================================
-- 정책 2: 인증된 사용자 업로드 (INSERT)
-- ============================================
-- 서버 액션에서 createAdminClient로 업로드하므로 RLS를 bypass합니다.
-- 버킷만 존재하면 됩니다. 추가 정책은 필요 없을 수 있습니다.
--
-- (옵션) 직접 클라이언트에서 업로드할 경우 아래 정책 사용:
-- DROP POLICY IF EXISTS "Authenticated users can upload community materials" ON storage.objects;
-- CREATE POLICY "Authenticated users can upload community materials"
-- ON storage.objects FOR INSERT WITH CHECK (
--   bucket_id = 'community-materials' AND auth.role() = 'authenticated'
-- );
