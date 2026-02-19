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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CrawledNewsSection } from '@/components/news/crawled-news-section'

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
    free: '자유게시판',
    qna: 'Q&A',
    tip: '팁 & 노하우',
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 크롤링된 교육 뉴스 섹션 */}
      <CrawledNewsSection />

      {/* 히어로 섹션 - 이미지 오버레이 레이아웃 */}
      {latestArticle && (
        <section className="border-b border-gray-200 bg-white">
          <div className="relative w-full">
            {/* 배경 이미지 */}
            <div className="relative h-[500px] md:h-[600px] lg:h-[700px] w-full overflow-hidden">
              {latestArticle.thumbnail_url ? (
                <Image
                  src={latestArticle.thumbnail_url}
                  alt={latestArticle.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <Image
                  src="/assets/images/아이와 엄마가 함께 공부하는 사진.png"
                  alt="어머니와 아이가 함께 태블릿으로 학습하는 모습"
                  fill
                  className="object-cover"
                  priority
                />
              )}
              {/* 그라데이션 오버레이 */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40"></div>
              
              {/* 텍스트 콘텐츠 오버레이 */}
              <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto max-w-7xl px-4 md:px-8">
                  <div className="max-w-3xl space-y-6">
                    {/* 최신호 배지 및 날짜 */}
                    <div className="flex items-center gap-4 text-base md:text-lg text-white/90 tracking-wide">
                      <Badge variant="outline" className="border-white/50 text-white bg-white/10 backdrop-blur-sm font-medium rounded-none px-4 py-1.5 text-sm md:text-base">
                        최신호
                      </Badge>
                      <span className="font-semibold">{formatEditionDate(latestArticle.edition_id)}</span>
                    </div>
                    
                    {/* 메인 제목 */}
                    <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-[1.3] tracking-tight break-keep drop-shadow-lg">
                      {latestArticle.title}
                    </h1>
                    
                    {/* 부제목 */}
                    {latestArticle.subtitle && (
                      <p className="text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed font-normal mt-4 drop-shadow-md">
                        {latestArticle.subtitle}
                      </p>
                    )}
                    
                    {/* 버튼 */}
                    <div className="pt-4">
                      <Link href={`/news/${latestArticle.edition_id}`}>
                        <Button 
                          size="lg" 
                          className="bg-white hover:bg-white/90 text-nexo-navy rounded-none px-8 py-6 text-base font-semibold tracking-wide shadow-lg"
                        >
                          기사 읽기
                          <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 최신 교육 뉴스 섹션 - 3열 그리드 */}
      <section className="py-20 bg-white">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">최신 교육 뉴스</h2>
              <p className="text-gray-600 text-lg">매일 업데이트되는 교육 정보와 인사이트</p>
            </div>
            <Link href="/news" className="text-sm text-gray-500 hover:text-nexo-navy transition-colors font-medium hidden md:block">
              전체 보기 →
            </Link>
          </div>
          
          {editionsWithInsights.filter(edition => edition.insightsCount > 0).length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">발행된 인사이트가 없습니다.</p>
              <p className="text-gray-400 text-sm mt-2">관리자 페이지에서 인사이트를 발행해주세요.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
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
                    className="group"
                  >
                    <article className="h-full flex flex-col bg-white hover:shadow-lg transition-all duration-300 border border-gray-200">
                      {edition.thumbnail_url ? (
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                          <Image
                            src={edition.thumbnail_url}
                            alt={edition.title || '인사이트'}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      ) : (
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-nexo-navy/10 to-gray-100">
                          <Image
                            src="/assets/images/nexo_logo_black.png"
                            alt={edition.title || '인사이트'}
                            fill
                            className="object-contain p-8 opacity-60"
                          />
                        </div>
                      )}
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-4 flex-wrap">
                          <Badge variant="outline" className="text-xs border-gray-300 text-gray-600 font-normal rounded-none">
                            {formatEditionDate(edition.edition_id)}
                          </Badge>
                          {edition.insightsCount > 0 && (
                            <Badge variant="outline" className="text-xs border-nexo-cyan text-nexo-cyan bg-nexo-cyan/10">
                              💡 인사이트 {edition.insightsCount}개
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-nexo-navy transition-colors line-clamp-2 leading-tight">
                          {edition.title || '인사이트'}
                        </h3>
                        {edition.subtitle && (
                          <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-1 leading-relaxed">
                            {edition.subtitle}
                          </p>
                        )}
                        
                        {/* 관련 인사이트 미리보기 */}
                        {editionInsights.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 mb-2">관련 인사이트</p>
                            <div className="space-y-2">
                              {editionInsights.map((insight) => (
                                <div key={insight.id} className="text-xs text-gray-600 line-clamp-1">
                                  • {insight.title || '제목 없음'}
                                </div>
                              ))}
                              {edition.insightsCount > editionInsights.length && (
                                <div className="text-xs text-gray-400">
                                  +{edition.insightsCount - editionInsights.length}개 더
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="text-xs text-gray-500 mt-auto pt-4 border-t border-gray-100">
                          <span className="hover:text-nexo-navy transition-colors font-medium">기사 읽기 →</span>
                        </div>
                      </div>
                    </article>
                  </Link>
                )
              })
              .filter(Boolean) // null 제거
              }
            </div>
          )}

          {/* 모바일 전체 보기 버튼 */}
          <div className="mt-12 text-center md:hidden">
            <Link href="/news">
              <Button variant="outline" className="border-nexo-navy text-nexo-navy hover:bg-nexo-navy hover:text-white rounded-none">
                전체 보기
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 메인 콘텐츠 영역 */}
      <div className="container mx-auto max-w-7xl px-4 py-20">
        <div className="grid lg:grid-cols-3 gap-20">
          {/* 좌측: 주요 콘텐츠 (2/3 너비) */}
          <div className="lg:col-span-2 space-y-24">
            {/* 커뮤니티 새 글 섹션 */}
            {latestPosts.length > 0 && (
              <section>
                <div className="mb-12 flex items-center justify-between">
                  <div>
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">커뮤니티 새 글</h2>
                    <p className="text-gray-600 text-lg">사용자들이 공유하는 최신 정보와 이야기</p>
                  </div>
                  <Link 
                    href="/community" 
                    className="text-sm text-gray-500 hover:text-nexo-navy transition-colors font-medium hidden md:block"
                  >
                    전체 보기 →
                  </Link>
                </div>
                
                <div className="space-y-6">
                  {latestPosts.map((post) => (
                    <Link 
                      key={post.id} 
                      href={`/community/${post.id}`}
                      className="block group"
                    >
                      <article className="border-l-4 border-nexo-cyan pl-8 py-6 hover:bg-gray-50/50 transition-colors rounded-r-lg">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                              {post.board_type && (
                                <Badge variant="outline" className="text-xs border-gray-300 text-gray-600 font-normal rounded-none">
                                  {boardTypeLabels[post.board_type] || post.board_type}
                                </Badge>
                              )}
                              <span className="text-sm text-gray-500">
                                {post.author?.nickname || '익명'}
                              </span>
                              <span className="text-sm text-gray-400">
                                {format(new Date(post.created_at), 'yyyy.MM.dd', { locale: ko })}
                              </span>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-nexo-navy transition-colors line-clamp-2 leading-tight">
                              {post.title}
                            </h3>
                            <p className="text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                              {post.content.replace(/<[^>]*>/g, '').substring(0, 150)}
                              {post.content.replace(/<[^>]*>/g, '').length > 150 ? '...' : ''}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>👍 {post.likes_count}</span>
                              <span>💬 {post.comments_count}</span>
                              {post.images && post.images.length > 0 && (
                                <span>📷 {post.images.length}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
                
                {/* 모바일 전체 보기 버튼 */}
                <div className="mt-8 text-center md:hidden">
                  <Link href="/community">
                    <Button variant="outline" className="border-nexo-navy text-nexo-navy hover:bg-nexo-navy hover:text-white rounded-none">
                      전체 보기
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </section>
            )}

            {/* 현장 소식 & 후기 섹션 */}
            <section>
              <div className="grid md:grid-cols-2 gap-16">
                {/* 현장 소식 */}
                {latestFieldNews.length > 0 && (
                  <div>
                    <div className="mb-10">
                      <h3 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">현장 소식</h3>
                      <p className="text-gray-600 text-sm">전국 각지의 설치 현장</p>
                    </div>
                    
                    <div className="space-y-8">
                      {latestFieldNews.map((news: any) => (
                        <Link 
                          key={news.id} 
                          href={`/field#news-${news.id}`}
                          className="block group"
                        >
                          <article className="hover:shadow-md transition-shadow duration-300">
                            {news.images && news.images.length > 0 ? (
                              <div className="relative aspect-video w-full overflow-hidden bg-gray-100 mb-4">
                                <Image
                                  src={news.images[0]}
                                  alt={news.title}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              </div>
                            ) : (
                              <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 mb-4">
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-gray-400 text-xs">이미지 준비 중</span>
                                </div>
                              </div>
                            )}
                            <div>
                              <h4 className="text-xl font-bold text-gray-900 group-hover:text-nexo-navy transition-colors line-clamp-2 mb-2 leading-tight">
                                {news.title}
                              </h4>
                              {news.location && (
                                <p className="text-sm text-gray-500">
                                  {news.location}
                                </p>
                              )}
                            </div>
                          </article>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* 고객 후기 */}
                {latestReviews.length > 0 && (
                  <div>
                    <div className="mb-10">
                      <h3 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">고객 후기</h3>
                      <p className="text-gray-600 text-sm">실제 사용자들의 생생한 후기</p>
                    </div>
                    
                    <div className="space-y-8">
                      {latestReviews.map((review) => (
                        <Link 
                          key={review.id} 
                          href={`/reviews#review-${review.id}`}
                          className="block group"
                        >
                          <article className="hover:shadow-md transition-shadow duration-300 p-6 border-l-2 border-gray-200 hover:border-nexo-navy">
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <h4 className="text-xl font-bold text-gray-900 group-hover:text-nexo-navy transition-colors line-clamp-2 flex-1 leading-tight">
                                {review.title}
                              </h4>
                              {review.rating && (
                                <div className="flex items-center gap-1 text-yellow-500 flex-shrink-0">
                                  <span className="text-base font-bold">{review.rating}</span>
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                              {review.content.replace(/<[^>]*>/g, '').substring(0, 100)}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Calendar className="w-3 h-3" />
                              <span>{format(new Date(review.created_at), 'M월 d일', { locale: ko })}</span>
                              {review.is_verified_review && (
                                <Badge variant="outline" className="text-xs border-green-500 text-green-700 ml-2 rounded-none">
                                  인증
                                </Badge>
                              )}
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

          {/* 우측: 사이드바 (1/3 너비) */}
          <aside className="lg:col-span-1 space-y-10">
            {/* 전자칠판 상담 신청 배너 */}
            <div className="bg-gradient-to-br from-nexo-navy to-nexo-navy/95 text-white p-10">
              <h3 className="text-2xl font-bold mb-4">전자칠판 상담 신청</h3>
              <p className="text-white/90 text-sm mb-8 leading-relaxed">
                넥소 전자칠판을 직접 체험해보고, 학원 운영에 최적화된 솔루션을 확인하세요.
              </p>
              <Link href="/leads/demo">
                <Button 
                  className="w-full bg-white text-nexo-navy hover:bg-gray-100 rounded-none font-semibold shadow-sm"
                >
                  상담 신청하기
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* 자료실 배너 */}
            <div className="border border-gray-200 p-10 bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900 mb-4">자료실</h3>
              <p className="text-gray-600 text-sm mb-8 leading-relaxed">
                학원 운영에 유용한 자료를 다운로드하세요
              </p>
              <Link href="/resources">
                <Button 
                  variant="outline" 
                  className="w-full border-nexo-navy text-nexo-navy hover:bg-nexo-navy hover:text-white rounded-none font-semibold"
                >
                  자료실 바로가기
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
