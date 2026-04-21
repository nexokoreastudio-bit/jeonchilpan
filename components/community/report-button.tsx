'use client'

import { useState } from 'react'
import { reportPost } from '@/app/actions/posts'
import { AlertTriangle } from 'lucide-react'

interface ReportButtonProps {
  postId: number
  userId?: string | null
}

const REPORT_REASONS = [
  '스팸/광고',
  '욕설/비하',
  '부적절한 콘텐츠',
  '개인정보 노출',
  '기타',
]

export function ReportButton({ postId, userId }: ReportButtonProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!userId) return null

  const handleSubmit = async () => {
    const finalReason = reason === '기타' ? customReason.trim() : reason
    if (!finalReason) return

    setSubmitting(true)
    const result = await reportPost(postId, finalReason)
    setSubmitting(false)

    if (result.success) {
      alert('신고가 접수되었습니다.')
      setOpen(false)
      setReason('')
      setCustomReason('')
    } else {
      alert(result.error || '신고에 실패했습니다.')
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors"
        title="신고"
      >
        <AlertTriangle className="w-3.5 h-3.5" />
        <span>신고</span>
      </button>
    )
  }

  return (
    <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-md space-y-2">
      <p className="text-xs font-medium text-red-700">신고 사유 선택</p>
      <div className="flex flex-wrap gap-1.5">
        {REPORT_REASONS.map((r) => (
          <button
            key={r}
            onClick={() => setReason(r)}
            className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
              reason === r
                ? 'bg-red-100 border-red-300 text-red-700 font-medium'
                : 'bg-white border-slate-200 text-slate-600 hover:border-red-200'
            }`}
          >
            {r}
          </button>
        ))}
      </div>
      {reason === '기타' && (
        <input
          type="text"
          value={customReason}
          onChange={(e) => setCustomReason(e.target.value)}
          placeholder="사유를 입력해주세요"
          className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md"
        />
      )}
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={submitting || (!reason || (reason === '기타' && !customReason.trim()))}
          className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          {submitting ? '접수 중...' : '신고 접수'}
        </button>
        <button
          onClick={() => { setOpen(false); setReason(''); setCustomReason('') }}
          className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
        >
          취소
        </button>
      </div>
    </div>
  )
}
