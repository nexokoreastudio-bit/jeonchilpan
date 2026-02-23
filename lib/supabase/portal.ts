/**
 * 포털형 홈페이지용 데이터 조회
 */

import { createClient } from '@/lib/supabase/server'

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

/** 공지/교육뉴스 (인사이트 최신순) */
export async function getPortalNotices(limit = 5): Promise<PortalNotice[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('insights')
    .select('id, title, created_at, edition_id')
    .eq('is_published', true)
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data || []).map((r: any) => ({
    id: r.id,
    title: r.title,
    created_at: r.created_at,
    edition_id: r.edition_id || null,
  })) as PortalNotice[]
}
