'use client'

import { useEffect, useState } from 'react'
import { toggleInsightPublish, bulkPublishInsightsByDate } from '@/lib/actions/insights'
import { Database } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { InsightEditForm } from './insight-edit-form'
import { Calendar, Eye, EyeOff, CheckCircle2, ChevronDown, ChevronUp, FileText } from 'lucide-react'
import { format } from 'date-fns/format'
import { ko } from 'date-fns/locale'
import { EditionInfo } from '@/lib/supabase/articles'
import { sanitizeHtml } from '@/lib/utils/sanitize'

type InsightRow = Database['public']['Tables']['insights']['Row']

interface InsightListProps {
  editions: EditionInfo[]
}

// 날짜별로 그룹화
function groupInsightsByDate(insights: InsightRow[]) {
  const groups: { [key: string]: InsightRow[] } = {}
  
  insights.forEach(insight => {
    let dateKey = '미정'
    
    if (insight.published_at) {
      const date = new Date(insight.published_at)
      dateKey = format(date, 'yyyy-MM-dd', { locale: ko })
    } else if (!insight.is_published) {
      dateKey = '발행 대기'
    } else {
      dateKey = '즉시 발행됨'
    }
    
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(insight)
  })
  
  // 날짜 순으로 정렬 (미래 날짜가 앞에 오도록)
  return Object.entries(groups).sort(([a], [b]) => {
    if (a === '미정' || a === '발행 대기' || a === '즉시 발행됨') return 1
    if (b === '미정' || b === '발행 대기' || b === '즉시 발행됨') return -1
    return b.localeCompare(a) // 내림차순
  })
}

