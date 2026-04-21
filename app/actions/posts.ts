'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { createPost as createPostQuery, deletePost as deletePostQuery, updatePost as updatePostQuery, type BoardType } from '@/lib/supabase/posts'
import { writeAuditLog } from '@/lib/actions/audit'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/**
 * 게시글 작성 서버 액션
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

    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user || user.id !== authorId) {
      return { success: false, error: '인증되지 않은 사용자입니다.' }
    }

    // 공지사항은 관리자만 작성 가능
    if (boardType === 'notice') {
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()
      const role = (profile as { role?: string } | null)?.role
      if (role !== 'admin') {
        return { success: false, error: '공지사항은 관리자만 작성할 수 있습니다.' }
      }
    }

    // 게시글 작성 (DB 트리거가 자동으로 포인트 지급)
    const result = await createPostQuery(boardType, title, content, authorId, images, rating, newsId)

    if (result.success && result.postId) {
      revalidatePath('/community')
      revalidatePath('/reviews')
      revalidatePath(`/community/${result.postId}`)
      revalidatePath('/mypage')
    }

    return result
  } catch (error: any) {
    console.error('게시글 작성 오류:', error)
    return { success: false, error: error.message || '알 수 없는 오류가 발생했습니다.' }
  }
}

/**
 * 게시글 수정 서버 액션
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
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user || user.id !== userId) {
      return { success: false, error: '인증되지 않은 사용자입니다.' }
    }

    const result = await updatePostQuery(postId, title, content, userId, boardType, images)

    if (result.success) {
      revalidatePath('/community')
      revalidatePath(`/community/${postId}`)
      revalidatePath('/mypage')
    }

    return result
  } catch (error: any) {
    console.error('게시글 수정 오류:', error)
    return { success: false, error: error.message || '알 수 없는 오류가 발생했습니다.' }
  }
}

/**
 * 게시글 삭제 서버 액션
 * 작성자 본인 또는 관리자만 삭제 가능
 */
export async function deletePost(postId: number): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: '인증되지 않은 사용자입니다.' }
    }

    // 게시글 삭제 (작성자 본인 또는 관리자 확인 포함)
    const result = await deletePostQuery(postId, user.id)

    if (result.success) {
      // 캐시 무효화
      revalidatePath('/community')
      revalidatePath('/reviews')
      revalidatePath(`/community/${postId}`)
      revalidatePath('/mypage')
      
      if (process.env.NODE_ENV === 'development') {
        console.log('게시글 삭제 성공:', { postId, userId: user.id })
      }
      
      // 성공 반환 (클라이언트에서 리다이렉트 처리)
      return { success: true }
    }

    if (process.env.NODE_ENV === 'development') {
      console.error('게시글 삭제 실패:', { postId, userId: user.id, error: result.error })
    }

    return result
  } catch (error: any) {
    console.error('게시글 삭제 오류:', error)
    return { success: false, error: error.message || '알 수 없는 오류가 발생했습니다.' }
  }
}

/**
 * 게시글 고정/해제 (관리자 전용)
 */
export async function togglePinPost(
  postId: number
): Promise<{ success: boolean; pinned?: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { success: false, error: '로그인이 필요합니다.' }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    if ((profile as { role?: string } | null)?.role !== 'admin') {
      return { success: false, error: '관리자 권한이 필요합니다.' }
    }

    const { data: post } = await supabase
      .from('posts')
      .select('is_pinned')
      .eq('id', postId)
      .single()
    if (!post) return { success: false, error: '게시글을 찾을 수 없습니다.' }

    const newPinned = !(post as any).is_pinned
    const adminClient = await createAdminClient()
    const { error } = await (adminClient.from('posts') as any)
      .update({ is_pinned: newPinned })
      .eq('id', postId)

    if (error) return { success: false, error: error.message }

    writeAuditLog({
      admin_id: user.id,
      admin_email: user.email || '',
      action: newPinned ? 'post.pin' : 'post.unpin',
      target_type: 'post',
      target_id: String(postId),
    })

    revalidatePath('/community')
    revalidatePath(`/community/${postId}`)
    return { success: true, pinned: newPinned }
  } catch (error: any) {
    return { success: false, error: error.message || '오류가 발생했습니다.' }
  }
}

/**
 * 게시글 신고
 */
export async function reportPost(
  postId: number,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { success: false, error: '로그인이 필요합니다.' }

    if (!reason.trim()) return { success: false, error: '신고 사유를 입력해주세요.' }

    const { error } = await (supabase.from('post_reports') as any).insert({
      post_id: postId,
      reporter_id: user.id,
      reason: reason.trim(),
    })

    if (error) {
      if (error.code === '23505') return { success: false, error: '이미 신고한 게시글입니다.' }
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || '오류가 발생했습니다.' }
  }
}

/**
 * 커뮤니티 검색
 */
export async function searchPosts(
  query: string,
  boardType?: BoardType | null,
  limit: number = 20
) {
  try {
    const supabase = await createClient()
    const keyword = `%${query.trim()}%`

    let q = supabase
      .from('posts')
      .select(`
        *,
        author:users!posts_author_id_fkey (
          id,
          nickname,
          avatar_url
        )
      `)
      .or(`title.ilike.${keyword},content.ilike.${keyword}`)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (boardType) {
      q = q.eq('board_type', boardType)
    } else {
      q = q.in('board_type', ['notice', 'bamboo', 'materials'])
    }

    const { data, error } = await q
    if (error) return []
    return data || []
  } catch {
    return []
  }
}

