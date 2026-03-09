/**
 * Posts 관련 Supabase 쿼리 함수
 */

import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'

/** Lean 리뉴얼: 운영 게시판 타입 */
export type BoardType =
  | 'bamboo'       // 자유게시판
  | 'materials'    // 자료공유
  | 'verification' // (레거시)
  | 'notice'       // 공지사항
  | 'job'          // (레거시)

type Post = Database['public']['Tables']['posts']['Row']
type PostRow = Database['public']['Tables']['posts']['Row']
type PostInsert = Database['public']['Tables']['posts']['Insert']
type PostUpdate = Database['public']['Tables']['posts']['Update']

export interface PostWithAuthor extends Post {
  author: {
    id: string
    nickname: string | null
    avatar_url: string | null
  } | null
}

/**
 * 게시판 타입별 게시글 목록 가져오기
 * 공지글(board_type=notice)은 모든 게시판에서 상단 고정
 */
export async function getPostsByBoardType(
  boardType: BoardType | null = null,
  limit: number = 20,
  offset: number = 0
): Promise<PostWithAuthor[]> {
  const supabase = await createClient()

  const selectQuery = `
    *,
    author:users!posts_author_id_fkey (
      id,
      nickname,
      avatar_url
    )
  `

  // 공지사항 전용 탭: 공지글만 반환
  if (boardType === 'notice') {
    const { data, error } = await supabase
      .from('posts')
      .select(selectQuery)
      .eq('board_type', 'notice')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      if (process.env.NODE_ENV === 'development') console.error('게시글 조회 실패:', error)
      return []
    }
    return (data || []) as PostWithAuthor[]
  }

  // 전체/자유게시판/자료공유: 공지글 상단 고정
  const needsNoticePinned = boardType === null || ['bamboo', 'materials'].includes(boardType)

  if (needsNoticePinned) {
    const [noticeRes, boardRes] = await Promise.all([
      supabase
        .from('posts')
        .select(selectQuery)
        .eq('board_type', 'notice')
        .order('created_at', { ascending: false })
        .limit(50),
      boardType
        ? supabase
            .from('posts')
            .select(selectQuery)
            .eq('board_type', boardType)
            .order('created_at', { ascending: false })
            .range(0, offset + limit - 1)
        : supabase
            .from('posts')
            .select(selectQuery)
            .in('board_type', ['notice', 'bamboo', 'materials'])
            .order('created_at', { ascending: false })
            .range(0, Math.max(offset + limit + 99, 199)) // 공지 제외 후 충분한 목록 확보
    ])

    if (noticeRes.error || boardRes.error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('게시글 조회 실패:', noticeRes.error || boardRes.error)
      }
      return []
    }

    const notices = (noticeRes.data || []) as PostWithAuthor[]
    let boardPosts = (boardRes.data || []) as PostWithAuthor[]

    // 전체 탭: 공지 제외한 나머지만 (boardPosts에 이미 공지 포함 가능성 낮음)
    if (boardType === null) {
      boardPosts = boardPosts.filter((p) => p.board_type !== 'notice')
    }

    const noticeIds = new Set(notices.map((p) => p.id))
    const merged = [
      ...notices,
      ...boardPosts.filter((p) => !noticeIds.has(p.id)),
    ]
    return merged.slice(offset, offset + limit) as PostWithAuthor[]
  }

  // fallback (미사용)
  const { data, error } = await supabase
    .from('posts')
    .select(selectQuery)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    if (process.env.NODE_ENV === 'development') console.error('게시글 조회 실패:', error)
    return []
  }
  return (data || []) as PostWithAuthor[]
}

/**
 * 특정 게시글 가져오기
 */
