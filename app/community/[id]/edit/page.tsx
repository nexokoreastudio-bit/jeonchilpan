import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPostById } from '@/lib/supabase/posts'
import { PostEditForm } from '@/components/community/post-edit-form'
import { ArrowLeft } from 'lucide-react'
import type { BoardType } from '@/lib/supabase/posts'
import { Database } from '@/types/database'

interface PageProps {
  params: { id: string }
}

export default async function CommunityEditPage({ params }: PageProps) {
  const postId = parseInt(params.id)
  if (isNaN(postId)) notFound()

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect(`/login?redirect=/community/${postId}/edit`)
  }

  const post = await getPostById(postId)
  if (!post) notFound()

  const isAuthor = post.author_id === user.id

  let isAdmin = false
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
  isAdmin = (profile as Pick<Database['public']['Tables']['users']['Row'], 'role'> | null)?.role === 'admin'

  if (!isAuthor && !isAdmin) {
    redirect(`/community/${postId}`)
  }

  const boardType = (post.board_type || 'bamboo') as BoardType

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        href={`/community/${postId}`}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-nexo-navy mb-8 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        글보기
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-nexo-navy mb-2">글 수정</h1>
        <p className="text-gray-600">
          제목과 내용을 수정한 뒤 수정하기 버튼을 눌러주세요.
        </p>
      </div>

      <PostEditForm
        postId={post.id}
        userId={user.id}
        initialBoardType={boardType}
        initialTitle={post.title}
        initialContent={post.content}
      />
    </div>
  )
}
