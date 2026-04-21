'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'

export function CommunitySearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [isPending, startTransition] = useTransition()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const board = searchParams.get('board')
    const params = new URLSearchParams()
    if (board) params.set('board', board)
    if (query.trim()) params.set('q', query.trim())
    startTransition(() => {
      router.push(`/community${params.toString() ? `?${params}` : ''}`)
    })
  }

  return (
    <form onSubmit={handleSearch} className="flex items-center gap-2 mb-4">
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="게시글 검색..."
          className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00c4b4] focus:border-[#00c4b4]"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="px-3 py-2 text-sm font-medium bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors disabled:opacity-50"
      >
        검색
      </button>
      {searchParams.get('q') && (
        <button
          type="button"
          onClick={() => {
            setQuery('')
            const board = searchParams.get('board')
            router.push(board ? `/community?board=${board}` : '/community')
          }}
          className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700"
        >
          초기화
        </button>
      )}
    </form>
  )
}
