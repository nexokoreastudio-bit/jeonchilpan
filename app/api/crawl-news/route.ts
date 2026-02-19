import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'
import { parseRssFeed, crawlNewsFromHtml, isValidUrl } from '@/lib/utils/news-crawler'

/**
 * 교육 뉴스 크롤링 API
 * 관리자 권한 필요
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Vercel Cron에서 호출된 경우 인증 생략
    const cronSecret = request.headers.get('authorization')?.replace('Bearer ', '')
    const isCronRequest = cronSecret === process.env.CRON_SECRET
    
    if (!isCronRequest) {
      // 수동 크롤링인 경우 관리자 권한 확인
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return NextResponse.json(
          { error: '인증이 필요합니다.' },
          { status: 401 }
        )
      }

      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      const profileData = profile as Pick<Database['public']['Tables']['users']['Row'], 'role'> | null
      if (profileData?.role !== 'admin') {
        return NextResponse.json(
          { error: '관리자 권한이 필요합니다.' },
          { status: 403 }
        )
      }
    }

    // Cron 요청이 아닐 때만 body 파싱 (Cron 요청은 body가 없을 수 있음)
    let sourceId: number | undefined
    try {
      const body = await request.json().catch(() => ({}))
      sourceId = body.sourceId
    } catch {
      // body가 없어도 계속 진행 (Cron 요청인 경우)
    }
    
    // 활성화된 뉴스 소스 가져오기
    let query = supabase
      .from('news_sources')
      .select('*')
      .eq('is_active', true)
    
    if (sourceId) {
      query = query.eq('id', sourceId)
    }
    
    const { data: sources, error: sourcesError } = await query
    
    if (sourcesError) {
      return NextResponse.json(
        { error: '뉴스 소스를 가져오는데 실패했습니다.' },
        { status: 500 }
      )
    }
    
    if (!sources || sources.length === 0) {
      return NextResponse.json(
        { error: '활성화된 뉴스 소스가 없습니다.' },
        { status: 400 }
      )
    }
    
    const crawledItems: Array<{
      title: string
      url: string
      source: string
      category: '입시' | '학업' | '취업' | '교육정책' | '기타'
      summary?: string
      thumbnail_url?: string
      published_at?: string
    }> = []
    
    // 각 소스별로 크롤링
    for (const source of sources) {
      try {
        // 크롤링 간격 체크: 마지막 크롤링 시간 확인
        if (source.last_crawled_at && !sourceId) {
          const lastCrawled = new Date(source.last_crawled_at)
          const now = new Date()
          const hoursSinceLastCrawl = (now.getTime() - lastCrawled.getTime()) / (1000 * 60 * 60)
          
          // 크롤링 간격이 충족되지 않았으면 건너뛰기 (수동 크롤링은 제외)
          if (hoursSinceLastCrawl < (source.crawl_interval_hours || 24)) {
            console.log(`[크롤링 건너뜀] ${source.name}: 마지막 크롤링 후 ${hoursSinceLastCrawl.toFixed(1)}시간 경과 (간격: ${source.crawl_interval_hours || 24}시간)`)
            continue
          }
        }
        
        let items: typeof crawledItems = []
        
        // RSS 피드가 있으면 RSS 사용
        if (source.rss_url) {
          console.log(`[크롤링] ${source.name} RSS 피드 크롤링 시작: ${source.rss_url}`)
          items = await parseRssFeed(source.rss_url, source.name)
          console.log(`[크롤링] ${source.name}에서 ${items.length}개의 기사를 찾았습니다.`)
        } else {
          // HTML 크롤링 (교육 섹션 URL 필요)
          // 실제 구현 시 각 신문사별 교육 섹션 URL을 news_sources에 추가해야 함
          const educationUrl = `${source.base_url}/education` // 예시
          console.log(`[크롤링] ${source.name} HTML 크롤링 시작: ${educationUrl}`)
          items = await crawlNewsFromHtml(educationUrl, source.name)
          console.log(`[크롤링] ${source.name}에서 ${items.length}개의 기사를 찾았습니다.`)
        }
        
        crawledItems.push(...items)
        
        // 마지막 크롤링 시간 업데이트
        await supabase
          .from('news_sources')
          .update({ last_crawled_at: new Date().toISOString() })
          .eq('id', source.id)
        
      } catch (error: any) {
        console.error(`[크롤링 실패] ${source.name}:`, error?.message || error)
        // 하나의 소스 실패해도 계속 진행
      }
    }
    
    console.log(`[크롤링 완료] 총 ${crawledItems.length}개의 기사를 수집했습니다.`)
    
    // 중복 체크 및 데이터베이스에 저장
    const result = await saveCrawledNews(crawledItems, supabase)
    
    console.log(`[저장 완료] 새로 저장: ${result.saved}개, 업데이트: ${result.updated}개, 건너뜀: ${result.skipped}개`)
    
    return NextResponse.json({
      success: true,
      message: `${result.saved}개의 새로운 기사를 저장했습니다.`,
      total: crawledItems.length,
      saved: result.saved,
      updated: result.updated,
      skipped: result.skipped,
    })
  } catch (error: any) {
    console.error('크롤링 API 오류:', error)
    return NextResponse.json(
      { error: `크롤링 중 오류가 발생했습니다: ${error?.message || '알 수 없는 오류'}` },
      { status: 500 }
    )
  }
}

/**
 * 크롤링된 뉴스를 데이터베이스에 저장 (스마트 중복 체크 및 업데이트)
 */
