'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/database'

type UserRow = Database['public']['Tables']['users']['Row']
type FieldNewsUpdate = Database['public']['Tables']['field_news']['Update']
type FieldNewsRow = Database['public']['Tables']['field_news']['Row']

interface CreateFieldNewsData {
  title: string
  content: string
  location?: string | null
  installation_date?: string | null
  images?: string[] | null
  author_id: string
  store_name?: string | null
  model?: string | null
  additional_cables?: string | null
  stand?: string | null
  wall_mount?: string | null
  payment?: string | null
  notes?: string | null
}

/**
 * 현장 소식 작성 서버 액션
 */
export async function createFieldNews(
  data: CreateFieldNewsData
): Promise<{ success: boolean; id?: number; error?: string }> {
  try {
    const supabase = await createClient()

    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user || user.id !== data.author_id) {
      return { success: false, error: '인증되지 않은 사용자입니다.' }
    }

    // 관리자 권한 확인
    const { data: profileData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const profile = profileData as Pick<UserRow, 'role'> | null

    if (profile?.role !== 'admin') {
      return { success: false, error: '관리자 권한이 필요합니다.' }
    }

    // 관리자 클라이언트로 RLS 우회하여 작성
    const adminSupabase = await createAdminClient()

    // 현장 소식 작성
    type FieldNewsInsert = Database['public']['Tables']['field_news']['Insert']
    type FieldNewsRow = Database['public']['Tables']['field_news']['Row']
    
    // content가 비어있는지 확인
    const textContent = data.content.replace(/<[^>]*>/g, '').trim()
    if (!textContent && !data.content.includes('<img')) {
      return { success: false, error: '내용을 입력해주세요.' }
    }
    
    const insertData: FieldNewsInsert = {
      title: data.title,
      content: data.content || '',
      location: data.location,
      installation_date: data.installation_date || null,
      images: data.images,
      author_id: data.author_id,
      is_published: false, // 기본값은 임시저장
      views: 0,
    } as any
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📝 현장 소식 작성 시도:', {
        title: insertData.title,
        contentLength: insertData.content?.length || 0,
        hasImages: insertData.images && insertData.images.length > 0,
        author_id: insertData.author_id,
      })
    }
    
    const { data: fieldNewsData, error } = await (adminSupabase
      .from('field_news') as any)
      .insert(insertData)
      .select()
      .single()
    
    const fieldNews = fieldNewsData as FieldNewsRow | null

    if (error || !fieldNews) {
      console.error('❌ 현장 소식 작성 실패:', {
        error: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
      })
      return { success: false, error: error?.message || '현장 소식 작성에 실패했습니다.' }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ 현장 소식 작성 성공:', { id: fieldNews.id, title: fieldNews.title })
    }

    revalidatePath('/field')
    revalidatePath('/admin/field-news')

    return { success: true, id: fieldNews.id }
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('현장 소식 작성 오류:', error)
    }
    return { success: false, error: error.message || '알 수 없는 오류가 발생했습니다.' }
  }
}

/**
 * 현장 소식 수정 서버 액션
 */
export async function updateFieldNews(
  id: number,
  data: Partial<CreateFieldNewsData>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: '인증되지 않은 사용자입니다.' }
    }

    // 관리자 권한 확인
    const { data: profileData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const profile = profileData as Pick<UserRow, 'role'> | null

    if (profile?.role !== 'admin') {
      return { success: false, error: '관리자 권한이 필요합니다.' }
    }

    // 관리자 클라이언트로 RLS 우회하여 수정
    const adminSupabase = await createAdminClient()

    // 현장 소식 수정
    const updateData: FieldNewsUpdate = {
      title: data.title,
      content: data.content,
      location: data.location,
      installation_date: data.installation_date,
      images: data.images,
      updated_at: new Date().toISOString(),
    } as any
    
    const { error } = await (adminSupabase
      .from('field_news') as any)
      .update(updateData)
      .eq('id', id)

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('현장 소식 수정 실패:', error)
      }
      return { success: false, error: error.message }
    }

    revalidatePath('/field')
    revalidatePath('/admin/field-news')

    return { success: true }
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('현장 소식 수정 오류:', error)
    }
    return { success: false, error: error.message || '알 수 없는 오류가 발생했습니다.' }
  }
}

