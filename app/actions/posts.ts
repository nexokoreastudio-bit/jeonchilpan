'use server'

import { createClient } from '@/lib/supabase/server'
import { createPost as createPostQuery, deletePost as deletePostQuery, updatePost as updatePostQuery, type BoardType } from '@/lib/supabase/posts'
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

