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
import { NewsRotationBar } from '@/components/news/news-rotation-bar'
import { ConsultingCheatSheet } from '@/components/consulting-cheat-sheet'
import { PortalSidebar } from '@/components/portal/portal-sidebar'
import { CommunityTabsSection } from '@/components/portal/community-tabs-section'
import {
  getPopularPosts,
  getLatestPosts,
  getLatestComments,
  getPortalNotices,
  getPortalEducationNews,
  getPortalLeadStats,
  getPortalEngagementStats,
} from '@/lib/supabase/portal'
import { MonitoringDashboard } from '@/components/portal/monitoring-dashboard'
import { CollapsibleSection } from '@/components/portal/collapsible-section'
import { CenterBanner } from '@/components/shared/center-banner'
import { SmartstoreHeroSection } from '@/components/promotion/smartstore-hero-section'
import { SmartstorePopupBanner } from '@/components/promotion/smartstore-popup-banner'
import { classifyResourceCategory, RESOURCE_CATEGORY_LABELS, type ResourceCategoryKey } from '@/lib/utils/resource-category'

const MAIN_PROMO_VIDEO = '/assets/images/banners/main-banner.mp4'
const HOME_FILE_TYPE_LABELS: Record<string, string> = {
  pdf: 'PDF',
  xlsx: 'Excel',
  hwp: '한글',
  docx: 'Word',
  pptx: 'PPT',
}

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
export const revalidate = 60 // 60초 캐시 (성능 최적화, 콘텐츠는 1분 내 반영)

