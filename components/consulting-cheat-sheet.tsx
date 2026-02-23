'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Copy, Check, FileText, ArrowRight } from 'lucide-react'

type Insight = {
  id: number
  title: string
  summary: string | null
  edition_id: string | null
  category: '입시' | '정책' | '학습법' | '상담팁' | '기타' | null
}

interface ConsultingCheatSheetProps {
  insights: Insight[]
}

export function ConsultingCheatSheet({ insights }: ConsultingCheatSheetProps) {
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const handleCopy = async (text: string, id: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1500)
    } catch {
      // fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1500)
    }
  }

  if (insights.length === 0) {
    return null
  }

  return (
    <section className="bg-white border border-gray-200/80 overflow-hidden rounded-lg shadow-sm">
      <div className="border-b border-gray-100 bg-slate-50/50 px-5 py-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              오늘의 상담 컨닝페이퍼
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              학부모 상담 전 꼭 보세요. 핵심 멘트와 요약을 한 번에 복사할 수 있어요.
            </p>
          </div>
          <Link
            href="/news"
            className="hidden md:flex items-center gap-2 text-sm font-medium text-[#00c4b4] hover:text-[#00a396] transition-colors shrink-0"
          >
            전체 보기 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
      <div className="container mx-auto max-w-6xl px-5 py-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {insights.slice(0, 6).map((insight) => {
            const coreMent = insight.title
            const summary = insight.summary || ''
            const editionId = insight.edition_id || `${insight.id}`

            return (
              <article
                key={insight.id}
                className="bg-slate-50/50 border border-gray-100 p-5 rounded-lg hover:border-[#00c4b4]/30 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-xs font-medium text-[#00c4b4] bg-[#00c4b4]/10 px-2 py-1 rounded-sm">
                    상담팁
                  </span>
                  <Link
                    href={`/news/${editionId}`}
                    className="text-slate-400 hover:text-[#00c4b4] p-1"
                    aria-label="상세 보기"
                  >
                    <FileText className="w-4 h-4" />
                  </Link>
                </div>

                <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-3 line-clamp-2">
                  {coreMent}
                </h3>

                {summary && (
                  <p className="text-sm md:text-base text-slate-600 line-clamp-3 mb-4">
                    {summary}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(coreMent, insight.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    {copiedId === insight.id ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    <span>핵심 멘트 복사</span>
                  </button>
                  {summary && (
                    <button
                      type="button"
                      onClick={() => handleCopy(summary, insight.id + 10000)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      {copiedId === insight.id + 10000 ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      <span>요약 복사</span>
                    </button>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