export function InsightList({ editions }: InsightListProps) {
  const [insights, setInsights] = useState<InsightRow[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [bulkPublishing, setBulkPublishing] = useState<string | null>(null)
  const [expandedInsightId, setExpandedInsightId] = useState<number | null>(null)

  useEffect(() => {
    fetchInsights()
  }, [])

  const fetchInsights = async () => {
    try {
      const response = await fetch('/api/admin/insights')
      if (response.ok) {
        const data = await response.json()
        setInsights(data)
      }
    } catch (error) {
      console.error('인사이트 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePublish = async (id: number, currentStatus: boolean) => {
    const result = await toggleInsightPublish(id, !currentStatus)
    if (!result.error) {
      fetchInsights()
    }
  }

  const handleBulkPublish = async (date: string, publish: boolean) => {
    setBulkPublishing(date)
    try {
      const result = await bulkPublishInsightsByDate(date, publish)
      if (!result.error) {
        await fetchInsights()
        alert(`${date} 날짜의 인사이트 ${result.count}개를 ${publish ? '발행' : '비발행'}했습니다.`)
      } else {
        alert(`오류: ${result.error}`)
      }
    } catch (error) {
      console.error('일괄 발행 실패:', error)
      alert('일괄 발행 중 오류가 발생했습니다.')
    } finally {
      setBulkPublishing(null)
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">로딩 중...</div>
  }

  if (insights.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        등록된 인사이트가 없습니다.
      </div>
    )
  }

  const groupedInsights = groupInsightsByDate(insights)

  return (
    <div className="space-y-6">
      {groupedInsights.map(([dateKey, dateInsights]) => {
        const isFutureDate = dateKey !== '미정' && dateKey !== '발행 대기' && dateKey !== '즉시 발행됨' && new Date(dateKey) > new Date()
        const allPublished = dateInsights.every(i => i.is_published)
        const allUnpublished = dateInsights.every(i => !i.is_published)
        
        return (
          <div key={dateKey} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* 날짜별 헤더 */}
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {dateKey === '미정' ? '발행 날짜 미정' : 
                     dateKey === '발행 대기' ? '발행 대기 중' :
                     dateKey === '즉시 발행됨' ? '즉시 발행됨' :
                     format(new Date(dateKey + 'T00:00:00Z'), 'yyyy년 M월 d일 (E)', { locale: ko })}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {dateInsights.length}개의 인사이트
                    {isFutureDate && ' • 예약 발행'}
                  </p>
                </div>
              </div>
              
              {/* 일괄 발행 버튼 및 미리보기 */}
              {dateKey !== '미정' && dateKey !== '발행 대기' && dateKey !== '즉시 발행됨' && (
                <div className="flex gap-2">
                  {isFutureDate && (
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="text-xs"
                    >
                      <a 
                        href={`/news/${dateKey}?preview=true`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        미리보기
                      </a>
                    </Button>
                  )}
                  {!allPublished && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleBulkPublish(dateKey, true)}
                      disabled={bulkPublishing === dateKey}
                      className="text-xs"
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      전체 발행
                    </Button>
                  )}
                  {!allUnpublished && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkPublish(dateKey, false)}
                      disabled={bulkPublishing === dateKey}
                      className="text-xs"
                    >
                      <EyeOff className="w-3 h-3 mr-1" />
                      전체 비발행
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* 인사이트 목록 */}
            <div className="divide-y divide-gray-200">
              {dateInsights.map((insight) => (
                <div
                  key={insight.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  {editingId === insight.id ? (
                    <InsightEditForm
                      insight={insight}
                      editions={editions}
                      onCancel={() => {
                        setEditingId(null)
                        setExpandedInsightId(null)
                      }}
                      onSuccess={() => {
                        setEditingId(null)
                        setExpandedInsightId(null)
                        fetchInsights()
                      }}
                    />
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                          <Badge variant={insight.is_published ? 'default' : 'secondary'}>
                            {insight.is_published ? '발행됨' : '미발행'}
                          </Badge>
                          <Badge variant="outline">{insight.category}</Badge>
                          {insight.published_at && (
                            <Badge variant="outline" className="text-xs">
                              {new Date(insight.published_at) > new Date() ? (
                                `예약: ${format(new Date(insight.published_at), 'M/d', { locale: ko })}`
                              ) : (
                                `발행: ${format(new Date(insight.published_at), 'M/d', { locale: ko })}`
                              )}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {insight.summary}
                        </p>
                        {insight.content && (
                          <div className="mt-3">
                            <button
                              onClick={() => setExpandedInsightId(expandedInsightId === insight.id ? null : insight.id)}
                              className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-500" />
                                <span className="text-xs font-semibold text-gray-700">
                                  {expandedInsightId === insight.id ? '전체 내용 숨기기' : '전체 내용 보기'}
                                </span>
                              </div>
                              {expandedInsightId === insight.id ? (
                                <ChevronUp className="w-4 h-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                              )}
                            </button>
                            {expandedInsightId === insight.id && (
                              <div className="mt-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                                <div className="mb-3 pb-2 border-b border-gray-200 flex items-center justify-between">
                                  <p className="text-sm font-semibold text-gray-700">✍️ 넥소에디터 컬럼 전체 내용</p>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingId(insight.id)
                                      // 전체 내용을 보는 상태에서 수정 모드로 전환
                                    }}
                                    className="h-7 px-3 text-xs"
                                  >
                                    수정하기
                                  </Button>
                                </div>
                                <div className="max-h-[600px] overflow-y-auto">
                                  <div
                                    className="text-sm text-gray-800 prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(insight.content) }}
                                  />
                                </div>
                              </div>
                            )}
                            {expandedInsightId !== insight.id && (
                              <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div
                                  className="text-xs text-gray-700 prose prose-sm max-w-none line-clamp-3"
                                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(insight.content) }}
                                />
                              </div>
                            )}
                          </div>
                        )}
                        <a
                          href={insight.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-nexo-cyan hover:underline mt-2 inline-block"
                        >
                          {insight.url}
                        </a>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingId(insight.id)}
                        >
                          수정
                        </Button>
                        <Button
                          size="sm"
                          variant={insight.is_published ? 'outline' : 'default'}
                          onClick={() => handleTogglePublish(insight.id, insight.is_published)}
                        >
                          {insight.is_published ? (
                            <>
                              <EyeOff className="w-3 h-3 mr-1" />
                              비발행
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3 mr-1" />
                              발행
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
