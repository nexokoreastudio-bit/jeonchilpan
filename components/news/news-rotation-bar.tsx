'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Newspaper, ExternalLink } from 'lucide-react'
import type { PortalEducationNews } from '@/lib/supabase/portal'

interface NewsRotationBarProps {
  items: PortalEducationNews[]
  intervalMs?: number
}

export function NewsRotationBar({ items, intervalMs = 4500 }: NewsRotationBarProps) {
  const newsItems = useMemo(() => items.filter((item) => item?.title && item?.url), [items])
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (newsItems.length <= 1) return
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % newsItems.length)
    }, intervalMs)
    return () => window.clearInterval(timer)
  }, [newsItems.length, intervalMs])

  if (newsItems.length === 0) return null

  const current = newsItems[activeIndex]

  return (
    <section className="bg-white border border-gray-200/80 overflow-hidden rounded-lg shadow-sm">
      <div className="flex items-center gap-3 px-4 py-2.5">
        <span className="inline-flex items-center gap-1.5 shrink-0 rounded-full bg-[#00c4b4]/10 px-2 py-1 text-[11px] font-semibold text-[#00897f]">
          <Newspaper className="w-3.5 h-3.5" />
          오늘의 뉴스
        </span>
        <a
          href={current.url}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-0 flex-1 text-sm text-slate-700 hover:text-[#00897f] transition-colors line-clamp-1"
          title={current.title}
        >
          {current.title}
        </a>
        <Link
          href="/news/crawled"
          className="shrink-0 text-xs font-medium text-[#00a396] hover:text-[#00897f] transition-colors whitespace-nowrap"
        >
          기사 전체 보기
        </Link>
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-400">{current.source}</span>
          <a
            href={current.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-slate-400 hover:text-[#00a396] transition-colors"
            aria-label="뉴스 원문 보기"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  )
}
