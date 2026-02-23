'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updatePost } from '@/app/actions/posts'
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
import type { BoardType } from '@/lib/supabase/posts'

interface PostEditFormProps {
  postId: number
  userId: string
  initialBoardType: BoardType
  initialTitle: string
  initialContent: string
}

export function PostEditForm({
  postId,
  userId,
  initialBoardType,
  initialTitle,
  initialContent,
}: PostEditFormProps) {
  const router = useRouter()
  const [boardType, setBoardType] = useState<string>(initialBoardType)
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 입력해주세요.')
      setLoading(false)
      return
    }

    try {
      const result = await updatePost(postId, title, content, userId, boardType as BoardType)

      if (result.success) {
        router.push(`/community/${postId}`)
        router.refresh()
      } else {
        setError(result.error || '글 수정에 실패했습니다.')
      }
    } catch (err: any) {
      setError(err.message || '글 수정 중 오류가 발생했습니다.')
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
            <SelectItem value="bamboo">원장님 대나무숲</SelectItem>
            <SelectItem value="materials">넥소 공식 자료실</SelectItem>
            <SelectItem value="verification">구독자 인증 요청</SelectItem>
          </SelectContent>
        </Select>
      </div>

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

      <div>
        <Label htmlFor="content">내용</Label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용을 입력하세요"
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
          {loading ? '수정 중...' : '수정하기'}
        </Button>
      </div>
    </form>
  )
}
