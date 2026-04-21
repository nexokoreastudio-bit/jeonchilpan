'use client'

import { useState } from 'react'
import { togglePinPost } from '@/app/actions/posts'
import { Pin } from 'lucide-react'

interface PinButtonProps {
  postId: number
  isPinned: boolean
  isAdmin: boolean
}

export function PinButton({ postId, isPinned, isAdmin }: PinButtonProps) {
  const [pinned, setPinned] = useState(isPinned)
  const [loading, setLoading] = useState(false)

  if (!isAdmin) {
    if (!pinned) return null
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded">
        <Pin className="w-3 h-3" />
        고정
      </span>
    )
  }

  const handleToggle = async () => {
    setLoading(true)
    const result = await togglePinPost(postId)
    if (result.success) {
      setPinned(result.pinned ?? false)
    } else {
      alert(result.error)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold rounded border transition-colors ${
        pinned
          ? 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100'
          : 'text-slate-400 bg-slate-50 border-slate-200 hover:text-amber-600 hover:border-amber-200'
      } disabled:opacity-50`}
      title={pinned ? '고정 해제' : '게시글 고정'}
    >
      <Pin className="w-3 h-3" />
      {pinned ? '고정' : '고정하기'}
    </button>
  )
}
