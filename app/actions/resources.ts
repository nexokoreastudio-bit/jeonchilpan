'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/database'

type ResourceInsert = Database['public']['Tables']['resources']['Insert']
type ResourceUpdate = Database['public']['Tables']['resources']['Update']
type UserRow = Database['public']['Tables']['users']['Row']

/**
 * 관리자용 자료 목록 가져오기
 */
export async function getResourcesForAdmin(): Promise<{
  success: boolean
  data?: Database['public']['Tables']['resources']['Row'][]
  error?: string
}> {
  try {
    const supabase = await createClient()

    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: String('인증되지 않은 사용자입니다.') }
    }

    // Supabase user 객체를 plain object로 변환
    const plainUser = {
      id: String(user.id),
      email: user.email ? String(user.email) : null,
    }

    // 관리자 권한 확인
    const { data: profileData } = await supabase
      .from('users')
      .select('role')
      .eq('id', plainUser.id)
      .single()

    // Supabase profileData를 plain object로 변환
    const typedProfileData = profileData as { role: string | null } | null
    const plainProfile = typedProfileData ? {
      role: String(typedProfileData.role || 'user'),
    } : null

    if (plainProfile?.role !== 'admin') {
      return { success: false, error: String('관리자 권한이 필요합니다.') }
    }

    // 자료 목록 가져오기
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('자료 목록 조회 실패:', error)
      return { 
        success: false, 
        error: String(error.message || '알 수 없는 오류') 
      }
    }

    // Supabase 결과를 plain object 배열로 명시적 변환
    const allowedLevels = ['bronze', 'silver', 'gold'] as const
    type AccessLevel = typeof allowedLevels[number]
    
    const normalizeAccessLevel = (value: string | null | undefined): AccessLevel => {
      const normalized = String(value || 'bronze').toLowerCase()
      if (normalized === 'bronze' || normalized === 'silver' || normalized === 'gold') {
        return normalized as AccessLevel
      }
      return 'bronze'
    }
    
    const plainData: Database['public']['Tables']['resources']['Row'][] = (data || []).map((item: any) => ({
      id: Number(item.id),
      title: String(item.title || ''),
      description: item.description ? String(item.description) : null,
      file_url: String(item.file_url || ''),
      file_type: item.file_type || null,
      access_level: normalizeAccessLevel(item.access_level),
      download_cost: Number(item.download_cost) || 0,
      downloads_count: Number(item.downloads_count) || 0,
      thumbnail_url: item.thumbnail_url ? String(item.thumbnail_url) : null,
      created_at: String(item.created_at || ''),
      updated_at: String(item.updated_at || ''),
    }))

    // plain object로 명시적 반환
    return { 
      success: true, 
      data: plainData 
    }
  } catch (error: any) {
    console.error('자료 목록 조회 오류:', error)
    const errorMessage = error?.message || '알 수 없는 오류'
    return { 
      success: false, 
      error: String(errorMessage) 
    }
  }
}

/**
 * 파일을 Supabase Storage에 업로드
 * File 객체 대신 ArrayBuffer 데이터를 받아서 처리
 */
