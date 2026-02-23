/**
 * nexo.korea.studio 아이디로 작성된 댓글 삭제
 *
 * 실행: npx tsx scripts/remove-nexo-comments.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function main() {
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', 'nexo.korea.studio@gmail.com')
    .maybeSingle()

  if (!user) {
    console.log('nexo.korea.studio 사용자를 찾을 수 없습니다.')
    return
  }

  const { data: deleted, error } = await supabase
    .from('comments')
    .delete()
    .eq('author_id', user.id)
    .select('id')

  if (error) {
    console.error('삭제 실패:', error.message)
    process.exit(1)
  }

  console.log(`nexo.korea.studio 댓글 ${deleted?.length || 0}개 삭제됨`)
}

main()
