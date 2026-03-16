import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createInsight } from '@/lib/actions/insights'
import { Database } from '@/types/database'

type UserRow = Database['public']['Tables']['users']['Row']

/**
 * 크롤링된 뉴스로부터 인사이트 생성 API
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 관리자 권한 확인
    const { data: profileData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const profile = profileData as Pick<UserRow, 'role'> | null

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 요청 본문 파싱
    const body = await request.json()
    const { url, title, category, published_at } = body

    if (!url || !title) {
      return NextResponse.json(
        { error: 'URL과 제목은 필수입니다.' },
        { status: 400 }
      )
    }

    const titleBasedSummary = `제목 기반 요약: ${title}`

    // 인사이트 생성 (크롤링된 뉴스의 summary와 기타 정보 전달)
    const result = await createInsight(
      url,
      category || '기타',
      undefined, // editionId는 선택사항
      undefined, // publishDate는 선택사항
      title, // 크롤링된 뉴스의 제목 직접 전달
      titleBasedSummary, // 제목 기반 요약 전달 (외부 본문 크롤링 최소화)
      undefined, // 썸네일 URL 전달 안함
      published_at ? published_at.split('T')[0] : undefined // 발행 날짜 전달
    )

    if (result.error) {
      return NextResponse.json(
        { 
          error: result.error,
          existingInsight: result.existingInsight || null
        },
        { status: 400 }
      )
    }

    // createInsight는 성공 시 { data: InsightRow } 형식으로 반환
    if (!result.data) {
      return NextResponse.json(
        { error: '인사이트 생성에 실패했습니다. 데이터가 반환되지 않았습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      id: result.data.id,
      title: result.data.title,
      url: result.data.url,
    })
  } catch (error: any) {
    console.error('인사이트 생성 API 오류:', error)
    return NextResponse.json(
      { error: error.message || '인사이트 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