export async function uploadFileToStorage(
  fileData: {
    arrayBuffer: number[] // Uint8Array를 배열로 변환한 데이터
    fileName: string
    fileType: string
  }
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const supabase = await createClient()

    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: String('인증되지 않은 사용자입니다.') }
    }

    // Supabase user 객체를 plain object로 변환
    const plainUser = {
      id: String(user.id),
      email: user.email ? String(user.email) : null,
    }

    // 관리자 권한 확인
    const { data: profileData } = await supabase
      .from('users')
      .select('role')
      .eq('id', plainUser.id)
      .single()

    // Supabase profileData를 plain object로 변환
    const typedProfileData = profileData as { role: string | null } | null
    const plainProfile = typedProfileData ? {
      role: String(typedProfileData.role || 'user'),
    } : null

    if (plainProfile?.role !== 'admin') {
      return { success: false, error: String('관리자 권한이 필요합니다.') }
    }

    // 배열을 Buffer로 변환
    const buffer = Buffer.from(fileData.arrayBuffer)

    // 파일 확장자 추출
    const fileExt = fileData.fileName.split('.').pop()?.toLowerCase() || 'pdf'
    const allowedTypes = ['pdf', 'xlsx', 'hwp', 'docx', 'pptx']
    
    if (!allowedTypes.includes(fileExt)) {
      return { 
        success: false, 
        error: String(`지원하지 않는 파일 형식입니다. (${allowedTypes.join(', ')}만 가능)`) 
      }
    }

    // Content-Type 결정
    const contentTypeMap: Record<string, string> = {
      pdf: 'application/pdf',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      hwp: 'application/x-hwp',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    }

    // 고유한 파일명 생성
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 10)
    const sanitizedName = fileData.fileName
      .replace(/[^a-zA-Z0-9.-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    const fileName = `resources/${timestamp}-${randomStr}-${sanitizedName}`

    // 관리자 클라이언트로 Storage에 업로드
    const adminSupabase = await createAdminClient()

    const { data: uploadData, error: uploadError } = await adminSupabase.storage
      .from('resources')
      .upload(fileName, buffer, {
        contentType: contentTypeMap[fileExt] || 'application/octet-stream',
        upsert: false,
      })

    // uploadData는 사용하지 않으므로 변환 불필요 (에러 체크만)

    if (uploadError) {
      console.error('파일 업로드 실패:', uploadError)
      const errorMessage = uploadError?.message || '파일 업로드에 실패했습니다.'
      return { 
        success: false, 
        error: String(errorMessage) 
      }
    }

    // 공개 URL 생성
    const { data: urlData } = adminSupabase.storage
      .from('resources')
      .getPublicUrl(fileName)

    // Supabase urlData를 plain object로 변환
    const plainUrlData = urlData ? {
      publicUrl: String(urlData.publicUrl || ''),
    } : { publicUrl: '' }

    // plain object로 명시적 반환
    return { 
      success: true, 
      url: String(plainUrlData.publicUrl) 
    }
  } catch (error: any) {
    console.error('파일 업로드 오류:', error)
    const errorMessage = error?.message || '알 수 없는 오류가 발생했습니다.'
    return { 
      success: false, 
      error: String(errorMessage) 
    }
  }
}

/**
 * 자료 등록
 */
export async function createResource(
  title: string,
  description: string | null,
  fileUrl: string,
  fileType: 'pdf' | 'xlsx' | 'hwp' | 'docx' | 'pptx',
  accessLevel: 'bronze' | 'silver' | 'gold' = 'bronze',
  downloadCost: number = 0,
  thumbnailUrl: string | null = null
): Promise<{ success: boolean; resourceId?: number; error?: string }> {
  try {
    const supabase = await createClient()

    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: String('인증되지 않은 사용자입니다.') }
    }

    // Supabase user 객체를 plain object로 변환
    const plainUser = {
      id: String(user.id),
      email: user.email ? String(user.email) : null,
    }

    // 관리자 권한 확인
    const { data: profileData } = await supabase
      .from('users')
      .select('role')
      .eq('id', plainUser.id)
      .single()

    // Supabase profileData를 plain object로 변환
    const typedProfileData = profileData as { role: string | null } | null
    const plainProfile = typedProfileData ? {
      role: String(typedProfileData.role || 'user'),
    } : null

    if (plainProfile?.role !== 'admin') {
      return { success: false, error: String('관리자 권한이 필요합니다.') }
    }

    // 관리자 클라이언트로 RLS 우회하여 자료 등록
    const adminSupabase = await createAdminClient()

    // 자료 등록 (plain object로 명시적 생성)
    const resourceData = {
      title: String(title),
      description: description ? String(description) : null,
      file_url: String(fileUrl),
      file_type: fileType,
      access_level: accessLevel,
      download_cost: Number(downloadCost) || 0,
      downloads_count: 0,
      thumbnail_url: thumbnailUrl ? String(thumbnailUrl) : null,
    }

    const { data: resourceResult, error } = await adminSupabase
      .from('resources')
      .insert(resourceData as any)
      .select()
      .single()

    if (error || !resourceResult) {
      console.error('자료 등록 실패:', error)
      const errorMessage = error?.message || '자료 등록에 실패했습니다.'
      return { 
        success: false, 
        error: String(errorMessage) 
      }
    }

    // Supabase 결과를 plain object로 명시적 변환
    const typedResourceResult = resourceResult as { id: number } | null
    const plainResult = typedResourceResult ? {
      id: Number(typedResourceResult.id),
    } : null
    
    if (!plainResult) {
      return { 
        success: false, 
        error: String('자료 등록 결과를 가져올 수 없습니다.') 
      }
    }

    revalidatePath('/admin/resources')
    revalidatePath('/resources')

    // plain object로 명시적 반환
    return { 
      success: true, 
      resourceId: Number(plainResult.id) 
    }
  } catch (error: any) {
    console.error('자료 등록 오류:', error)
    const errorMessage = error?.message || '알 수 없는 오류가 발생했습니다.'
    return { 
      success: false, 
      error: String(errorMessage) 
    }
  }
}

