import Link from 'next/link'
import Image from 'next/image'
import { getLatestArticle, getAllEditionsWithInfo, type EditionInfo } from '@/lib/supabase/articles'
import { getInsights } from '@/lib/actions/insights'
import { getPostsByBoardType } from '@/lib/supabase/posts'
import { getReviews } from '@/lib/supabase/reviews'
import { createClient } from '@/lib/supabase/server'
import { Calendar, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { CrawledNewsSection } from '@/components/news/crawled-news-section'
import { ConsultingCheatSheet } from '@/components/consulting-cheat-sheet'

// 날짜 포맷팅 유틸리티 함수
function formatEditionDate(editionId: string | null): string {
  if (!editionId) return '최신호'
  
  try {
    // -insight-{id} 형식인 경우 날짜 부분만 추출
    const datePart = editionId.replace(/-insight-\d+$/, '')
    
    // YYYY-MM-DD 형식인지 확인
    const dateMatch = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (!dateMatch) {
      return editionId // 형식이 맞지 않으면 그대로 반환
    }
    
    const year = parseInt(dateMatch[1], 10)
    const month = parseInt(dateMatch[2], 10)
    const day = parseInt(dateMatch[3], 10)
    
    // 유효한 날짜인지 확인
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

// 정적 생성 및 재검증 설정
export const revalidate = 0 // 항상 최신 데이터 가져오기 (예약 발행 즉시 반영)

export default async function HomePage() {
  let latestArticle: Awaited<ReturnType<typeof getLatestArticle>> = null
  let allEditions: Awaited<ReturnType<typeof getAllEditionsWithInfo>> = []
  let allInsights: Awaited<ReturnType<typeof getInsights>> = []
  let latestReviews: Awaited<ReturnType<typeof getReviews>> = []
  let latestFieldNews: any[] = []
  let latestPosts: Awaited<ReturnType<typeof getPostsByBoardType>> = []

  try {
    const supabase = await createClient()
    latestArticle = await getLatestArticle()
    allEditions = await getAllEditionsWithInfo()

    // 최신 콘텐츠 데이터 가져오기
    const [insights, reviews, fieldNews, posts] = await Promise.all([
      getInsights(), // 모든 발행된 인사이트 가져오기
      getReviews('latest', 3, 0),
      supabase
        .from('field_news')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(3)
        .then(({ data }) => data || []),
      getPostsByBoardType(null, 3, 0) // 전체 게시판에서 최신 3개 가져오기
    ])
    allInsights = insights
    latestReviews = reviews
    latestFieldNews = fieldNews || []
    latestPosts = posts
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('홈페이지 데이터 로드 실패:', error)
    }
    // DB/API 실패 시 빈 데이터로 페이지 렌더링 유지
  }

  // 발행호별 인사이트 개수 및 목록 계산
  // 각 인사이트마다 개별 가상 에디션 ID 생성 (같은 날짜의 인사이트도 분리)
  const insightsByEdition = new Map<string, typeof allInsights>()
  const insightsCountByEdition = new Map<string, number>()
  
  allInsights.forEach(insight => {
    // edition_id가 있으면 그대로 사용
    // edition_id가 null이면 published_at 또는 created_at으로 개별 가상 에디션 ID 생성
    let editionId = insight.edition_id
    
    if (!editionId) {
      // published_at 우선, 없으면 created_at 사용 (즉시 발행됨 인사이트 대응)
      const dateSource = insight.published_at || insight.created_at
      if (dateSource) {
        try {
          const date = new Date(dateSource)
          const year = date.getUTCFullYear()
          const month = String(date.getUTCMonth() + 1).padStart(2, '0')
          const day = String(date.getUTCDate()).padStart(2, '0')
          editionId = `${year}-${month}-${day}-insight-${insight.id}`
        } catch (e) {
          console.warn('인사이트 날짜 파싱 실패:', dateSource, e)
        }
      }
    }
    
    if (editionId) {
      // 각 인사이트마다 개별 에디션으로 처리
      insightsByEdition.set(editionId, [insight])
      insightsCountByEdition.set(editionId, 1)
    }
  })

  // 일반 인사이트 (edition_id가 null인 것) - 날짜순 정렬
  const generalInsights = allInsights
    .filter(insight => !insight.edition_id)
    .sort((a, b) => {
      const dateA = a.published_at ? new Date(a.published_at).getTime() : new Date(a.created_at).getTime()
      const dateB = b.published_at ? new Date(b.published_at).getTime() : new Date(b.created_at).getTime()
      return dateB - dateA // 최신순
    })
  
  // 발행호에 인사이트 정보 추가 및 날짜별 정렬
  type EditionWithInsights = typeof allEditions[0] & {
    insightsCount: number
    relatedInsights: typeof allInsights
  }
  
  // 모든 발행호 (기존 발행호 + 인사이트만 있는 발행호)
  const allEditionIds = new Set<string>()
  
  // 기존 발행호 추가
  allEditions.forEach(edition => {
    allEditionIds.add(edition.edition_id)
  })
  
  // 인사이트만 있는 발행호 추가 (published_at 또는 created_at으로 가상 에디션 ID 생성)
  allInsights.forEach(insight => {
    if (!insight.edition_id) {
      const dateSource = insight.published_at || insight.created_at
      if (dateSource) {
        try {
          const date = new Date(dateSource)
          const year = date.getUTCFullYear()
          const month = String(date.getUTCMonth() + 1).padStart(2, '0')
          const day = String(date.getUTCDate()).padStart(2, '0')
          const editionId = `${year}-${month}-${day}-insight-${insight.id}`
          allEditionIds.add(editionId)
        } catch (e) {
          // 날짜 파싱 실패 시 무시
        }
      }
    }
  })
  
  // 발행호 정보 맵 생성 (기존 발행호 + 가상 발행호)
  const editionInfoMap = new Map<string, EditionInfo>()
  
  // 기존 발행호 정보 추가 (실제 에디션은 articles 테이블에 있으므로 별도 처리)
  // 실제 에디션은 인사이트가 연결되어 있지 않아도 표시 가능하지만,
  // "최신 교육 뉴스" 섹션에서는 인사이트만 있는 가상 에디션만 표시
  // 실제 에디션은 히어로 섹션에서 표시됨
  
  // 인사이트만 있는 발행호를 위한 가상 발행호 생성 (각 인사이트마다 개별 에디션)
  Array.from(allEditionIds).forEach(editionId => {
    if (!editionInfoMap.has(editionId)) {
      // 해당 인사이트를 기반으로 가상 발행호 생성
      const editionInsights = insightsByEdition.get(editionId) || []
      if (editionInsights.length > 0) {
        const firstInsight = editionInsights[0]
        // editionId에서 날짜 부분만 추출 (insight-{id} 제거)
        const dateOnly = editionId.replace(/-insight-\d+$/, '')
        editionInfoMap.set(editionId, {
          edition_id: editionId,
          title: firstInsight.title || `NEXO Daily ${dateOnly}`,
          subtitle: firstInsight.summary || '학부모님 상담에 도움이 되는 교육 정보',
          thumbnail_url: firstInsight.thumbnail_url || null,
          published_at: firstInsight.published_at || editionId + 'T00:00:00Z',
        })
      }
    }
  })
  
  const editionsWithInsights: EditionWithInsights[] = Array.from(editionInfoMap.values())
    .map(edition => {
      // 각 발행호별 고유 인사이트만 표시 (가상 에디션은 각각 1개의 인사이트만 가짐)
      const editionSpecificInsights = insightsByEdition.get(edition.edition_id) || []
      
      // 인사이트가 있는 에디션만 반환
      if (!Array.isArray(editionSpecificInsights) || editionSpecificInsights.length === 0) {
        return null
      }
      
      return {
        ...edition,
        insightsCount: editionSpecificInsights.length, // 가상 에디션은 항상 1개
        relatedInsights: editionSpecificInsights // 가상 에디션은 해당 인사이트만
      }
    })
    .filter((edition): edition is EditionWithInsights => edition !== null)
    .sort((a, b) => {
      // published_at 기준으로 정렬 (최신순)
      const dateA = a.published_at ? new Date(a.published_at).getTime() : 0
      const dateB = b.published_at ? new Date(b.published_at).getTime() : 0
      return dateB - dateA
    })

  // 게시판 타입 라벨 매핑
  const boardTypeLabels: Record<string, string> = {
    bamboo: '원장님 대나무숲',
    materials: '넥소 공식 자료실',
    verification: '구독자 인증',
  }

  // 상담팁 카테고리 인사이트 (컨닝페이퍼용)
  const consultingInsights = allInsights.filter((i) => i.category === '상담팁')

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* 최상단: 커뮤니티 - 이슈화 */}
      {latestPosts.length > 0 && (
        <section className="py-12 md:py-16 bg-white border-b border-gray-100">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <span className="inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#00c4b4] bg-[#00c4b4]/10 rounded mb-2">
                  커뮤니티
                </span>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  지금 이런 이야기가 오가고 있어요
                </h2>
                <p className="text-gray-500 text-sm mt-1">학원장·강사님들이 공유하는 생생한 정보</p>
              </div>
              <Link href="/community" className="hidden md:flex items-center gap-2 text-sm font-medium text-[#00c4b4] hover:underline">
                커뮤니티 더 보기
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {latestPosts.map((post) => (
                <Link key={post.id} href={`/community/${post.id}`} className="block py-6 group first:pt-0">
                  <article className="hover:bg-gray-50/50 -mx-2 px-2 py-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      {post.board_type && (
                        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                          {boardTypeLabels[post.board_type] || post.board_type}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {post.author?.nickname || '익명'} · {format(new Date(post.created_at), 'M.dd', { locale: ko })}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 group-hover:text-[#00c4b4] transition-colors line-clamp-1 mb-1">
                      {post.title}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                      {post.content.replace(/<[^>]*>/g, '').substring(0, 120)}
                      {post.content.replace(/<[^>]*>/g, '').length > 120 ? '...' : ''}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>👍 {post.likes_count}</span>
                      <span>💬 {post.comments_count}</span>
                      {post.images && post.images.length > 0 && <span>📷 {post.images.length}</span>}
                    </div>
                  </article>
                </Link>
              ))}
            </div>
            <div className="mt-6 md:hidden">
              <Link
                href="/community"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#00c4b4]"
              >
                전체 보기
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 오늘의 상담 컨닝페이퍼 */}
      <ConsultingCheatSheet insights={consultingInsights} />

      {/* 히어로 - 오늘의 인사이트 */}
      {latestArticle && (
        <section className="relative bg-gray-900 overflow-hidden">
          <div className="absolute inset-0">
            {latestArticle.thumbnail_url ? (
              <Image
                src={latestArticle.thumbnail_url}
                alt={latestArticle.title}
                fill
                className="object-cover opacity-60"
                priority
              />
            ) : (
              <Image
                src="/assets/images/아이와 엄마가 함께 공부하는 사진.png"
                alt=""
                fill
                className="object-cover opacity-60"
                priority
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
          </div>
          <div className="relative min-h-[420px] md:min-h-[480px] flex items-end">
            <div className="container mx-auto max-w-4xl px-4 pb-14 md:pb-20">
              <span className="inline-block px-3 py-1 text-xs font-semibold text-[#00c4b4] bg-white/10 rounded-full mb-5">
                📌 오늘의 인사이트
              </span>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-[1.3] tracking-tight max-w-3xl">
                {latestArticle.title}
              </h1>
              {latestArticle.subtitle && (
                <p className="mt-4 text-base md:text-lg text-white/80 line-clamp-2 max-w-2xl">
                  {latestArticle.subtitle}
                </p>
              )}
              <p className="mt-3 text-sm text-white/60">{formatEditionDate(latestArticle.edition_id)}</p>
              <Link
                href={`/news/${latestArticle.edition_id}`}
                className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm"
              >
                인사이트 읽기
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 오늘의 교육 뉴스 (실시간 큐레이션) */}
      <CrawledNewsSection limit={3} />

      {/* 큐레이션 인사이트 - 학부모 상담에 활용 */}
      <section className="py-20 md:py-24 bg-[#fafafa]">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex items-end justify-between mb-14">
            <div>
              <span className="inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#00c4b4] bg-[#00c4b4]/10 rounded mb-3">
                NEXO 에디터 큐레이션
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                학부모 상담에 쓸 오늘의 인사이트
              </h2>
              <p className="text-gray-500 mt-3 text-base max-w-xl">
                입시·교육 정책을 전문가 관점에서 해석해드립니다. 상담실에서 바로 활용해보세요.
              </p>
            </div>
            <Link href="/news" className="hidden md:flex items-center gap-2 text-sm font-medium text-[#00c4b4] hover:text-[#00a396] transition-colors shrink-0">
              발행호 전체 보기
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {editionsWithInsights.filter(edition => edition.insightsCount > 0).length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p>발행된 인사이트가 없습니다.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {editionsWithInsights
                .filter(edition => {
                  // 인사이트가 있고, relatedInsights가 배열인 발행호만 표시
                  return edition && edition.edition_id && edition.insightsCount > 0 && Array.isArray(edition.relatedInsights) && edition.relatedInsights.length > 0
                })
                .slice(0, 3)
                .map((edition) => {
                // 해당 발행호와 연관된 인사이트 (발행호별 고유 인사이트만)
                const editionInsights = Array.isArray(edition.relatedInsights) ? edition.relatedInsights : []
                
                // edition_id가 유효한지 확인
                if (!edition.edition_id) {
                  return null
                }

                return (
                  <Link 
                    key={edition.edition_id} 
                    href={`/news/${edition.edition_id}`}
                    className="group block"
                  >
                    <article className="h-full flex flex-col bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200">
                      {edition.thumbnail_url ? (
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-50">
                          <Image
                            src={edition.thumbnail_url}
                            alt={edition.title || '인사이트'}
                            fill
                            className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-50">
                          <Image
                            src="/assets/images/nexo_logo_black.png"
                            alt={edition.title || '인사이트'}
                            fill
                            className="object-contain p-8 opacity-40"
                          />
                        </div>
                      )}
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs text-gray-500">
                            {formatEditionDate(edition.edition_id)}
                          </span>
                          {edition.insightsCount > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-[#00c4b4]/10 text-[#00c4b4] font-medium">
                              인사이트 {edition.insightsCount}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#00c4b4] transition-colors line-clamp-2">
                          {edition.title || '인사이트'}
                        </h3>
                        {edition.subtitle && (
                          <p className="text-gray-500 text-sm line-clamp-2 flex-1">
                            {edition.subtitle}
                          </p>
                        )}
                        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#00c4b4] group-hover:gap-2 transition-all">
                          인사이트 읽기
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </article>
                  </Link>
                )
              })
              .filter(Boolean) // null 제거
              }
            </div>
          )}

          <div className="mt-10 md:hidden text-center">
            <Link href="/news" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#00c4b4]">
              전체 보기
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 카카오 정보방 CTA - 호기심/참여 유도 */}
      <section className="py-16 md:py-20 bg-[#1a1a1a] text-white">
        <div className="container mx-auto max-w-2xl px-4 text-center">
          <p className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
            학원장·강사님들이 매일 모이는 곳
          </p>
          <h2 className="text-xl md:text-2xl font-bold mb-3">
            매일 아침 8시, 뭐가 카톡으로 와 있을까?
          </h2>
          <p className="text-white/70 text-sm md:text-base mb-8">
            입시 뉴스부터 자료 공유까지. 넥소 정보방에서 함께 나눠보세요.
          </p>
          <a
            href={process.env.NEXT_PUBLIC_KAKAO_OPEN_CHAT_URL || 'https://open.kakao.com/o/sample'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#FEE500] text-[#1a1a1a] font-bold text-sm hover:bg-[#f5dc00] transition-colors"
          >
            정보방 입장하기
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* 메인 콘텐츠 */}
      <div className="container mx-auto max-w-6xl px-4 pt-20 pb-16 md:pt-24 md:pb-20">
        <div className="space-y-16">
            {/* 현장 소식 & 고객 후기 */}
            <section>
              <div className="grid md:grid-cols-2 gap-12">
                {latestFieldNews.length > 0 && (
                  <div>
                    <span className="inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 rounded mb-2">현장</span>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">전국 학원들의 변화 스토리</h3>
                    <p className="text-gray-500 text-sm mb-6">실제 현장에서 벌어지는 수업 환경 개선 이야기</p>
                    <div className="space-y-6">
                      {latestFieldNews.map((news: any) => (
                        <Link key={news.id} href={`/field#news-${news.id}`} className="block group">
                          <article>
                            {news.images && news.images.length > 0 ? (
                              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-50 mb-3">
                                <Image
                                  src={news.images[0]}
                                  alt={news.title}
                                  fill
                                  className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                                />
                              </div>
                            ) : (
                              <div className="aspect-video rounded-lg bg-gray-100 mb-3" />
                            )}
                            <h4 className="text-sm font-semibold text-gray-900 group-hover:text-[#00c4b4] transition-colors line-clamp-2">
                              {news.title}
                            </h4>
                            {news.location && <p className="text-xs text-gray-500 mt-1">{news.location}</p>}
                          </article>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {latestReviews.length > 0 && (
                  <div>
                    <span className="inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 rounded mb-2">후기</span>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">원장님·강사님이 직접 남긴 후기</h3>
                    <p className="text-gray-500 text-sm mb-6">실제 사용 후 솔직하게 써주신 생생한 이야기</p>
                    <div className="space-y-6">
                      {latestReviews.map((review) => (
                        <Link key={review.id} href={`/reviews#review-${review.id}`} className="block group">
                          <article className="p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h4 className="text-sm font-semibold text-gray-900 group-hover:text-[#00c4b4] transition-colors line-clamp-1 flex-1">
                                {review.title}
                              </h4>
                              {review.rating && <span className="text-yellow-500 text-xs font-medium">{review.rating}★</span>}
                            </div>
                            <p className="text-gray-500 text-xs line-clamp-2 mb-2">{review.content.replace(/<[^>]*>/g, '').substring(0, 80)}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              {format(new Date(review.created_at), 'M.d', { locale: ko })}
                              {review.is_verified_review && <span className="text-green-600">인증</span>}
                            </div>
                          </article>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
        </div>
      </div>
    </div>
  )
}
