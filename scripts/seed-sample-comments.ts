/**
 * 댓글 표시가 있는 게시물에 실제 댓글 수를 맞추는 시드
 * - comments_count > 0 인 게시물에 부족한 댓글 추가
 * - 각 댓글은 서로 다른 사용자(다른 스타일)로 작성
 *
 * 실행: npx tsx scripts/seed-sample-comments.ts
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
  auth: { autoRefreshToken: false, persistSession: false }
})

/** 아이디별로 다른 댓글 스타일 - 짧은/긴, 이모지 유무, 톤 등 */
const COMMENT_STYLES: Array<{ content: string }> = [
  { content: '공감해요!' },
  { content: '저도 같은 생각이에요. 좋은 정보 감사합니다.' },
  { content: '도움 되었어요 😊' },
  { content: '저희 학원에서도 비슷한 고민이 있었는데, 참고하겠습니다.' },
  { content: '맞아요. 저도 같은 경험이 있어요.' },
  { content: '그거 어떻게 해결하셨어요? 궁금합니다.' },
  { content: '좋은 팁이네요. 한번 적용해볼게요!' },
  { content: '감사합니다. 자료 잘 쓰겠습니다.' },
  { content: '저도 전자칠판 쓰는데 정말 편해요 👍' },
  { content: '학부모님들 반응 어땠나요? 저도 고민 중이에요.' },
  { content: '실무에서 바로 활용할 수 있겠네요. 수고하셨습니다.' },
  { content: '저희 지역에서는 어떻게 하는지 궁금해요.' },
  { content: '정말 유용한 정보예요. 공유해주셔서 감사합니다~' },
  { content: '추천해주신 방법 한번 시도해봐야겠어요.' },
  { content: '같은 상황이셨군요. 저도 비슷하게 했어요.' },
  { content: '입시 자료 준비하시느라 고생 많으십니다.' },
  { content: '전자칠판으로 보여주면 효과 좋을 것 같아요.' },
  { content: '저희 학원 커리큘럼에도 참고해볼게요.' },
  { content: '학원장님들 다들 고민이 비슷하네요 ㅎㅎ' },
  { content: '시기별로 정리해두시면 나중에 편하실 거예요.' },
  { content: '많은 도움 됐어요. 다음에 또 올려주세요!' },
  { content: '저도 요즘 그 부분 고민 중이에요.' },
  { content: '실제 경험담 들어보니 더 와닿네요.' },
  { content: '템플릿 잘 쓰겠습니다. 감사해요!' },
  { content: '다른 지역 학원장님들 의견도 궁금하네요.' },
  { content: '좋은 후기 공유해주셔서 감사합니다.' },
  { content: '저희도 도입 고민 중인데 참고가 됐어요.' },
  { content: '상담 시 활용하면 좋겠어요. 감사합니다.' },
  { content: '학생들 반응 어떤가요? 궁금해요.' },
  { content: '여기 커뮤니티에서 정말 많은 도움 받고 있어요.' },
]

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

async function main() {
  console.log('=== 댓글 시드 시작 ===\n')

  // 1. 댓글이 필요한 게시물 조회 (comments_count > 0)
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('id, title, comments_count')
    .gt('comments_count', 0)
    .order('created_at', { ascending: false })

  if (postsError || !posts || posts.length === 0) {
    console.log('댓글이 필요한 게시물이 없습니다.')
    return
  }

  // 2. 사용자 ID 목록 (댓글 작성자용, nexo.korea.studio 제외)
  const { data: users } = await supabase.from('users').select('id, email').limit(50)
  const userIds = (users || [])
    .filter(u => u.email !== 'nexo.korea.studio@gmail.com')
    .map(u => u.id)
  if (userIds.length === 0) {
    console.error('사용자가 없습니다. 먼저 seed:sample을 실행하세요.')
    process.exit(1)
  }

  // 3. 각 게시물별 실제 댓글 수 조회
  let totalAdded = 0
  for (const post of posts) {
    const { count, error: countError } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post.id)

    if (countError) {
      console.log(`  ✗ [${post.id}] ${post.title}: 조회 실패`)
      continue
    }

    const actualCount = count || 0
    const needed = post.comments_count - actualCount

    if (needed <= 0) {
      continue
    }

    console.log(`[${post.id}] ${post.title.slice(0, 30)}... — ${actualCount}/${post.comments_count} → ${needed}개 추가`)

    const now = new Date()
    for (let i = 0; i < needed; i++) {
      // 각 댓글마다 다른 사용자 + 다른 스타일
      const authorId = userIds[(actualCount + i) % userIds.length]
      const style = COMMENT_STYLES[(actualCount + i) % COMMENT_STYLES.length]
      const hoursAgo = (actualCount + i + 1) * 2 // 시간 간격
      const createdAt = new Date(now)
      createdAt.setHours(createdAt.getHours() - hoursAgo)

      const { error } = await supabase.from('comments').insert({
        post_id: post.id,
        author_id: authorId,
        content: style.content,
        created_at: createdAt.toISOString(),
        updated_at: createdAt.toISOString(),
      })

      if (error) {
        console.log(`    ✗ 댓글 ${i + 1}: ${error.message}`)
      } else {
        totalAdded++
      }
      await sleep(100)
    }
  }

  console.log(`\n=== 완료: ${totalAdded}개 댓글 추가됨 ===`)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
