import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'
import { format, subDays } from 'date-fns'

type UserRow = Database['public']['Tables']['users']['Row']
type PostRow = Database['public']['Tables']['posts']['Row']
type PostActivityRow = Pick<PostRow, 'created_at' | 'board_type'>

export async function GET() {
  try {
    const supabase = await createClient()

    // 현재 사용자 확인
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

    // 최근 30일 데이터
    const thirtyDaysAgo = subDays(new Date(), 30).toISOString()

    const { data: posts } = await supabase
      .from('posts')
      .select('created_at, board_type')
      .gte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: true })

    // 날짜별 그룹화
    const dailyCounts: Record<string, { posts: number; reviews: number }> = {}
    const today = new Date()

    // 30일간의 날짜 초기화
    for (let i = 29; i >= 0; i--) {
      const date = subDays(today, i)
      const dateKey = format(date, 'yyyy-MM-dd')
      dailyCounts[dateKey] = { posts: 0, reviews: 0 }
    }

    // 게시글 데이터 집계
    if (posts) {
      const typedPosts = posts as PostActivityRow[]
      typedPosts.forEach((post) => {
        const dateKey = format(new Date(post.created_at), 'yyyy-MM-dd')
        if (dailyCounts[dateKey]) {
          dailyCounts[dateKey].posts++
          // Lean: board_type 'review' 제거됨, reviews는 0 유지
        }
      })
    }

    // 배열로 변환
    const data = Object.entries(dailyCounts).map(([date, counts]) => ({
      date: format(new Date(date), 'MM/dd'),
      ...counts,
    }))

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error('게시글 활동 데이터 조회 오류:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}


