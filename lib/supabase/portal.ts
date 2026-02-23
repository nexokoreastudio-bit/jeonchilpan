/**
 * 포털형 홈페이지용 데이터 조회
 */

import { createClient, createAdminClient } from '@/lib/supabase/server'

export interface PortalPost {
  id: number
  title: string
  board_type: string | null
  likes_count: number
  comments_count: number
  created_at: string
}

export interface PortalComment {
  id: number
  content: string
  created_at: string
  post_id: number
  post_title: string
}

export interface PortalNotice {
  id: number
  title: string
  created_at: string
  edition_id?: string | null
}

/** 인기글 (좋아요 많은 순) */
export async function getPopularPosts(limit = 10): Promise<PortalPost[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('posts')
    .select('id, title, board_type, likes_count, comments_count, created_at')
    .order('likes_count', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data || []) as PortalPost[]
}

/** 최신글 */
export async function getLatestPosts(limit = 10): Promise<PortalPost[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('posts')
    .select('id, title, board_type, likes_count, comments_count, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data || []) as PortalPost[]
}

/** 최신 댓글 (게시글 제목 포함) */
export async function getLatestComments(limit = 10): Promise<PortalComment[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('comments')
    .select('id, content, created_at, post_id')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (!data || data.length === 0) return []
  const postIds = [...new Set((data as any[]).map((c) => c.post_id).filter(Boolean))]
  const { data: posts } = await supabase
    .from('posts')
    .select('id, title')
    .in('id', postIds)
  const postMap = new Map((posts || []).map((p: any) => [p.id, p.title]))
  return (data as any[]).map((c) => ({
    id: c.id,
    content: c.content,
    created_at: c.created_at,
    post_id: c.post_id,
    post_title: postMap.get(c.post_id) || '(제목 없음)',
  })) as PortalComment[]
}

/** 공지사항 (전칠판 notice 게시판 - 커뮤니티 공지) */
export async function getPortalNotices(limit = 5): Promise<PortalNotice[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('posts')
    .select('id, title, created_at')
    .eq('board_type', 'notice')
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data || []).map((r: any) => ({
    id: r.id,
    title: r.title,
    created_at: r.created_at,
    edition_id: null, // 공지는 community 링크 사용 (id=post_id)
  })) as PortalNotice[]
}

export interface PortalEducationNews {
  id: number
  title: string
  url: string
  source: string
  category: string
  created_at: string
}

/** 학업 뉴스 (크롤링 뉴스 - crawled_news) */
export async function getPortalEducationNews(limit = 5): Promise<PortalEducationNews[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('crawled_news')
      .select('id, title, url, source, category, crawled_at')
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('crawled_at', { ascending: false })
      .limit(limit)
    return (data || []).map((r: any) => ({
      id: r.id,
      title: r.title,
      url: r.url,
      source: r.source,
      category: r.category || '기타',
      created_at: r.crawled_at || r.published_at || r.created_at,
    })) as PortalEducationNews[]
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('getPortalEducationNews 실패:', err)
    }
    return []
  }
}

// ========== 모니터링 대시보드용 (코인판 스타일) ==========

export interface PortalLeadStats {
  demoThisWeek: number
  demoLastWeek: number
  demoThisMonth: number
  demoChangePercent: number
  quoteThisWeek: number
  quoteLastWeek: number
  quoteThisMonth: number
  quoteChangePercent: number
  consultationThisMonth: number
}

export interface PortalEngagementStats {
  reviewCount: number
  avgRating: number
  postsThisWeek: number
  commentsThisWeek: number
}

