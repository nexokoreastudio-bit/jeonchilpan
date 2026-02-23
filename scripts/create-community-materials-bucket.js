/**
 * Supabase Storage 'community-materials' 버킷 생성 스크립트
 * 공유자료실 게시글용 이미지/문서 업로드 저장소
 *
 * 실행: node scripts/create-community-materials-bucket.js
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function createBucket() {
  console.log('🔄 community-materials 버킷 확인 중...\n')

  const { data: buckets, error: listError } = await supabase.storage.listBuckets()

  if (listError) {
    console.error('❌ 버킷 목록 조회 실패:', listError.message)
    process.exit(1)
  }

  const exists = buckets.find((b) => b.name === 'community-materials')
  if (exists) {
    console.log('✅ community-materials 버킷이 이미 존재합니다.')
    return
  }

  const { data, error } = await supabase.storage.createBucket('community-materials', {
    public: true,
    fileSizeLimit: 20971520, // 20MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/x-hwp',
    ],
  })

  if (error) {
    console.error('❌ 버킷 생성 실패:', error.message)
    console.log('\n💡 Supabase Dashboard > Storage > New bucket')
    console.log('   이름: community-materials, Public: ✅')
    process.exit(1)
  }

  console.log('✅ community-materials 버킷 생성 완료!')
  console.log('   scripts/setup-community-materials-storage.sql 참고')
}

createBucket()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('❌', e)
    process.exit(1)
  })