/**
 * 자료 수정
 */
export async function updateResource(
  resourceId: number,
  title: string,
  description: string | null,
  fileUrl: string | null,
  fileType: 'pdf' | 'xlsx' | 'hwp' | 'docx' | 'pptx' | null,
  accessLevel: 'bronze' | 'silver' | 'gold',
  downloadCost: number,
  thumbnailUrl: string | null = null
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: String('인증되지 않은 사용자입니다.') }
    }

    // Supabase user 객체를 plain object로 변환
    const plainUser = {
      id: String(user.id),
      email: user.email ? String(user.email) : null,
    }

    // 관리자 권한 확인
    const { data: profileData } = await supabase
      .from('users')
      .select('role')
      .eq('id', plainUser.id)
      .single()

    // Supabase profileData를 plain object로 변환
    const typedProfileData = profileData as { role: string | null } | null
    const plainProfile = typedProfileData ? {
      role: String(typedProfileData.role || 'user'),
    } : null

    if (plainProfile?.role !== 'admin') {
      return { success: false, error: String('관리자 권한이 필요합니다.') }
    }

    // 관리자 클라이언트로 RLS 우회하여 자료 수정
    const adminSupabase = await createAdminClient()

    // 자료 수정 (plain object로 명시적 생성)
    const updateData: any = {
      title: String(title),
      description: description ? String(description) : null,
      access_level: accessLevel,
      download_cost: Number(downloadCost) || 0,
      updated_at: new Date().toISOString(),
    }

    if (fileUrl) {
      updateData.file_url = String(fileUrl)
    }
    if (fileType) {
      updateData.file_type = fileType
    }
    if (thumbnailUrl !== undefined) {
      updateData.thumbnail_url = thumbnailUrl ? String(thumbnailUrl) : null
    }

    const { error } = await adminSupabase
      .from('resources')
      .update(updateData as any as never)
      .eq('id', resourceId)

    if (error) {
      console.error('자료 수정 실패:', error)
      const errorMessage = error?.message || '자료 수정에 실패했습니다.'
      return { 
        success: false, 
        error: String(errorMessage) 
      }
    }

    revalidatePath('/admin/resources')
    revalidatePath('/resources')

    // plain object로 명시적 반환
    return { success: true }
  } catch (error: any) {
    console.error('자료 수정 오류:', error)
    const errorMessage = error?.message || '알 수 없는 오류가 발생했습니다.'
    return { 
      success: false, 
      error: String(errorMessage) 
    }
  }
}

/**
 * 자료 삭제
 */
export async function deleteResource(resourceId: number): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: String('인증되지 않은 사용자입니다.') }
    }

    // Supabase user 객체를 plain object로 변환
    const plainUser = {
      id: String(user.id),
      email: user.email ? String(user.email) : null,
    }

    // 관리자 권한 확인
    const { data: profileData } = await supabase
      .from('users')
      .select('role')
      .eq('id', plainUser.id)
      .single()

    // Supabase profileData를 plain object로 변환
    const typedProfileData = profileData as { role: string | null } | null
    const plainProfile = typedProfileData ? {
      role: String(typedProfileData.role || 'user'),
    } : null

    if (plainProfile?.role !== 'admin') {
      return { success: false, error: String('관리자 권한이 필요합니다.') }
    }

    // 관리자 클라이언트로 RLS 우회하여 자료 삭제
    const adminSupabase = await createAdminClient()

    // 자료 정보 가져오기 (파일 URL 확인용)
    const { data: resourceData } = await adminSupabase
      .from('resources')
      .select('file_url')
      .eq('id', resourceId)
      .single()

    // Supabase resourceData를 plain object로 변환
    const typedResourceData = resourceData as { file_url: string } | null
    const plainResourceData = typedResourceData ? {
      file_url: String(typedResourceData.file_url || ''),
    } : null

    // 자료 삭제
    const { error } = await adminSupabase
      .from('resources')
      .delete()
      .eq('id', resourceId)

    if (error) {
      console.error('자료 삭제 실패:', error)
      const errorMessage = error?.message || '자료 삭제에 실패했습니다.'
      return { 
        success: false, 
        error: String(errorMessage) 
      }
    }

    // Storage에서 파일도 삭제 (선택사항)
    if (plainResourceData?.file_url) {
      try {
        // 파일 경로 추출 (URL에서 파일명만 추출)
        const urlParts = plainResourceData.file_url.split('/')
        const fileName = urlParts[urlParts.length - 1]
        
        await adminSupabase.storage
          .from('resources')
          .remove([`resources/${fileName}`])
      } catch (storageError) {
        // Storage 삭제 실패해도 DB 삭제는 성공했으므로 계속 진행
        console.warn('Storage 파일 삭제 실패 (무시):', storageError)
      }
    }

    revalidatePath('/admin/resources')
    revalidatePath('/resources')

    // plain object로 명시적 반환
    return { success: true }
  } catch (error: any) {
    console.error('자료 삭제 오류:', error)
    const errorMessage = error?.message || '알 수 없는 오류가 발생했습니다.'
    return { 
      success: false, 
      error: String(errorMessage) 
    }
  }
}

