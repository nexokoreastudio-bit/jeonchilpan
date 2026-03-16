'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, ExternalLink, Trash2, Star, StarOff, AlertCircle, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'

interface CrawledNewsItem {
  has_insight?: boolean
  insight_id?: number | null
  insight_title?: string | null
  insight_is_published?: boolean
  id: number
  title: string
  url: string
  source: string
  category: '입시' | '학업' | '취업' | '교육정책' | '기타'
  summary?: string
  thumbnail_url?: string
  published_at?: string
  crawled_at: string
  is_featured: boolean
  view_count: number
}

interface NewsSource {
  id: number
  name: string
  base_url: string
  rss_url?: string
  is_active: boolean
  last_crawled_at?: string
}

export default function CrawledNewsAdminPage() {
  const router = useRouter()
  const [news, setNews] = useState<CrawledNewsItem[]>([])
  const [sources, setSources] = useState<NewsSource[]>([])
  const [loading, setLoading] = useState(true)
  const [crawling, setCrawling] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('전체')
  const [selectedSource, setSelectedSource] = useState<string>('전체')
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [generatingInsight, setGeneratingInsight] = useState<number | null>(null)

  useEffect(() => {
    checkAuth()
    fetchNews()
    fetchSources()
  }, [selectedCategory, selectedSource])

  const checkAuth = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setIsAuthenticated(false)
        setIsAdmin(false)
        return
      }

      setIsAuthenticated(true)
      
      // 관리자 권한 확인
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      const profileData = profile as { role?: string } | null
      setIsAdmin(profileData?.role === 'admin')
    } catch (error) {
      console.error('인증 확인 실패:', error)
      setIsAuthenticated(false)
      setIsAdmin(false)
    }
  }

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
      params.append('limit', '50')

      const response = await fetch(`/api/crawl-news?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setNews(data.data || [])
      }
    } catch (error) {
      console.error('뉴스 가져오기 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSources = async () => {
    // 뉴스 소스는 별도 API가 필요하지만, 여기서는 간단히 처리
    // 실제로는 /api/news-sources 같은 엔드포인트 필요
  }

  const handleCrawl = async (sourceId?: number) => {
    try {
      setCrawling(true)
      const response = await fetch('/api/crawl-news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 쿠키 포함
        body: JSON.stringify({ sourceId }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          alert('로그인이 필요합니다. 관리자 계정으로 로그인해주세요.\n\n로그인 페이지로 이동합니다.')
          window.location.href = '/login?returnUrl=/admin/crawled-news'
          return
        }
        if (response.status === 403) {
          alert('관리자 권한이 필요합니다. 관리자 계정으로 로그인해주세요.')
          return
        }
        throw new Error(data.error || `크롤링 실패: ${response.status}`)
      }

      if (data.success) {
        alert(`크롤링 완료: ${data.saved}개의 새로운 기사를 저장했습니다.\n\n총 ${data.total}개의 기사를 확인했고, ${data.saved}개의 새로운 기사를 추가했습니다.`)
        fetchNews()
      } else {
        alert(`크롤링 실패: ${data.error || '알 수 없는 오류'}`)
      }
    } catch (error: any) {
      console.error('크롤링 실패:', error)
      alert(`크롤링 중 오류가 발생했습니다: ${error?.message || '알 수 없는 오류'}\n\n브라우저 콘솔을 확인해주세요.`)
    } finally {
      setCrawling(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('이 기사를 삭제하시겠습니까?')) {
      return
    }

    try {
      // 삭제 API 호출 (구현 필요)
      // const response = await fetch(`/api/crawl-news/${id}`, { method: 'DELETE' })
      alert('삭제 기능은 아직 구현되지 않았습니다.')
    } catch (error) {
      console.error('삭제 실패:', error)
    }
  }

  const handleToggleFeatured = async (id: number, currentValue: boolean) => {
    try {
      // 피처드 토글 API 호출 (구현 필요)
      // const response = await fetch(`/api/crawl-news/${id}/featured`, {
      //   method: 'PATCH',
      //   body: JSON.stringify({ is_featured: !currentValue })
      // })
      alert('피처드 설정 기능은 아직 구현되지 않았습니다.')
    } catch (error) {
      console.error('피처드 설정 실패:', error)
    }
  }

  const handleCreateInsight = async (newsItem: CrawledNewsItem) => {
    if (!confirm(`"${newsItem.title}" 기사로 인사이트를 생성하시겠습니까?\n\nAI 분석에 시간이 걸릴 수 있습니다 (최대 30초).`)) {
      return
    }

    try {
      setGeneratingInsight(newsItem.id)
      
      const response = await fetch('/api/admin/insights/create-from-news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          url: newsItem.url,
          title: newsItem.title,
          category: mapNewsCategoryToInsightCategory(newsItem.category),
          published_at: newsItem.published_at, // 발행 날짜 전달
        }),
      })

      const data = await response.json()
      console.log('인사이트 생성 응답:', data)

      if (!response.ok) {
        if (response.status === 401) {
          alert('로그인이 필요합니다.')
          return
        }
        if (response.status === 403) {
          alert('관리자 권한이 필요합니다.')
          return
        }
        throw new Error(data.error || '인사이트 생성 실패')
      }

      if (data.error) {
        if (data.existingInsight) {
          alert(`이미 등록된 인사이트입니다.\n\n제목: ${data.existingInsight.title}\nID: ${data.existingInsight.id}\n\n인사이트 관리 페이지로 이동하시겠습니까?`)
          if (confirm('인사이트 관리 페이지로 이동하시겠습니까?')) {
            router.push(`/admin/insights`)
            router.refresh()
          }
        } else {
          alert(`인사이트 생성 실패: ${data.error}`)
        }
      } else if (data.success && data.id) {
        alert(`인사이트가 성공적으로 생성되었습니다!\n\n제목: ${data.title}\nID: ${data.id}\n\n인사이트 관리 페이지로 이동하시겠습니까?`)
        // 목록 새로고침하여 인사이트 상태 업데이트
        fetchNews()
        if (confirm('인사이트 관리 페이지로 이동하시겠습니까?')) {
          router.push(`/admin/insights`)
          router.refresh()
        }
      } else {
        console.error('예상치 못한 응답 형식:', data)
        alert(`인사이트 생성 응답을 처리할 수 없습니다.\n\n응답: ${JSON.stringify(data)}\n\n콘솔을 확인해주세요.`)
      }
    } catch (error: any) {
      console.error('인사이트 생성 실패:', error)
      alert(`인사이트 생성 중 오류가 발생했습니다: ${error?.message || '알 수 없는 오류'}\n\n콘솔을 확인해주세요.`)
    } finally {
      setGeneratingInsight(null)
    }
  }

  const mapNewsCategoryToInsightCategory = (category: string): '입시' | '정책' | '학습법' | '상담팁' | '기타' => {
    switch (category) {
      case '입시':
        return '입시'
      case '교육정책':
        return '정책'
      case '학업':
        return '학습법'
      case '취업':
        return '상담팁'
      default:
        return '기타'
    }
  }

  const categories = ['전체', '입시', '학업', '취업', '교육정책', '기타']
  const uniqueSources = Array.from(new Set(news.map(item => item.source)))

  // 인증되지 않았거나 관리자가 아닌 경우
  if (isAuthenticated === false) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
            <h2 className="text-xl font-bold text-yellow-800">로그인이 필요합니다</h2>
          </div>
          <p className="text-yellow-700 mb-4">크롤링 기능을 사용하려면 관리자 계정으로 로그인해주세요.</p>
          <Button
            onClick={() => router.push('/login?returnUrl=/admin/crawled-news')}
            className="bg-nexo-navy hover:bg-nexo-navy/90"
          >
            로그인 페이지로 이동
          </Button>
        </div>
      </div>
    )
  }

  if (isAuthenticated === true && !isAdmin) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-bold text-red-800">관리자 권한이 필요합니다</h2>
          </div>
          <p className="text-red-700 mb-4">이 페이지는 관리자만 접근할 수 있습니다.</p>
          <Button
            onClick={() => router.push('/')}
            variant="outline"
          >
            메인 페이지로 이동
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">크롤링된 교육 뉴스 관리</h1>
        <p className="text-gray-600">매일 수집되는 교육 관련 뉴스를 관리합니다.</p>
      </div>

      {/* 액션 버튼 */}
      <div className="mb-6 flex gap-4">
        <Button
          onClick={() => handleCrawl()}
          disabled={crawling}
          className="bg-nexo-navy hover:bg-nexo-navy/90"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${crawling ? 'animate-spin' : ''}`} />
          {crawling ? '크롤링 중...' : '전체 크롤링 시작'}
        </Button>
      </div>

      {/* 필터 */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <div className="flex gap-2">
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

        <select
          value={selectedSource}
          onChange={(e) => setSelectedSource(e.target.value)}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 border border-gray-300"
        >
          <option value="전체">전체 신문사</option>
          {uniqueSources.map((source) => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
        </select>
      </div>

      {/* 통계 */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">전체 기사</div>
          <div className="text-2xl font-bold">{news.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">피처드</div>
          <div className="text-2xl font-bold">{news.filter(n => n.is_featured).length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">오늘 크롤링</div>
          <div className="text-2xl font-bold">
            {news.filter(n => {
              const crawledDate = new Date(n.crawled_at)
              const today = new Date()
              return crawledDate.toDateString() === today.toDateString()
            }).length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">총 조회수</div>
          <div className="text-2xl font-bold">
            {news.reduce((sum, n) => sum + n.view_count, 0)}
          </div>
        </div>
      </div>

      {/* 뉴스 목록 */}
      {loading ? (
        <div className="text-center py-20">
          <p className="text-gray-500">로딩 중...</p>
        </div>
      ) : news.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500">크롤링된 뉴스가 없습니다.</p>
          <Button onClick={() => handleCrawl()} className="mt-4">
            크롤링 시작
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {news.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        item.category === '입시'
                          ? 'border-blue-300 text-blue-800'
                          : item.category === '학업'
                          ? 'border-green-300 text-green-800'
                          : item.category === '취업'
                          ? 'border-purple-300 text-purple-800'
                          : 'border-gray-300 text-gray-800'
                      }`}
                    >
                      {item.category}
                    </Badge>
                    <span className="text-sm text-gray-500">{item.source}</span>
                    {item.is_featured && (
                      <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-800">
                        ⭐ 피처드
                      </Badge>
                    )}
                    {item.has_insight && (
                      <Badge variant="outline" className="text-xs border-green-300 text-green-800">
                        ✨ 인사이트 생성됨
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  {item.summary && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.summary}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>
                      크롤링: {format(new Date(item.crawled_at), 'yyyy.MM.dd HH:mm', { locale: ko })}
                    </span>
                    {item.published_at && (
                      <span>
                        발행: {format(new Date(item.published_at), 'yyyy.MM.dd', { locale: ko })}
                      </span>
                    )}
                    <span>조회: {item.view_count}</span>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-nexo-navy hover:underline"
                    >
                      원문 보기
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
                <div className="flex gap-2">
                  {item.has_insight ? (
                    <button
                      onClick={() => {
                        if (item.insight_id) {
                          router.push(`/admin/insights`)
                        }
                      }}
                      className="p-2 hover:bg-green-50 rounded text-green-600"
                      title={`인사이트 보기 (ID: ${item.insight_id})`}
                    >
                      <Sparkles className="w-5 h-5 fill-green-600" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCreateInsight(item)}
                      disabled={generatingInsight === item.id}
                      className="p-2 hover:bg-blue-50 rounded text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="인사이트 생성"
                    >
                      {generatingInsight === item.id ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Sparkles className="w-5 h-5" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => handleToggleFeatured(item.id, item.is_featured)}
                    className="p-2 hover:bg-gray-100 rounded"
                    title={item.is_featured ? '피처드 해제' : '피처드 설정'}
                  >
                    {item.is_featured ? (
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    ) : (
                      <StarOff className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 hover:bg-red-50 rounded text-red-600"
                    title="삭제"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