export async function getPostById(postId: number): Promise<PostWithAuthor | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:users!posts_author_id_fkey (
        id,
        nickname,
        avatar_url
      )
    `)
    .eq('id', postId)
    .single()

  if (error) {
    console.error('게시글 조회 실패:', error)
    return null
  }

  return data as PostWithAuthor
}

export interface PostWithNews extends PostWithAuthor {
  news_id: number | null
}

/**
 * 게시글 작성
 */
export async function createPost(
  boardType: BoardType,
  title: string,
  content: string,
  authorId: string,
  images?: string[],
  rating?: number,
  newsId?: number | null
): Promise<{ success: boolean; postId?: number; error?: string }> {
  try {
    const supabase = await createClient()

    const postData: PostInsert = {
      board_type: boardType,
      title,
      content,
      author_id: authorId,
      images: images || null,
      likes_count: 0,
      comments_count: 0,
      rating: null,
      is_best: false,
      is_verified_review: false,
      news_id: newsId || null,
    }

    const { data: postResult, error } = await supabase
      .from('posts')
      .insert(postData as any as never)
      .select()
      .single()

    if (error || !postResult) {
      console.error('게시글 작성 실패:', error)
      return { success: false, error: error?.message || '게시글 작성 실패' }
    }

    const newPost = postResult as PostRow
    return { success: true, postId: newPost.id }
  } catch (error: any) {
    console.error('게시글 작성 오류:', error)
    return { success: false, error: error.message || '알 수 없는 오류' }
  }
}

/**
 * 게시글 수정 (작성자 본인 또는 관리자)
 */
export async function updatePost(
  postId: number,
  title: string,
  content: string,
  userId: string,
  boardType?: BoardType,
  images?: string[] | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const { data: postData } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', postId)
      .single()

    const post = postData as Pick<PostRow, 'author_id'> | null
    if (!post) return { success: false, error: '게시글을 찾을 수 없습니다.' }

    const isAuthor = post.author_id === userId

    // 관리자 권한 확인
    let isAdmin = false
    if (!isAuthor) {
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()
      isAdmin = (profile as { role?: string } | null)?.role === 'admin'
    }

    if (!isAuthor && !isAdmin) {
      return { success: false, error: '수정 권한이 없습니다.' }
    }

    const updateData: PostUpdate = {
      title,
      content,
      ...(boardType && { board_type: boardType }),
      ...(images !== undefined && { images }),
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('posts')
      .update(updateData as any as never)
      .eq('id', postId)

    if (error) {
      console.error('게시글 수정 실패:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error('게시글 수정 오류:', error)
    return { success: false, error: error.message || '알 수 없는 오류' }
  }
}

/**
 * 게시글 삭제
 * 작성자 본인 또는 관리자만 삭제 가능
 */
export async function deletePost(
  postId: number,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: '인증되지 않은 사용자입니다.' }
    }

    // 전달받은 userId와 현재 사용자 ID가 일치하는지 확인
    if (user.id !== userId) {
      return { success: false, error: '사용자 ID가 일치하지 않습니다.' }
    }

    // 게시글 정보 조회
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', postId)
      .single()

    if (postError || !postData) {
      console.error('게시글 조회 실패:', postError)
      return { success: false, error: '게시글을 찾을 수 없습니다.' }
    }

    const post = postData as Pick<PostRow, 'author_id'> | null

    if (!post) {
      return { success: false, error: '게시글을 찾을 수 없습니다.' }
    }

    // 관리자 권한 확인
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error('사용자 프로필 조회 실패:', profileError)
    }

    const profileData = profile as { role: string | null } | null
    const isAdmin = profileData?.role === 'admin'
    const isAuthor = post.author_id === userId

    // 작성자 본인 또는 관리자만 삭제 가능
    if (!isAuthor && !isAdmin) {
      console.error('삭제 권한 없음:', { 
        userId, 
        authorId: post.author_id, 
        isAuthor, 
        isAdmin,
        role: profileData?.role 
      })
      return { success: false, error: '삭제 권한이 없습니다. 작성자 본인 또는 관리자만 삭제할 수 있습니다.' }
    }

    // 관리자인 경우 Service Role Key를 사용하여 RLS 우회
    const { createAdminClient } = await import('./server')
    const deleteClient = isAdmin
      ? await createAdminClient()
      : supabase
    if (isAdmin) {
      console.log('관리자 삭제 모드: Service Role Key 사용')
    }

    // 권한 확인 로그
    console.log('삭제 권한 확인:', { 
      userId, 
      authorId: post.author_id, 
      isAuthor, 
      isAdmin,
      role: profileData?.role,
      usingServiceRole: isAdmin
    })

    // 삭제 전 게시글 존재 확인
    const { data: checkData, error: checkError } = await deleteClient
      .from('posts')
      .select('id')
      .eq('id', postId)
      .single()

    if (checkError || !checkData) {
      console.error('게시글 존재 확인 실패:', { postId, checkError })
      return { success: false, error: '게시글을 찾을 수 없습니다. 이미 삭제되었을 수 있습니다.' }
    }

    // 게시글 삭제 (관련 댓글과 좋아요는 CASCADE로 자동 삭제됨)
    // 관리자인 경우 Service Role Key를 사용하여 RLS 우회
    const { data: deletedData, error: deleteError } = await deleteClient
      .from('posts')
      .delete()
      .eq('id', postId)
      .select()

    if (deleteError) {
      console.error('게시글 삭제 실패:', deleteError)
      return { success: false, error: deleteError.message || '게시글 삭제에 실패했습니다.' }
    }

    // 삭제된 행이 없으면 게시글이 존재하지 않음
    if (!deletedData || deletedData.length === 0) {
      console.error('게시글 삭제 실패: 삭제된 행이 없음', { postId, userId, checkData })
      // 다시 한 번 확인
      const { data: verifyData } = await supabase
        .from('posts')
        .select('id')
        .eq('id', postId)
        .single()
      
      if (verifyData) {
        return { success: false, error: '게시글 삭제에 실패했습니다. 권한을 확인해주세요.' }
      } else {
        return { success: false, error: '게시글을 찾을 수 없습니다. 이미 삭제되었을 수 있습니다.' }
      }
    }

    console.log('게시글 삭제 성공:', { postId, deletedCount: deletedData.length })

    return { success: true }
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('게시글 삭제 오류:', error)
    }
    return { success: false, error: error.message || '알 수 없는 오류가 발생했습니다.' }
  }
}