/**
 * 자료 다운로드 처리 (Server Action)
 */
export async function downloadResource(
  resourceId: number
): Promise<{ success: boolean; fileUrl?: string; error?: string }> {
  try {
    const supabase = await createClient()

    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: String('인증되지 않은 사용자입니다.') }
    }

    // Supabase user 객체를 plain object로 변환
    const plainUser = {
      id: String(user.id),
      email: user.email ? String(user.email) : null,
    }

    // 자료 정보 확인
    const { data: resourceData, error: resourceError } = await supabase
      .from('resources')
      .select('*')
      .eq('id', resourceId)
      .single()

    if (resourceError || !resourceData) {
      return { 
        success: false, 
        error: String('자료를 찾을 수 없습니다.') 
      }
    }

    // plain object로 변환
    const typedResourceData = resourceData as {
      id: number
      title: string
      description: string | null
      file_url: string
      file_type: 'pdf' | 'xlsx' | 'hwp' | 'docx' | 'pptx' | null
      access_level: 'bronze' | 'silver' | 'gold'
      download_cost: number
      downloads_count: number
      thumbnail_url: string | null
    } | null
    
    if (!typedResourceData) {
      return { 
        success: false, 
        error: String('자료를 찾을 수 없습니다.') 
      }
    }
    
    const resource = {
      id: Number(typedResourceData.id),
      title: String(typedResourceData.title || ''),
      description: typedResourceData.description ? String(typedResourceData.description) : null,
      file_url: String(typedResourceData.file_url || ''),
      file_type: typedResourceData.file_type || null,
      access_level: typedResourceData.access_level || 'bronze',
      download_cost: Number(typedResourceData.download_cost) || 0,
      downloads_count: Number(typedResourceData.downloads_count) || 0,
      thumbnail_url: typedResourceData.thumbnail_url ? String(typedResourceData.thumbnail_url) : null,
    }

    // 이미 다운로드한 경우 체크
    const { data: existingDownload } = await supabase
      .from('downloads')
      .select('id')
      .eq('user_id', plainUser.id)
      .eq('resource_id', resourceId)
      .single()

    const hasDownloaded = !!existingDownload

    if (hasDownloaded) {
      return { success: true, fileUrl: String(resource.file_url || '') }
    }

    // 다운로드 이력 기록
    const newDownloadData = {
      user_id: String(plainUser.id),
      resource_id: Number(resourceId),
    }
    await supabase.from('downloads').insert(newDownloadData as any)

    // 다운로드 횟수 증가
    const updateCountData = {
      downloads_count: Number(resource.downloads_count) + 1,
    }
    await supabase
      .from('resources')
      .update(updateCountData as any as never)
      .eq('id', resourceId)

    revalidatePath('/resources')

    // plain object로 명시적 반환
    return { 
      success: true, 
      fileUrl: String(resource.file_url || '') 
    }
  } catch (error: any) {
    console.error('자료 다운로드 오류:', error)
    const errorMessage = error?.message || '알 수 없는 오류'
    return { 
      success: false, 
      error: String(errorMessage) 
    }
  }
}
