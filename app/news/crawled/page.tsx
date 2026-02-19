'use client'

import Link from 'next/link'
import { CrawledNewsSection } from '@/components/news/crawled-news-section'
import { ArrowLeft } from 'lucide-react'

export default function CrawledNewsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-nexo-navy mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          홈으로 돌아가기
        </Link>
      </div>
      <CrawledNewsSection limit={100} showMoreButton={false} />
    </div>
  )
}