async function saveCrawledNews(
  items: Array<{
    title: string
    url: string
    source: string
    category: '입시' | '학업' | '취업' | '교육정책' | '기타'
    summary?: string
    thumbnail_url?: string
    published_at?: string
  }>,
  supabase: ReturnType<typeof createClient>
): Promise<{ saved: number; updated: number; skipped: number }> {
  let savedCount = 0
  let updatedCount = 0
  let skippedCount = 0
  
  // 최근 7일 이내 기사만 크롤링 (중복 방지)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  for (const item of items) {
    try {
      // 발행일이 7일 이전이면 건너뛰기
      if (item.published_at) {
        const publishedDate = new Date(item.published_at)
        if (publishedDate < sevenDaysAgo) {
          skippedCount++
          continue
        }
      }
      
      // 1차: URL 중복 체크
      const { data: existingByUrl } = await supabase
        .from('crawled_news')
        .select('id, title, summary, thumbnail_url, published_at, crawled_at')
        .eq('url', item.url)
        .maybeSingle()
      
      if (existingByUrl) {
        // 기존 기사 정보 업데이트 (요약, 썸네일 등이 개선되었을 수 있음)
        const updateData: any = {
          updated_at: new Date().toISOString(),
          crawled_at: new Date().toISOString(), // 최신 크롤링 시간 업데이트
        }
        
        let hasUpdate = false
        
        // 요약이 더 길거나 썸네일이 없으면 업데이트
        if (item.summary && (!existingByUrl.summary || item.summary.length > (existingByUrl.summary?.length || 0))) {
          updateData.summary = item.summary
          hasUpdate = true
        }
        
        if (item.thumbnail_url && !existingByUrl.thumbnail_url) {
          updateData.thumbnail_url = item.thumbnail_url
          hasUpdate = true
        }
        
        // 제목이 변경되었을 수 있음 (예: 업데이트된 기사)
        if (item.title !== existingByUrl.title) {
          updateData.title = item.title
          hasUpdate = true
        }
        
        // 업데이트할 내용이 있으면 업데이트
        if (hasUpdate) {
          await supabase
            .from('crawled_news')
            .update(updateData)
            .eq('id', existingByUrl.id)
          updatedCount++
        } else {
          // 업데이트할 내용이 없어도 크롤링 시간만 업데이트
          await supabase
            .from('crawled_news')
            .update({ crawled_at: new Date().toISOString() })
            .eq('id', existingByUrl.id)
        }
        
        skippedCount++
        continue
      }
      
      // 2차: 제목 + 발행일 조합으로 중복 체크 (URL이 다를 수 있음)
      if (item.published_at) {
        const { data: existingByTitleAndDate } = await supabase
          .from('crawled_news')
          .select('id')
          .eq('title', item.title)
          .eq('published_at', item.published_at)
          .maybeSingle()
        
        if (existingByTitleAndDate) {
          // 같은 제목과 발행일이면 중복으로 판단
          skippedCount++
          continue
        }
      }
      
      // 새 기사 저장
      const { error } = await supabase
        .from('crawled_news')
        .insert({
          title: item.title,
          url: item.url,
          source: item.source,
          category: item.category,
          summary: item.summary,
          thumbnail_url: item.thumbnail_url,
          published_at: item.published_at,
        })
      
      if (!error) {
        savedCount++
      } else {
        console.error('기사 저장 실패:', error)
        skippedCount++
      }
    } catch (error) {
      console.error('기사 저장 중 오류:', error)
      skippedCount++
    }
  }
  
  return { saved: savedCount, updated: updatedCount, skipped: skippedCount }
}

/**
 * GET: 크롤링된 뉴스 목록 조회 (공개 API)
 * 각 뉴스에 대해 이미 인사이트가 생성되었는지 확인하여 함께 반환
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const category = searchParams.get('category')
    const source = searchParams.get('source')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    let query = supabase
      .from('crawled_news')
      .select('*')
      .order('crawled_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (category && category !== '전체') {
      query = query.eq('category', category)
    }
    
    if (source) {
      query = query.eq('source', source)
    }
    
    const { data: newsItems, error } = await query
    
    if (error) {
      return NextResponse.json(
        { error: '뉴스를 가져오는데 실패했습니다.' },
        { status: 500 }
      )
    }
    
    // 각 뉴스에 대해 이미 인사이트가 생성되었는지 확인
    if (newsItems && newsItems.length > 0) {
      const urls = newsItems.map((item: any) => item.url)
      
      // 인사이트 테이블에서 해당 URL들의 인사이트 조회
      const { data: insights } = await supabase
        .from('insights')
        .select('id, url, title, is_published')
        .in('url', urls)
      
      // URL을 키로 하는 맵 생성
      const insightMap = new Map()
      if (insights) {
        insights.forEach((insight: any) => {
          insightMap.set(insight.url, {
            id: insight.id,
            title: insight.title,
            is_published: insight.is_published,
          })
        })
      }
      
      // 각 뉴스에 인사이트 정보 추가
      const newsWithInsights = newsItems.map((item: any) => ({
        ...item,
        has_insight: insightMap.has(item.url),
        insight_id: insightMap.get(item.url)?.id || null,
        insight_title: insightMap.get(item.url)?.title || null,
        insight_is_published: insightMap.get(item.url)?.is_published || false,
      }))
      
      return NextResponse.json({
        success: true,
        data: newsWithInsights,
        count: newsWithInsights.length,
      })
    }
    
    return NextResponse.json({
      success: true,
      data: [],
      count: 0,
    })
  } catch (error: any) {
    console.error('뉴스 조회 API 오류:', error)
    return NextResponse.json(
      { error: `뉴스 조회 중 오류가 발생했습니다: ${error?.message || '알 수 없는 오류'}` },
      { status: 500 }
    )
  }
}

