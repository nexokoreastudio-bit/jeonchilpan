'use client'

import { useState, useEffect } from 'react'
import { SafeImage } from '@/components/safe-image'
import { ExternalLink, MessageSquare, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useRouter } from 'next/navigation'

interface CrawledNewsItem {
  id: number
  title: string
  url: string
  source: string
  category: '입시' | '학업' | '취업' | '교육정책' | '기타'
  summary?: string
  thumbnail_url?: string
  published_at?: string
  crawled_at: string
  view_count: number
}

const categories: Array<'전체' | '입시' | '학업' | '취업' | '교육정책'> = ['전체', '입시', '학업', '취업', '교육정책']

interface CrawledNewsSectionProps {
  limit?: number
  showMoreButton?: boolean
  /** 박스 내부 임베드 스타일 (코인판 스타일) */
  embedded?: boolean
}

export function CrawledNewsSection({ limit = 12, showMoreButton = true, embedded = false }: CrawledNewsSectionProps) {
  const router = useRouter()
  const [news, setNews] = useState<CrawledNewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<'전체' | '입시' | '학업' | '취업' | '교육정책'>('전체')
  const [selectedSource, setSelectedSource] = useState<string>('전체')
  const [sources, setSources] = useState<string[]>([])
  const [showNotice, setShowNotice] = useState(false)

  useEffect(() => {
    fetchNews()
  }, [selectedCategory, selectedSource])

  const fetchNews = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedCategory !== '전체') {
        params.append('category', selectedCategory)
      }
      if (selectedSource !== '전체') {
        params.append('source', selectedSource)
      }
      params.append('limit', String(limit))

      const response = await fetch(`/api/crawl-news?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setNews(data.data || [])
        // 소스 목록 추출
        const uniqueSources = Array.from(new Set(data.data?.map((item: CrawledNewsItem) => item.source) || [])) as string[]
        setSources(uniqueSources)
      }
    } catch (error) {
      console.error('뉴스 가져오기 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffHours / 24)

      if (diffHours < 1) {
        return '방금 전'
      } else if (diffHours < 24) {
        return `${diffHours}시간 전`
      } else if (diffDays < 7) {
        return `${diffDays}일 전`
      } else {
        return format(date, 'yyyy.MM.dd', { locale: ko })
      }
    } catch {
      return ''
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '입시':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case '학업':
        return 'bg-green-100 text-green-800 border-green-300'
      case '취업':
        return 'bg-purple-100 text-purple-800 border-purple-300'
      case '교육정책':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  if (loading && news.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto max-w-4xl px-4">
          <p className="text-center text-gray-500 py-12">뉴스를 불러오는 중...</p>
        </div>
      </section>
    )
  }

  if (news.length === 0) {
    return null // 뉴스가 없으면 섹션을 표시하지 않음
  }

  const isCompact = limit <= 3

  return (
    <div className={embedded ? '' : (isCompact ? 'py-10 md:py-12' : 'py-16 md:py-20')}>
      <div className={`container mx-auto max-w-4xl px-4 ${embedded ? 'pt-6 pb-4 md:pt-8 md:pb-5' : ''}`}>
        <div className={isCompact || embedded ? 'mb-4' : 'mb-8'}>
          <div className={embedded ? 'border-b border-gray-100 pb-6' : ''}>
            <div>
              {!embedded && (
                <span className="inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#00c4b4] bg-[#00c4b4]/10 rounded-sm mb-2">
                  실시간 큐레이션
                </span>
              )}
              <h2 className={`font-bold text-slate-800 tracking-tight ${embedded ? 'text-base' : (isCompact ? 'text-xl md:text-2xl' : 'text-2xl md:text-3xl')}`}>
                오늘 입시·교육계, 무슨 일이?
              </h2>
              <p className={`text-slate-500 mt-1 ${embedded ? 'text-sm' : (isCompact ? 'text-sm' : 'text-base')}`}>
                지금 막 나온 교육 뉴스 3선. 학원장님들이 꼭 알아야 할 소식만 골라봤어요.
              </p>
            </div>

            {/* 안내: 접을 수 있게 */}
          </div>
          <div className="mt-6">
            <button
              onClick={() => setShowNotice(!showNotice)}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              {showNotice ? '▲' : '▼'} 이용 안내
            </button>
            {showNotice && (
              <div className="mt-2 p-4 bg-white rounded-sm border border-gray-200">
                <p className="text-xs text-gray-600 leading-relaxed">
                  본 뉴스는 각 언론사 RSS 피드로 수집됩니다. 원문은 각 언론사 사이트에서 확인하실 수 있으며, 
                  본 서비스는 링크 제공 역할만 합니다. 저작권은 각 언론사에 있습니다.
                </p>
              </div>
            )}
          </div>

          {/* 필터: 뉴스 목록 직전 배치 */}
          <div className="flex flex-wrap gap-3 items-center mt-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 whitespace-nowrap">분류</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as typeof selectedCategory)}
                className="px-3 py-2 rounded-lg text-sm bg-white border border-gray-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00c4b4]/30 focus:border-[#00c4b4] min-w-[120px]"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            {sources.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 whitespace-nowrap">신문사</span>
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="px-3 py-2 rounded-lg text-sm bg-white border border-gray-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00c4b4]/30 focus:border-[#00c4b4] min-w-[140px]"
                >
                  <option value="전체">전체</option>
                  {sources.map((source) => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* 기사 목록: 3개 이하면 컴팩트, 그 외는 카드형 */}
        <div className={isCompact ? 'space-y-1' : 'space-y-2'}>
          {news.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <article className={`bg-white border border-gray-100 hover:border-[#00c4b4]/30 hover:shadow-sm transition-all duration-200 ${
                isCompact ? 'rounded-lg py-6 px-4 md:py-7 md:px-5' : 'rounded-xl py-7 px-5 md:py-8 md:px-6'
              }`}>
                <div className={`flex gap-3 ${isCompact ? 'gap-3' : 'gap-4'}`}>
                  {/* 썸네일: 컴팩트 모드에서는 숨김 */}
                  {item.thumbnail_url && !isCompact && (
                    <div className="relative flex-shrink-0 w-24 h-24 md:w-28 md:h-28 rounded-lg overflow-hidden bg-gray-100">
                      <SafeImage
                        src={item.thumbnail_url}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    {/* 카테고리 + 메타: 한 줄에 */}
                    <div className={`flex items-center gap-2 flex-wrap ${isCompact ? 'mb-1' : 'mb-2'}`}>
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${getCategoryColor(item.category)}`}>
                        {item.category}
                      </span>
                      <span className="text-xs text-gray-400">
                        {item.source} · {formatDate(item.published_at || item.crawled_at)}
                      </span>
                    </div>

                    {/* 제목: 컴팩트는 1줄, 일반은 2줄 */}
                    <h3 className={`font-semibold text-gray-900 group-hover:text-[#00c4b4] transition-colors leading-snug ${
                      isCompact
                        ? 'text-sm md:text-base line-clamp-1'
                        : 'text-base md:text-lg mb-2 line-clamp-2'
                    }`}>
                      {item.title.replace(/<[^>]*>/g, '').trim()}
                    </h3>

                    {/* 요약: 컴팩트에서는 1줄만 */}
                    {item.summary && (
                      <p className={`text-gray-600 leading-relaxed ${isCompact ? 'text-xs line-clamp-1' : 'text-sm line-clamp-2 mb-3'}`}>
                        {item.summary.replace(/<[^>]*>/g, '').trim()}
                      </p>
                    )}

                    {!isCompact && (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#00c4b4] font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        기사 읽기
                        <ExternalLink className="w-3.5 h-3.5" />
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          router.push(`/community/write?newsId=${item.id}&type=news_discussion`)
                        }}
                        className="text-xs text-gray-400 hover:text-[#00c4b4] font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        토론하기
                      </button>
                    </div>
                    )}
                  </div>
                </div>
              </article>
            </a>
          ))}
        </div>

        {/* 전체 보기 링크 */}
        {showMoreButton && news.length >= limit && (
          <div className={isCompact ? 'mt-5 text-center' : 'mt-8 text-center'}>
            <a
              href="/news/crawled"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#00c4b4] transition-colors"
            >
              전체 뉴스 보기
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

