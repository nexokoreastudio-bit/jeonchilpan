'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createMaterial } from '@/app/actions/marketplace'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface MaterialUploadFormProps {
  userId: string
}

const SUBJECT_OPTIONS = ['국어', '수학', '영어', '과학', '사회', '기타']

export function MaterialUploadForm({ userId }: MaterialUploadFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [subjectCategory, setSubjectCategory] = useState('')
  const [price, setPrice] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!title.trim() || !fileUrl.trim()) {
      setError('제목과 파일 링크를 입력해주세요.')
      setLoading(false)
      return
    }

    if (price < 0) {
      setError('가격은 0 이상이어야 합니다.')
      setLoading(false)
      return
    }

    const result = await createMaterial({
      userId,
      title: title.trim(),
      description: description.trim() || null,
      fileUrl: fileUrl.trim(),
      subjectCategory: subjectCategory || null,
      price,
    })
    setLoading(false)

    if (result.success && result.materialId) {
      router.push(`/marketplace/${result.materialId}`)
      router.refresh()
    } else {
      setError(result.error || '등록에 실패했습니다.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          제목 *
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 2024 수능 국어 비문학 분석 자료"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00c4b4] focus:border-[#00c4b4]"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          설명
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="자료에 대한 설명을 입력해주세요."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00c4b4] focus:border-[#00c4b4]"
        />
      </div>

      <div>
        <label htmlFor="fileUrl" className="block text-sm font-medium text-gray-700 mb-1">
          파일 링크 *
        </label>
        <input
          id="fileUrl"
          type="url"
          value={fileUrl}
          onChange={(e) => setFileUrl(e.target.value)}
          placeholder="https://drive.google.com/... 또는 다운로드 가능한 URL"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00c4b4] focus:border-[#00c4b4]"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          구글 드라이브, 네이버 클라우드 등에 업로드한 뒤 공유 링크를 입력해주세요.
        </p>
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
          과목/분류
        </label>
        <select
          id="subject"
          value={subjectCategory}
          onChange={(e) => setSubjectCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00c4b4] focus:border-[#00c4b4]"
        >
          <option value="">선택 안 함</option>
          {SUBJECT_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
          가격 (포인트)
        </label>
        <input
          id="price"
          type="number"
          min={0}
          value={price}
          onChange={(e) => setPrice(parseInt(e.target.value, 10) || 0)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00c4b4] focus:border-[#00c4b4]"
        />
        <p className="text-xs text-gray-500 mt-1">0이면 무료 자료입니다.</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-4">
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4" />
          취소
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-lg bg-[#00c4b4] text-white font-semibold hover:bg-[#00a396] disabled:opacity-60"
        >
          {loading ? '등록 중...' : '등록하기'}
        </button>
      </div>
    </form>
  )
}
