import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PostWriteForm } from '@/components/community/post-write-form'
import { getNewsById } from '@/lib/supabase/news'

interface PageProps {
  searchParams: {
    type?: string
    newsId?: string
  }
}

export default async function WritePostPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  // 현재 사용자 확인
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login?redirect=/community/write')
  }

  // URL 파라미터에서 타입 확인
  const initialBoardType =
    searchParams.type === 'review'
      ? ('review' as const)
      : searchParams.type === 'news_discussion'
      ? ('news_discussion' as const)
      : searchParams.type && ['free', 'qna', 'tip'].includes(searchParams.type)
      ? (searchParams.type as 'free' | 'qna' | 'tip')
      : undefined

  // 뉴스 ID가 있으면 뉴스 정보 가져오기
  let newsData = null
  if (searchParams.newsId) {
    const newsId = parseInt(searchParams.newsId)
    if (!isNaN(newsId)) {
      newsData = await getNewsById(newsId)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-nexo-navy mb-2">
          {initialBoardType === 'review' 
            ? '후기 작성' 
            : initialBoardType === 'news_discussion'
            ? '📰 뉴스 토론 글쓰기'
            : '글쓰기'}
        </h1>
        <p className="text-gray-600">
          {initialBoardType === 'review'
            ? '전자칠판 사용 후기를 작성해주세요'
            : initialBoardType === 'news_discussion'
            ? '교육 뉴스를 주제로 토론하고 의견을 나눠보세요'
            : '커뮤니티에 글을 작성해주세요'}
        </p>
      </div>

      <PostWriteForm 
        userId={user.id} 
        initialBoardType={initialBoardType}
        newsData={newsData}
      />
    </div>
  )
}

