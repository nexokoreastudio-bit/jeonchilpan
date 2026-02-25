'use client'

import { useRouter } from 'next/navigation'
import { useState, FormEvent } from 'react'
import { Search } from 'lucide-react'

export function SearchInput() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 w-full">
      <div className="relative w-full flex">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="search"
          placeholder="검색어를 입력해 주세요."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 h-11 sm:h-9 pl-10 pr-4 border border-slate-200 rounded-l-md text-base sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00c4b4]/30 focus:border-[#00c4b4]"
        />
        <button
          type="submit"
          className="h-11 sm:h-9 px-4 bg-slate-600 text-white text-sm font-medium rounded-r-md hover:bg-slate-700 transition-colors shrink-0 flex items-center justify-center min-w-[44px] sm:min-w-0"
        >
          검색
        </button>
      </div>
    </form>
  )
}
