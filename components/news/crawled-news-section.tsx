'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ExternalLink, Calendar, Newspaper, MessageSquare } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
}

export function CrawledNewsSection({ limit = 12, showMoreButton = true }: CrawledNewsSectionProps) {
  const router = useRouter()
  const [news, setNews] = useState<CrawledNewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<'전체' | '입시' | '학업' | '취업' | '교육정책'>('전체')
  const [selectedSource, setSelectedSource] = useState<string>('전체')
  const [sources, setSources] = useState<string[]>([])

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
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center py-20">
            <p className="text-gray-500">뉴스를 불러오는 중...</p>
          </div>
        </div>
      </section>
    )
  }

  if (news.length === 0) {
    return null // 뉴스가 없으면 섹션을 표시하지 않음
  }

  return (
    <section className="py-20 bg-white border-b border-gray-200">
      <div className="container mx-auto max-w-7xl px-4">
        {/* 헤더 */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                📰 오늘의 교육 뉴스
              </h2>
              <p className="text-gray-600 text-lg">매일 업데이트되는 교육 관련 기사</p>
            </div>
          </div>

          {/* 법적 안내 문구 */}
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-600 leading-relaxed">
              <strong>안내:</strong> 본 뉴스는 각 언론사에서 제공하는 RSS 피드를 통해 수집되었으며, 
              원문은 각 언론사 사이트에서 확인하실 수 있습니다. 
              본 서비스는 뉴스 링크를 제공하는 역할만 하며, 뉴스 콘텐츠의 저작권은 각 언론사에 있습니다.
            </p>
          </div>

          {/* 필터 */}
          <div className="flex flex-wrap gap-3 mb-6">
            {/* 카테고리 필터 */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-nexo-navy text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* 신문사 필터 */}
            {sources.length > 0 && (
              <div className="flex gap-2 flex-wrap ml-auto">
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-nexo-navy"
                >
                  <option value="전체">전체 신문사</option>
                  {sources.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* 뉴스 리스트형 레이아웃 */}
        <div className="space-y-0">
          {news.map((item, index) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <article className="bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200 py-5 px-4">
                <div className="flex items-start gap-4">
                  {/* 카테고리 뱃지 */}
                  <div className="flex-shrink-0 pt-1">
                    <Badge
                      variant="outline"
                      className={`text-xs px-2 py-1 border rounded ${getCategoryColor(item.category)}`}
                    >
                      {item.category}
                    </Badge>
                  </div>

                  {/* 내용 영역 */}
                  <div className="flex-1 min-w-0">
                    {/* 제목 */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-nexo-navy transition-colors leading-snug line-clamp-2">
                      {item.title.replace(/<[^>]*>/g, '').trim()}
                    </h3>

                    {/* 요약 */}
                    {item.summary && (
                      <p className="text-sm text-gray-600 mb-3 leading-relaxed line-clamp-2">
                        {item.summary.replace(/<[^>]*>/g, '').trim()}
                      </p>
                    )}

                    {/* 메타 정보 */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs font-medium text-gray-700">{item.source}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {formatDate(item.published_at || item.crawled_at)}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          router.push(`/community/write?newsId=${item.id}&type=news_discussion`)
                        }}
                        className="text-xs text-nexo-navy hover:text-nexo-navy/80 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        토론하기
                      </button>
                    </div>
                  </div>

                  {/* 외부 링크 아이콘 */}
                  <div className="flex-shrink-0 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </article>
            </a>
          ))}
        </div>

        {/* 더 보기 버튼 (선택사항) */}
        {showMoreButton && news.length >= 12 && (
          <div className="mt-12 text-center">
            <Button
              variant="outline"
              className="border-nexo-navy text-nexo-navy hover:bg-nexo-navy hover:text-white rounded-none"
              onClick={() => {
                // 더 많은 뉴스 로드 또는 별도 페이지로 이동
                window.location.href = '/news/crawled'
              }}
            >
              더 많은 뉴스 보기
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}