/**
 * 관리자용 현장 소식 목록 조회 서버 액션
 */
export async function getFieldNewsForAdmin(): Promise<{
  success: boolean
  data?: any[]
  error?: string
}> {
  try {
    const supabase = await createClient()

    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: '인증되지 않은 사용자입니다.' }
    }

    // 관리자 권한 확인
    const { data: profileData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const profile = profileData as Pick<UserRow, 'role'> | null

    if (profile?.role !== 'admin') {
      return { success: false, error: '관리자 권한이 필요합니다.' }
    }

    // 관리자 클라이언트로 RLS 우회하여 조회
    const adminSupabase = await createAdminClient()

    const { data, error } = await adminSupabase
      .from('field_news')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('현장 소식 조회 실패:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error: any) {
    console.error('현장 소식 조회 오류:', error)
    return { success: false, error: error.message || '알 수 없는 오류가 발생했습니다.' }
  }
}

/**
 * 현장 소식 발행/비발행 토글 서버 액션
 */
export async function toggleFieldNewsPublish(
  id: number,
  currentStatus: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: '인증되지 않은 사용자입니다.' }
    }

    // 관리자 권한 확인
    const { data: profileData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const profile = profileData as Pick<UserRow, 'role'> | null

    if (profile?.role !== 'admin') {
      return { success: false, error: '관리자 권한이 필요합니다.' }
    }

    // 관리자 클라이언트로 RLS 우회하여 업데이트
    const adminSupabase = await createAdminClient()

    const newStatus = !currentStatus
    const updateData: FieldNewsUpdate = {
      is_published: newStatus,
      published_at: newStatus ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }

    const { error } = await (adminSupabase
      .from('field_news') as any)
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('현장 소식 발행 상태 변경 실패:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/field')
    revalidatePath('/admin/field-news')

    return { success: true }
  } catch (error: any) {
    console.error('현장 소식 발행 상태 변경 오류:', error)
    return { success: false, error: error.message || '알 수 없는 오류가 발생했습니다.' }
  }
}

/**
 * 현장 소식 삭제 서버 액션
 */
export async function deleteFieldNews(
  id: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: '인증되지 않은 사용자입니다.' }
    }

    // 관리자 권한 확인
    const { data: profileData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const profile = profileData as Pick<UserRow, 'role'> | null

    if (profile?.role !== 'admin') {
      return { success: false, error: '관리자 권한이 필요합니다.' }
    }

    // 관리자 클라이언트로 RLS 우회하여 삭제
    const adminSupabase = await createAdminClient()

    const { error } = await adminSupabase
      .from('field_news')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('현장 소식 삭제 실패:', error)
      return { success: false, error: error.message }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ 현장 소식 삭제 성공:', { id })
    }

    revalidatePath('/field')
    revalidatePath('/admin/field-news')

    return { success: true }
  } catch (error: any) {
    console.error('현장 소식 삭제 오류:', error)
    return { success: false, error: error.message || '알 수 없는 오류가 발생했습니다.' }
  }
}

/**
 * 현장 소식 조회수 증가 서버 액션
 */
export async function incrementFieldNewsViews(
  id: number
): Promise<{ success: boolean; error?: string }> {
  try {
    // 관리자 클라이언트로 RLS 우회하여 조회수 증가
    const adminSupabase = await createAdminClient()

    // 현재 조회수 조회
    const { data: currentData } = await adminSupabase
      .from('field_news')
      .select('views')
      .eq('id', id)
      .single()

    // 타입 안전성을 위해 명시적 타입 지정
    const currentViews = (currentData as Pick<FieldNewsRow, 'views'> | null)?.views || 0

    // 조회수 증가
    const updateData: FieldNewsUpdate = {
      views: currentViews + 1,
    }
    
    const { error } = await (adminSupabase
      .from('field_news') as any)
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('조회수 증가 실패:', error)
      return { success: false, error: error.message }
    }

    revalidatePath(`/field/${id}`)
    revalidatePath('/field')

    return { success: true }
  } catch (error: any) {
    console.error('조회수 증가 오류:', error)
    return { success: false, error: error.message || '알 수 없는 오류가 발생했습니다.' }
  }
}
