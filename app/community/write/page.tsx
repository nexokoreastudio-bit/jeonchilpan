import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PostWriteForm } from '@/components/community/post-write-form'
import type { BoardType } from '@/lib/supabase/posts'

interface PageProps {
  searchParams: {
    type?: string
  }
}

const VALID_BOARD_TYPES: BoardType[] = ['bamboo', 'materials', 'notice']

export default async function WritePostPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login?redirect=/community/write')
  }

  let isAdmin = false
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()
  isAdmin = (profile as { role?: string } | null)?.role === 'admin'

  const initialBoardType =
    searchParams.type && VALID_BOARD_TYPES.includes(searchParams.type as BoardType)
      ? (searchParams.type as BoardType)
      : undefined

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-nexo-navy mb-2">글쓰기</h1>
        <p className="text-gray-600">
          전칠판에 글을 작성해주세요. 게시판을 선택하고 제목과 내용을 입력하세요.
        </p>
      </div>

      <PostWriteForm userId={user.id} initialBoardType={initialBoardType} isAdmin={isAdmin} />
    </div>
  )
}
