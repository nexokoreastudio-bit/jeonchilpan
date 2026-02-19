import { NextRequest, NextResponse } from 'next/server'
import { parseRssFeed } from '@/lib/utils/news-crawler'

/**
 * RSS 피드 테스트 API
 * 개발/테스트 용도
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const rssUrl = searchParams.get('url')
    const source = searchParams.get('source') || '테스트'

    if (!rssUrl) {
      return NextResponse.json(
        { error: 'RSS URL이 필요합니다.' },
        { status: 400 }
      )
    }

    console.log(`[테스트] RSS 피드 테스트 시작: ${source} - ${rssUrl}`)

    const items = await parseRssFeed(rssUrl, source)

    console.log(`[테스트] ${source}: ${items.length}개의 기사를 찾았습니다.`)

    return NextResponse.json({
      success: true,
      count: items.length,
      items: items.slice(0, 5).map(item => ({
        title: item.title,
        category: item.category,
        url: item.url,
      })),
    })
  } catch (error: any) {
    console.error('[테스트] RSS 피드 테스트 실패:', error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'RSS 피드 파싱 실패',
      },
      { status: 500 }
    )
  }
}