export default async function HomePage() {
  let latestArticle: Awaited<ReturnType<typeof getLatestArticle>> = null
  let allEditions: Awaited<ReturnType<typeof getAllEditionsWithInfo>> = []
  let allInsights: Awaited<ReturnType<typeof getInsights>> = []
  let latestReviews: Awaited<ReturnType<typeof getReviews>> = []
  let latestFieldNews: any[] = []
  let latestPosts: Awaited<ReturnType<typeof getPostsByBoardType>> = []
  let postsByBoard = {
    all: [] as Awaited<ReturnType<typeof getPostsByBoardType>>,
    notice: [] as Awaited<ReturnType<typeof getPostsByBoardType>>,
    bamboo: [] as Awaited<ReturnType<typeof getPostsByBoardType>>,
    materials: [] as Awaited<ReturnType<typeof getPostsByBoardType>>,
    resources: [] as Array<{ id: number; title: string; downloads_count: number; created_at: string }>,
  }
  let popularPosts: Awaited<ReturnType<typeof getPopularPosts>> = []
  let latestPostsForSidebar: Awaited<ReturnType<typeof getLatestPosts>> = []
  let latestComments: Awaited<ReturnType<typeof getLatestComments>> = []
  let notices: Awaited<ReturnType<typeof getPortalNotices>> = []
  let educationNews: Awaited<ReturnType<typeof getPortalEducationNews>> = []
  let leadStats: Awaited<ReturnType<typeof getPortalLeadStats>> = null
  let engagementStats: Awaited<ReturnType<typeof getPortalEngagementStats>> = {
    reviewCount: 0,
    avgRating: 0,
    postsThisWeek: 0,
    commentsThisWeek: 0,
  }
  let resourceTotalCount = 0
  let resourceTotalDownloads = 0
  let topResourceCategories: Array<{ key: ResourceCategoryKey; count: number }> = []
  let featuredResources: Array<{
    id: number
    title: string
    description: string | null
    file_type: string | null
    downloads_count: number
    created_at: string
    category: ResourceCategoryKey
  }> = []

  try {
    const supabase = await createClient()
    latestArticle = await getLatestArticle()
    allEditions = await getAllEditionsWithInfo()

    // 최신 콘텐츠 데이터 + 포털 사이드바용 데이터
    const [
      insights,
      reviews,
      fieldNews,
      postsAll,
      postsNotice,
      postsBamboo,
      postsMaterials,
      popularPostsData,
      latestPostsForSidebarData,
      latestCommentsData,
      noticesData,
      educationNewsData,
      resourcesData,
    ] = await Promise.all([
      getInsights(),
      getReviews('latest', 3, 0),
      supabase
        .from('field_news')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(3)
        .then(({ data }) => data || []),
      getPostsByBoardType(null, 10, 0),
      getPostsByBoardType('notice', 10, 0),
      getPostsByBoardType('bamboo', 10, 0),
      getPostsByBoardType('materials', 10, 0),
      getPopularPosts(10),
      getLatestPosts(10),
      getLatestComments(10),
      getPortalNotices(5),
      getPortalEducationNews(5),
      supabase
        .from('resources')
        .select('id, title, description, file_type, downloads_count, created_at')
        .order('created_at', { ascending: false })
        .limit(80)
        .then(({ data }) => data || []),
    ] as const)
    allInsights = insights
    latestReviews = reviews
    latestFieldNews = fieldNews || []
    latestPosts = postsAll
    postsByBoard = {
      all: postsAll,
      notice: postsNotice,
      bamboo: postsBamboo,
      materials: postsMaterials,
      resources: [],
    }
    popularPosts = popularPostsData
    latestPostsForSidebar = latestPostsForSidebarData
    latestComments = latestCommentsData
    notices = noticesData
    educationNews = educationNewsData

    type HomeResource = {
      id: number
      title: string
      description: string | null
      file_type: string | null
      downloads_count: number
      created_at: string
      category: ResourceCategoryKey
    }

    const resourcesWithCategory: HomeResource[] = ((resourcesData || []) as any[]).map((resource) => ({
      id: resource.id,
      title: resource.title || '제목 없음',
      description: resource.description || null,
      file_type: resource.file_type || null,
      downloads_count: resource.downloads_count || 0,
      created_at: resource.created_at || new Date(0).toISOString(),
      category: classifyResourceCategory(resource.title || '', resource.description),
    }))
    resourceTotalCount = resourcesWithCategory.length
    resourceTotalDownloads = resourcesWithCategory.reduce(
      (sum, resource) => sum + (resource.downloads_count || 0),
      0
    )

    const categoryCounts = resourcesWithCategory.reduce<Record<ResourceCategoryKey, number>>(
      (acc, resource) => {
        acc[resource.category] = (acc[resource.category] || 0) + 1
        return acc
      },
      {} as Record<ResourceCategoryKey, number>
    )

    topResourceCategories = (Object.entries(categoryCounts) as Array<[ResourceCategoryKey, number]>)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([key, count]) => ({ key, count }))

    featuredResources = resourcesWithCategory
      .sort((a, b) => {
        const downloadDiff = (b.downloads_count || 0) - (a.downloads_count || 0)
        if (downloadDiff !== 0) return downloadDiff
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
      .slice(0, 4)
    postsByBoard.resources = resourcesWithCategory
      .slice()
      .sort((a, b) => {
        const downloadDiff = (b.downloads_count || 0) - (a.downloads_count || 0)
        if (downloadDiff !== 0) return downloadDiff
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
      .slice(0, 8)
      .map((resource) => ({
        id: resource.id,
        title: resource.title,
        downloads_count: resource.downloads_count || 0,
        created_at: resource.created_at,
      }))
  const [leadStatsData, engagementStatsData] = await Promise.all([
      getPortalLeadStats(),
      getPortalEngagementStats(),
    ])
    leadStats = leadStatsData
    engagementStats = engagementStatsData
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

  // 상담팁 카테고리 인사이트 (컨닝페이퍼용)
  const consultingInsights = allInsights.filter((i) => i.category === '상담팁')

  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      <SmartstorePopupBanner />
      {/* 포털형 2단: 콘텐츠 | 우측 사이드바 */}
      <div className="flex flex-col lg:flex-row container mx-auto max-w-7xl px-3 sm:px-4 md:px-6 py-5 sm:py-8 md:py-10 gap-4 sm:gap-6 xl:gap-8">
        <div className="flex-1 min-w-0 flex flex-col gap-4 md:gap-6">
          {/* 콘텐츠 영역 - 배너와 공간을 나누지 않음, 항상 full width */}
          <div className="flex-1 min-w-0 space-y-2 md:space-y-3">
      {/* 소상공인 스마트상점 모집 히어로 */}
      <SmartstoreHeroSection />

      {/* 메인 프로모션 배너 */}
      <section className="hidden sm:block bg-white border border-gray-200/80 overflow-hidden rounded-lg shadow-sm">
        <Link href="/leads/consultation?type=quote" className="block">
          <div className="relative aspect-[180/51] bg-gray-50">
            <video
              className="absolute inset-0 h-full w-full object-cover"
              src={MAIN_PROMO_VIDEO}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
          </div>
        </Link>
      </section>

      {/* 크롤링 뉴스 1줄 로테이션 바 */}
      {educationNews.length > 0 && (
        <NewsRotationBar items={educationNews} />
      )}

      {/* 자료실 유입 특화 섹션 */}
      <section className="bg-white border border-gray-200/80 overflow-hidden rounded-lg shadow-sm card-hover">
        <div className="border-b border-gray-100 bg-slate-50/70 px-4 sm:px-5 py-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold tracking-wide text-[#00a396] uppercase">NEXO 자료실</p>
              <h2 className="text-base sm:text-lg font-bold text-slate-800 mt-1">원장님이 바로 쓰는 상담·수업 자료</h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                학부모 상담, 반 운영, 수업 설계에 바로 쓰는 실무형 템플릿을 모아두었습니다.
              </p>
            </div>
            <Link
              href="/resources"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-[#00c4b4] hover:text-[#00a396] transition-colors shrink-0"
            >
              자료실 전체 보기
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="px-4 sm:px-5 py-4 sm:py-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-3">
                <p className="text-[11px] text-slate-500">전체 자료</p>
                <p className="text-lg font-bold text-slate-800 mt-0.5">{resourceTotalCount.toLocaleString()}개</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-3">
                <p className="text-[11px] text-slate-500">누적 다운로드</p>
                <p className="text-lg font-bold text-slate-800 mt-0.5">{resourceTotalDownloads.toLocaleString()}회</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-3 col-span-2 lg:col-span-1">
                <p className="text-[11px] text-slate-500 mb-2">인기 카테고리</p>
                <div className="flex flex-wrap gap-1.5">
                  {topResourceCategories.length > 0 ? (
                    topResourceCategories.map((category) => (
                      <Link
                        key={category.key}
                        href={`/resources?category=${category.key}`}
                        className="inline-flex items-center gap-1 rounded-full border border-[#00c4b4]/30 bg-[#00c4b4]/5 px-2.5 py-1 text-[11px] font-medium text-[#007d73]"
                      >
                        {RESOURCE_CATEGORY_LABELS[category.key]}
                        <span className="text-[#00a396]">{category.count}</span>
                      </Link>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">자료 준비중</span>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 rounded-lg border border-slate-200 overflow-hidden">
              <ul className="divide-y divide-slate-100">
                {featuredResources.length > 0 ? (
                  featuredResources.map((resource, index) => (
                    <li key={resource.id} className="flex items-center justify-between gap-3 px-3 sm:px-4 py-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-[11px] font-semibold text-slate-600">
                            {index + 1}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {RESOURCE_CATEGORY_LABELS[resource.category]}
                          </span>
                          {resource.file_type && (
                            <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              {HOME_FILE_TYPE_LABELS[resource.file_type] || resource.file_type.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-slate-800 line-clamp-1">{resource.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          다운로드 {resource.downloads_count.toLocaleString()}회
                        </p>
                      </div>
                      <Link
                        href="/resources"
                        className="shrink-0 inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:border-[#00c4b4]/40 hover:text-[#00897f] transition-colors"
                      >
                        받기
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-6 text-sm text-slate-500">표시할 자료가 없습니다.</li>
                )}
              </ul>
            </div>
          </div>

          <div className="sm:hidden mt-4 text-right">
            <Link
              href="/resources"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#00c4b4] hover:text-[#00a396] transition-colors"
            >
              자료실 전체 보기
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 최상단: 실시간 현황 (접기/펼치기) */}
      <CollapsibleSection
        title="실시간 현황"
        subtitle="상담신청 현황과 고객 후기를 한눈에"
        badge={
          ((leadStats?.demoThisWeek ?? 0) > 0 || (leadStats?.quoteThisWeek ?? 0) > 0 || engagementStats.postsThisWeek > 0 || engagementStats.commentsThisWeek > 0) ? (
            <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white bg-[#00c4b4] rounded">
              NEW
            </span>
          ) : undefined
        }
        defaultOpen={false}
      >
        <MonitoringDashboard leadStats={leadStats} engagementStats={engagementStats} />
      </CollapsibleSection>

      {/* 전칠판 - 원장님들의 고민을 함께 나누는 공개 커뮤니티 */}
      {(postsByBoard.all.length > 0 ||
        postsByBoard.notice.length > 0 ||
        postsByBoard.bamboo.length > 0 ||
        postsByBoard.materials.length > 0 ||
        postsByBoard.resources.length > 0) && (
        <section className="bg-white border border-gray-200/80 overflow-hidden rounded-lg shadow-sm card-hover">
          <div className="border-b border-gray-100 bg-slate-50/50 px-3 sm:px-4 py-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-bold text-slate-800">
                전칠판 - 원장님들의 고민을 함께 나누는 공개 커뮤니티
              </h2>
              {(engagementStats.postsThisWeek > 0 || engagementStats.commentsThisWeek > 0) && (
                <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white bg-[#00c4b4] rounded">
                  NEW
                </span>
              )}
            </div>
            <p className="text-slate-500 text-xs mt-0.5">전자칠판·스마트보드 사용자들이 모이는 공개 포럼</p>
          </div>
          <div className="p-0">
            <CommunityTabsSection postsByBoard={postsByBoard} />
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
          <div className="relative min-h-[320px] sm:min-h-[420px] md:min-h-[480px] flex items-end">
            <div className="container mx-auto max-w-4xl px-3 sm:px-4 pb-10 sm:pb-14 md:pb-20">
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
                className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-50 hover:shadow-lg transition-all duration-200 text-sm"
              >
                인사이트 읽기
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 오늘의 교육 뉴스 (실시간 큐레이션) */}
      <section className="bg-white border border-gray-200/80 overflow-hidden rounded-lg shadow-sm card-hover">
        <CrawledNewsSection limit={3} embedded />
      </section>

      {/* 중앙 배너 */}
      <CenterBanner variant="outline" />

      {/* 큐레이션 인사이트 - 학부모 상담에 활용 */}
      <section className="bg-white border border-gray-200/80 overflow-hidden rounded-lg shadow-sm card-hover">
        <div className="border-b border-gray-100 bg-slate-50/50 px-5 py-4">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                NEXO 에디터 큐레이션 - 학부모 상담에 쓸 오늘의 인사이트
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                입시·교육 정책을 전문가 관점에서 해석해드립니다.
              </p>
            </div>
            <Link href="/news" className="hidden md:flex items-center gap-2 text-sm font-medium text-[#00c4b4] hover:text-[#00a396] transition-colors shrink-0">
              오늘의 인사이트 모아보기 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div className="container mx-auto max-w-6xl px-3 sm:px-6 py-8 sm:py-12 md:py-14">
          
          {editionsWithInsights.filter(edition => edition.insightsCount > 0).length === 0 ? (
            <div className="text-center py-20 text-slate-500 text-sm">
              발행된 인사이트가 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8 md:gap-10">
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
                    <article className="h-full flex flex-col bg-white overflow-hidden border border-gray-100 rounded-lg hover:border-[#00c4b4]/30 hover:shadow-md transition-all duration-200">
                      {edition.thumbnail_url ? (
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-50 rounded-t-lg">
                          <Image
                            src={edition.thumbnail_url}
                            alt={edition.title || '인사이트'}
                            fill
                            className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-50 rounded-t-lg">
                          <Image
                            src="/assets/images/nexo_logo_black.png"
                            alt={edition.title || '인사이트'}
                            fill
                            className="object-contain p-8 opacity-40"
                          />
                        </div>
                      )}
                      <div className="p-4 sm:p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-xs text-gray-500">
                            {formatEditionDate(edition.edition_id)}
                          </span>
                          {edition.insightsCount > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-[#00c4b4]/10 text-[#00c4b4] font-medium">
                              인사이트 {edition.insightsCount}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-3 group-hover:text-[#00c4b4] transition-colors line-clamp-2">
                          {edition.title || '인사이트'}
                        </h3>
                        {edition.subtitle && (
                          <p className="text-slate-500 text-sm line-clamp-2 flex-1">
                            {edition.subtitle}
                          </p>
                        )}
                        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[#00c4b4] group-hover:gap-2 transition-all">
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
            넥소 전자칠판 카톡 정보방
          </p>
          <h2 className="text-xl md:text-2xl font-bold mb-3">
            전자칠판 사용법부터 상담신청 안내까지, 한 번에 받아보세요
          </h2>
          <p className="text-white/70 text-sm md:text-base mb-8">
            넥소 전자칠판 사용법, 수업 활용법, 설치 사례, 상담신청 안내 등
            전자칠판 관련 핵심 정보를 카톡으로 빠르게 확인할 수 있습니다.
          </p>
          <a
            href="https://invite.kakao.com/tc/OYA6XOhnGN"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-[#FEE500] text-[#1a1a1a] font-bold text-sm hover:bg-[#f5dc00] hover:shadow-lg hover:shadow-[#FEE500]/30 transition-all duration-200"
          >
            카톡 정보방 입장하기
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* 메인 콘텐츠 - 현장 소식 & 고객 후기 */}
      <section className="bg-white border border-gray-200/80 overflow-hidden rounded-lg shadow-sm card-hover">
        <div className="border-b border-gray-100 bg-slate-50/50 px-5 py-4">
          <h2 className="text-base font-bold text-slate-800">현장 소식 & 고객 후기</h2>
          <p className="text-slate-500 text-sm mt-1">전국 학원들의 변화 스토리와 원장님·강사님 후기</p>
        </div>
        <div className="container mx-auto max-w-6xl px-5 py-10">
          <div className="grid md:grid-cols-2 gap-10">
                {latestFieldNews.length > 0 && (
                  <div className="bg-slate-50/50 border border-gray-100 p-5 rounded-lg">
                    <h3 className="text-base font-bold text-slate-800 mb-2">전국 학원들의 변화 스토리</h3>
                    <p className="text-slate-500 text-sm mb-5">실제 현장에서 벌어지는 수업 환경 개선 이야기</p>
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
                  <div className="bg-slate-50/50 border border-gray-100 p-5 rounded-lg">
                    <h3 className="text-base font-bold text-slate-800 mb-2">원장님·강사님이 직접 남긴 후기</h3>
                    <p className="text-slate-500 text-sm mb-5">실제 사용 후 솔직하게 써주신 생생한 이야기</p>
                    <div className="space-y-6">
                      {latestReviews.map((review) => (
                        <Link key={review.id} href="/field" className="block group">
                          <article className="p-4 border border-gray-100 rounded-lg hover:border-[#00c4b4]/30 hover:shadow-sm transition-all duration-200 bg-white">
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
        </div>
      </section>
          </div>
        </div>
        {/* 우측 포털 사이드바 */}
        <PortalSidebar
          notices={notices}
          educationNews={educationNews}
          popularPosts={popularPosts}
          latestPosts={latestPostsForSidebar}
          latestComments={latestComments}
        />
      </div>
    </div>
  )
}
