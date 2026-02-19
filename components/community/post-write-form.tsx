'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createPost } from '@/app/actions/posts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ExternalLink } from 'lucide-react'

interface PostWriteFormProps {
  userId: string
  initialBoardType?: 'free' | 'qna' | 'tip' | 'market' | 'review' | 'news_discussion'
  newsData?: {
    id: number
    title: string
    url: string
    source: string
    category: string
    summary: string | null
  } | null
}

export function PostWriteForm({ userId, initialBoardType, newsData }: PostWriteFormProps) {
  const router = useRouter()
  const [boardType, setBoardType] = useState<string>(initialBoardType || 'free')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [rating, setRating] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 뉴스 데이터가 있으면 자동으로 제목과 내용 채우기
  useEffect(() => {
    if (newsData && boardType === 'news_discussion') {
      // 제목에서 HTML 태그 제거
      const cleanTitle = newsData.title.replace(/<[^>]*>/g, '').trim()
      setTitle(`[뉴스 토론] ${cleanTitle}`)
      
      // 요약에서 HTML 태그 제거
      const cleanSummary = newsData.summary 
        ? newsData.summary.replace(/<[^>]*>/g, '').trim()
        : ''
      
      setContent(`[관련 뉴스]
**제목**: ${cleanTitle}
**출처**: ${newsData.source}
**카테고리**: ${newsData.category}
**원문 링크**: [${newsData.url}](${newsData.url})

${cleanSummary ? `**요약**: ${cleanSummary}` : ''}

---

이 뉴스에 대해 어떻게 생각하시나요?
여러분의 의견을 공유해주세요! 💬
`)
    }
  }, [newsData, boardType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 입력해주세요.')
      setLoading(false)
      return
    }

    // 후기 작성 시 평점 필수
    if (boardType === 'review' && !rating) {
      setError('후기 작성 시 평점을 선택해주세요.')
      setLoading(false)
      return
    }

    try {
      const result = await createPost(
        boardType as 'free' | 'qna' | 'tip' | 'market' | 'review' | 'news_discussion',
        title,
        content,
        userId,
        undefined,
        rating || undefined,
        newsData?.id || null
      )

      if (result.success && result.postId) {
        router.push(`/community/${result.postId}`)
        router.refresh()
      } else {
        setError(result.error || '글 작성에 실패했습니다.')
      }
    } catch (err: any) {
      setError(err.message || '글 작성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="board-type">게시판</Label>
        <Select value={boardType} onValueChange={setBoardType}>
          <SelectTrigger id="board-type" className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="news_discussion">📰 뉴스 토론</SelectItem>
            <SelectItem value="free">자유게시판</SelectItem>
            <SelectItem value="qna">Q&A</SelectItem>
            <SelectItem value="tip">팁 & 노하우</SelectItem>
            {/* 중고장터는 숨김 */}
            {/* <SelectItem value="market">중고장터</SelectItem> */}
            <SelectItem value="review">고객 후기</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 뉴스 정보 표시 (뉴스 토론 게시판일 때) */}
      {newsData && boardType === 'news_discussion' && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">{newsData.title}</h3>
              <p className="text-sm text-gray-600 mb-2">
                출처: {newsData.source} | 카테고리: {newsData.category}
              </p>
              {newsData.summary && (
                <p className="text-sm text-gray-700 mb-3">{newsData.summary}</p>
              )}
            </div>
          </div>
          <a
            href={newsData.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
          >
            <ExternalLink className="w-4 h-4" />
            원문 보기
          </a>
        </div>
      )}

      <div>
        <Label htmlFor="title">제목</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          className="mt-2"
          required
        />
      </div>

      {/* 후기 작성 시 평점 선택 */}
      {boardType === 'review' && (
        <div>
          <Label htmlFor="rating">평점 *</Label>
          <div className="mt-2 flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-3xl transition-all ${
                  rating && star <= rating
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300 hover:text-yellow-300'
                }`}
              >
                ★
              </button>
            ))}
            {rating && (
              <span className="ml-2 text-sm text-gray-600">
                {rating}점 선택됨
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            후기 작성 시 평점을 필수로 선택해주세요
          </p>
        </div>
      )}

      <div>
        <Label htmlFor="content">내용</Label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            boardType === 'review'
              ? '전자칠판 사용 후기를 자세히 작성해주세요. 구체적인 사용 경험과 장단점을 포함하면 더욱 도움이 됩니다.'
              : boardType === 'news_discussion'
              ? '뉴스에 대한 의견을 자유롭게 작성해주세요. 다양한 관점의 토론이 환영합니다!'
              : '내용을 입력하세요'
          }
          className="mt-2 w-full min-h-[300px] p-3 border border-input rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          required
        />
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          취소
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? '작성 중...' : '작성하기'}
        </Button>
      </div>
    </form>
  )
}

