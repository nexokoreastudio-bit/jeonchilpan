import Link from 'next/link'
import { getAllEditionsWithInfo } from '@/lib/supabase/articles'
import { getInsights } from '@/lib/actions/insights'
import { SafeImage } from '@/components/safe-image'
import { Calendar, ArrowRight, Lightbulb } from 'lucide-react'
import styles from './archive.module.css'

// 정적 생성 및 재검증 설정 (성능 최적화)
export const revalidate = 0 // 항상 최신 데이터 가져오기 (예약 발행 즉시 반영)

// 날짜 포맷팅 함수
function formatEditionDate(editionId: string | null): string {
  if (!editionId) return '최신호'
  
  try {
    const datePart = editionId.replace(/-insight-\d+$/, '')
    const dateMatch = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (!dateMatch) {
      return editionId
    }
    
    const year = parseInt(dateMatch[1], 10)
    const month = parseInt(dateMatch[2], 10)
    const day = parseInt(dateMatch[3], 10)
    
    if (isNaN(year) || isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) {
      return editionId
    }
    
    const date = new Date(Date.UTC(year, month - 1, day))
    const weekday = date.getUTCDay()
    
    const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
    const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
    
    return `${year}년 ${months[month - 1]} ${day}일 ${weekdays[weekday]}`
  } catch {
    return editionId
  }
}

interface PageProps {
  searchParams: { page?: string }
}

export default async function NewsArchivePage({ searchParams }: PageProps) {
  const currentPage = Math.max(1, parseInt(searchParams?.page || '1', 10))
  const itemsPerPage = 9
  
  const [allEditions, allInsights] = await Promise.all([
    getAllEditionsWithInfo(),
    getInsights()
  ])

  const insightsCountByEdition = new Map<string, number>()
  const insightsByEdition = new Map<string, typeof allInsights>()
  
  allInsights.forEach(insight => {
    let editionId = insight.edition_id
    if (!editionId) {
      const dateSource = insight.published_at || insight.created_at
      if (dateSource) {
        try {
          const date = new Date(dateSource)
          const year = date.getUTCFullYear()
          const month = String(date.getUTCMonth() + 1).padStart(2, '0')
          const day = String(date.getUTCDate()).padStart(2, '0')
          editionId = `${year}-${month}-${day}-insight-${insight.id}`
        } catch (e) {}
      }
    }
    
    if (editionId) {
      insightsByEdition.set(editionId, [insight])
      insightsCountByEdition.set(editionId, 1)
    }
  })

  const editionsMap = new Map<string, any>()
  
  allEditions.forEach(edition => {
    const insightsCount = insightsCountByEdition.get(edition.edition_id) || 0
    if (insightsCount > 0) {
      editionsMap.set(edition.edition_id, edition)
    }
  })
  
  insightsByEdition.forEach((insights, editionId) => {
    if (!editionsMap.has(editionId) && insights.length > 0) {
      const firstInsight = insights[0]
      const dateOnly = editionId.replace(/-insight-\d+$/, '')
      editionsMap.set(editionId, {
        edition_id: editionId,
        title: firstInsight.title || `NEXO Daily ${dateOnly}`,
        subtitle: firstInsight.summary || '학부모님 상담에 도움이 되는 교육 정보',
        thumbnail_url: firstInsight.thumbnail_url,
        published_at: firstInsight.published_at || dateOnly + 'T00:00:00Z',
      })
    }
  })

  const allEditionsSorted = Array.from(editionsMap.values()).sort((a, b) => {
    const dateA = new Date(a.published_at || a.edition_id + 'T00:00:00Z').getTime()
    const dateB = new Date(b.published_at || b.edition_id + 'T00:00:00Z').getTime()
    return dateB - dateA
  })

  const totalItems = allEditionsSorted.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const editionsWithInsights = allEditionsSorted.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>📰 발행호 목록</h1>
        <p className={styles.subtitle}>
          NEXO Daily가 큐레이션한 교육 인사이트 아카이브
        </p>
      </div>

      {editionsWithInsights.length === 0 ? (
        <div className={styles.empty}>
          <p className="text-xl font-bold text-slate-900 mb-2">발행된 콘텐츠가 없습니다.</p>
          <p className={styles.subtitle}>
            관리자 페이지에서 첫 번째 인사이트를 발행해보세요.
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {editionsWithInsights.map((edition) => {
            const insightsCount = insightsCountByEdition.get(edition.edition_id) || 0
            
            return (
              <Link
                key={edition.edition_id}
                href={`/news/${edition.edition_id}`}
                className={styles.card}
              >
                {edition.thumbnail_url && (
                  <div className={styles.imageContainer}>
                    <SafeImage
                      src={edition.thumbnail_url}
                      alt={edition.title}
                      width={400}
                      height={250}
                      className={styles.image}
                    />
                  </div>
                )}
                <div className={styles.content}>
                  <div className={styles.date}>
                    <Calendar className="w-3 h-3 inline-block mr-1" />
                    {formatEditionDate(edition.edition_id)}
                  </div>
                  <h2 className={styles.title}>{edition.title}</h2>
                  {edition.subtitle && (
                    <p className={styles.subtitle}>{edition.subtitle}</p>
                  )}
                  
                  <div className={styles.footer}>
                    {insightsCount > 0 ? (
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                        <Lightbulb className="w-3 h-3" />
                        인사이트 {insightsCount}
                      </div>
                    ) : <div></div>}
                    <span className={styles.readMore}>
                      자세히 보기 <ArrowRight className="w-4 h-4 ml-1" />
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <div className={styles.paginationContent}>
            {currentPage > 1 ? (
              <Link href={`/news?page=${currentPage - 1}`} className={styles.paginationButton}>
                ← 이전
              </Link>
            ) : (
              <span className={`${styles.paginationButton} ${styles.paginationButtonDisabled}`}>
                ← 이전
              </span>
            )}

            <div className={styles.paginationNumbers}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                const showPage = pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                if (!showPage) return null
                return (
                  <Link
                    key={pageNum}
                    href={`/news?page=${pageNum}`}
                    className={`${styles.paginationNumber} ${pageNum === currentPage ? styles.paginationNumberActive : ''}`}
                  >
                    {pageNum}
                  </Link>
                )
              })}
            </div>

            {currentPage < totalPages ? (
              <Link href={`/news?page=${currentPage + 1}`} className={styles.paginationButton}>
                다음 →
              </Link>
            ) : (
              <span className={`${styles.paginationButton} ${styles.paginationButtonDisabled}`}>
                다음 →
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
