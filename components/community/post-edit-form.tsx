'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { updatePost } from '@/app/actions/posts'
import { uploadCommunityMaterial } from '@/app/actions/community-upload'
import { isImageFile } from '@/lib/utils/file-utils'
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
import { FileStack, Image, X } from 'lucide-react'
import type { BoardType } from '@/lib/supabase/posts'

function getFileNameFromUrl(url: string): string {
  const fn = url.split('/').pop() || ''
  try {
    return decodeURIComponent(fn)
  } catch {
    return fn
  }
}

interface PostEditFormProps {
  postId: number
  userId: string
  initialBoardType: BoardType
  initialTitle: string
  initialContent: string
  initialImages?: string[] | null
}

export function PostEditForm({
  postId,
  userId,
  initialBoardType,
  initialTitle,
  initialContent,
  initialImages,
}: PostEditFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [boardType, setBoardType] = useState<string>(initialBoardType)
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [attachments, setAttachments] = useState<{ url: string; name: string }[]>(
    (initialImages || []).map((url) => ({ url, name: getFileNameFromUrl(url) }))
  )
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isMaterials = boardType === 'materials'

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length || !isMaterials) return

    setUploading(true)
    setError(null)

    for (const file of Array.from(files)) {
      try {
        const arrayBuffer = await file.arrayBuffer()
        const result = await uploadCommunityMaterial({
          arrayBuffer: Array.from(new Uint8Array(arrayBuffer)),
          fileName: file.name,
        })

        if (result.success && result.url) {
          setAttachments((prev) => [...prev, { url: result.url!, name: file.name }])
        } else {
          setError(result.error || '업로드 실패')
        }
      } catch (err: any) {
        setError(err?.message || '파일 업로드 중 오류')
      }
    }

    setUploading(false)
    e.target.value = ''
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

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
      const imageUrls = isMaterials ? attachments.map((a) => a.url) : undefined
      const result = await updatePost(
        postId,
        title,
        content,
        userId,
        boardType as BoardType,
        imageUrls
      )

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
            {initialBoardType === 'notice' && <SelectItem value="notice">공지사항</SelectItem>}
            <SelectItem value="bamboo">원장님 대나무숲</SelectItem>
            <SelectItem value="materials">공유자료실</SelectItem>
            <SelectItem value="job">구인/구직</SelectItem>
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

      {/* 공유자료실: 첨부파일 */}
      {isMaterials && (
        <div>
          <Label>첨부 파일</Label>
          <p className="text-xs text-muted-foreground mt-1 mb-2">
            이미지(jpg, png, gif, webp), 문서(pdf, pptx, docx, xlsx, hwp)
          </p>
          <div className="flex flex-wrap gap-2 items-center mt-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.pptx,.docx,.xlsx,.hwp"
              multiple
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="gap-2"
            >
              {uploading ? '업로드 중...' : (
                <>
                  <FileStack className="w-4 h-4" />
                  파일 추가
                </>
              )}
            </Button>
            {attachments.length > 0 && (
              <ul className="flex flex-wrap gap-2 mt-2">
                {attachments.map((att, i) => (
                  <li
                    key={`${att.url}-${i}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-sm"
                  >
                    {isImageFile(att.name) ? (
                      <Image className="w-4 h-4 text-blue-500 shrink-0" />
                    ) : (
                      <FileStack className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                    <span className="truncate max-w-[160px]" title={att.name}>
                      {att.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(i)}
                      className="p-0.5 hover:bg-slate-200 rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

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
