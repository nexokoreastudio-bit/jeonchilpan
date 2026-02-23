/**
 * 공유자료실(materials) 게시글 전부 삭제
 *
 * 실행: npx tsx scripts/delete-materials-posts.ts
 * 환경변수: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (.env.local)
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceKey) {
  console.error('NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 필요')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function deleteMaterialsPosts() {
  const { data: posts, error: selectError } = await supabase
    .from('posts')
    .select('id, title')
    .eq('board_type', 'materials')

  if (selectError) {
    console.error('조회 실패:', selectError.message)
    process.exit(1)
  }

  const count = posts?.length ?? 0
  if (count === 0) {
    console.log('삭제할 공유자료실 게시글이 없습니다.')
    return
  }

  console.log(`공유자료실 게시글 ${count}건 삭제 중...`)
  posts?.forEach((p) => console.log(`  - [${p.id}] ${p.title}`))

  const { error: deleteError } = await supabase
    .from('posts')
    .delete()
    .eq('board_type', 'materials')

  if (deleteError) {
    console.error('삭제 실패:', deleteError.message)
    process.exit(1)
  }

  console.log(`\n✅ 공유자료실 게시글 ${count}건 삭제 완료.`)
}

deleteMaterialsPosts()