/** 문의/리드 현황 (집계만, 개인정보 없음) - Admin client 필요 */
export async function getPortalLeadStats(): Promise<PortalLeadStats | null> {
  try {
    const supabase = await createAdminClient()
    const now = new Date()
    const startOfThisWeek = new Date(now)
    startOfThisWeek.setDate(now.getDate() - now.getDay())
    startOfThisWeek.setHours(0, 0, 0, 0)
    const startOfLastWeek = new Date(startOfThisWeek)
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7)
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const toIso = (d: Date) => d.toISOString()

    const [r1, r2, r3, r4, r5, r6, r7] = await Promise.all([
      supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .eq('type', 'demo')
        .gte('created_at', toIso(startOfThisWeek))
        .lte('created_at', toIso(now)),
      supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .eq('type', 'demo')
        .gte('created_at', toIso(startOfLastWeek))
        .lt('created_at', toIso(startOfThisWeek)),
      supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .eq('type', 'demo')
        .gte('created_at', toIso(startOfThisMonth)),
      supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .eq('type', 'quote')
        .gte('created_at', toIso(startOfThisWeek))
        .lte('created_at', toIso(now)),
      supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .eq('type', 'quote')
        .gte('created_at', toIso(startOfLastWeek))
        .lt('created_at', toIso(startOfThisWeek)),
      supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .eq('type', 'quote')
        .gte('created_at', toIso(startOfThisMonth)),
      supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .eq('type', 'consultation')
        .gte('created_at', toIso(startOfThisMonth)),
    ])

    const demoThisWeek = r1.count ?? 0
    const demoLastWeek = r2.count ?? 0
    const demoThisMonth = r3.count ?? 0
    const quoteThisWeek = r4.count ?? 0
    const quoteLastWeek = r5.count ?? 0
    const quoteThisMonth = r6.count ?? 0
    const consultationThisMonth = r7.count ?? 0

    const demoLast = demoLastWeek || 0
    const demoCur = demoThisWeek
    const demoChangePercent = demoLast === 0 ? (demoCur > 0 ? 100 : 0) : Math.round(((demoCur - demoLast) / demoLast) * 100)
    const quoteLast = quoteLastWeek || 0
    const quoteCur = quoteThisWeek
    const quoteChangePercent = quoteLast === 0 ? (quoteCur > 0 ? 100 : 0) : Math.round(((quoteCur - quoteLast) / quoteLast) * 100)

    return {
      demoThisWeek: demoCur,
      demoLastWeek: demoLast,
      demoThisMonth: demoThisMonth,
      demoChangePercent,
      quoteThisWeek: quoteCur,
      quoteLastWeek: quoteLast,
      quoteThisMonth: quoteThisMonth,
      quoteChangePercent,
      consultationThisMonth: consultationThisMonth,
    }
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('getPortalLeadStats 실패 (SUPABASE_SERVICE_ROLE_KEY 확인):', err)
    }
    return null
  }
}

/** 후기·전칠판 통계 */
export async function getPortalEngagementStats(): Promise<PortalEngagementStats> {
  try {
    const supabase = await createClient()
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const [
      { count: reviewCount },
      { data: ratingData },
      { count: postsThisWeek },
      { count: commentsThisWeek },
    ] = await Promise.all([
    supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('board_type', 'review'),
    supabase
      .from('posts')
      .select('rating')
      .eq('board_type', 'review')
      .not('rating', 'is', null),
    supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startOfWeek.toISOString())
      .in('board_type', ['bamboo', 'materials', 'job', 'verification']),
    supabase
      .from('comments')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startOfWeek.toISOString()),
    ])

    const reviewCountVal = reviewCount ?? 0
    const ratings = (ratingData || []).map((r: { rating: number }) => r.rating).filter(Boolean)
    const avgRating =
      ratings.length > 0
        ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
        : 0

    return {
      reviewCount: reviewCountVal,
      avgRating,
      postsThisWeek: postsThisWeek || 0,
      commentsThisWeek: commentsThisWeek || 0,
    }
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('getPortalEngagementStats 실패:', err)
    }
    return {
      reviewCount: 0,
      avgRating: 0,
      postsThisWeek: 0,
      commentsThisWeek: 0,
    }
  }
}
