/**
 * 전칠판 커뮤니티에 '데일리 넥소' 오픈 공지글 등록
 *
 * 실행: npx tsx scripts/create-daily-nexo-open-notice.ts
 * 환경변수: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (.env.local)
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceKey) {
  console.error('NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 필요')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const NOTICE = {
  title: "[공지] (주)넥소의 소식이 더 빠르고 가깝게! '데일리 넥소' 오픈!!",
  content: `안녕하세요, 원장님! (주)넥소입니다.
변화무쌍한 교육 현장의 소식을 더 빠르게 전해드리기 위해, 오늘부터 **데일리 넥소**로 새롭게 찾아뵙습니다.

📅 매일 아침 9시 30분!
☕ 커피 한 잔과 함께 가볍게 읽으실 수 있는
✅ 오늘의 교육 핫이슈 / 스마트 칠판 1분 활용법 / 운영 꿀팁을
아주 짧고 핵심만 추려서 배달해 드릴게요.

원장님들의 매일이 더 스마트해질 수 있도록 넥소가 항상 곁에 있겠습니다!`,
}

async function createNotice() {
  // 1) admin 역할 사용자, 2) 없으면 첫 번째 사용자
  let { data: users, error } = await supabase
    .from('users')
    .select('id, nickname, email, role')
    .eq('role', 'admin')
    .limit(1)

  if (error) {
    console.error('❌ 사용자 조회 실패:', error.message)
    process.exit(1)
  }

  if (!users?.length) {
    const fallback = await supabase.from('users').select('id, nickname, email, role').limit(1).single()
    if (fallback.error || !fallback.data) {
      console.error('❌ users 테이블에 사용자가 없습니다. 먼저 가입 후 role=admin 설정하세요.')
      process.exit(1)
    }
    users = [fallback.data]
    console.log('⚠️ admin 사용자 없음. 첫 번째 사용자로 등록합니다.')
  }

  const admin = users![0]!
  console.log(`📌 작성자: ${admin.nickname || admin.email} (${admin.id})\n`)

  const { data: post, error: postError } = await supabase
    .from('posts')
    .insert({
      board_type: 'notice',
      title: NOTICE.title,
      content: NOTICE.content,
      author_id: admin.id,
      images: null,
      likes_count: 0,
      comments_count: 0,
    })
    .select('id, title, created_at')
    .single()

  if (postError) {
    console.error('❌ 게시글 등록 실패:', postError.message)
    process.exit(1)
  }

  console.log('✅ 공지글 등록 완료!')
  console.log(`   ID: ${post.id}`)
  console.log(`   제목: ${post.title}`)
  console.log(`   작성일: ${post.created_at}`)
  console.log('\n   /community 에서 확인하세요. (모든 탭 상단에 고정됩니다)')
}

createNotice()
