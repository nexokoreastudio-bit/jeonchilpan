/**
 * 커뮤니티 게시글/댓글/좋아요 초기화
 * 실행: node scripts/reset-community-content.js
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('환경변수 누락: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const TARGET_BOARD_TYPES = ['notice', 'bamboo', 'materials', 'job', 'verification']

async function run() {
  console.log('커뮤니티 콘텐츠 초기화를 시작합니다...')
  console.log(`대상 게시판: ${TARGET_BOARD_TYPES.join(', ')}`)

  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('id, board_type, title')
    .in('board_type', TARGET_BOARD_TYPES)

  if (postsError) {
    console.error('게시글 조회 실패:', postsError.message)
    process.exit(1)
  }

  const postIds = (posts || []).map((p) => p.id)
  console.log(`대상 게시글 수: ${postIds.length}`)

  if (postIds.length === 0) {
    console.log('초기화할 게시글이 없습니다.')
    return
  }

  const { error: likesError } = await supabase
    .from('likes')
    .delete()
    .in('post_id', postIds)

  if (likesError) {
    console.error('좋아요 삭제 실패:', likesError.message)
    process.exit(1)
  }

  const { error: commentsError } = await supabase
    .from('comments')
    .delete()
    .in('post_id', postIds)

  if (commentsError) {
    console.error('댓글 삭제 실패:', commentsError.message)
    process.exit(1)
  }

  const { error: deletePostsError } = await supabase
    .from('posts')
    .delete()
    .in('id', postIds)

  if (deletePostsError) {
    console.error('게시글 삭제 실패:', deletePostsError.message)
    process.exit(1)
  }

  console.log('초기화 완료:')
  console.log(`- 게시글: ${postIds.length}건 삭제`)
  console.log('- 댓글/좋아요: 연관 데이터 삭제')
}

run().catch((error) => {
  console.error('초기화 중 예외 발생:', error)
  process.exit(1)
})
