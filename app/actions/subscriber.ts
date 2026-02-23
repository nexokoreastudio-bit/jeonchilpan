'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/database'

type UserRow = Database['public']['Tables']['users']['Row']
type UserUpdate = Database['public']['Tables']['users']['Update']

/**
 * 구독자 인증 서버 액션
 * 시리얼 번호를 검증하고 구독자 인증 상태를 업데이트합니다
 */
export async function verifySubscriber(
  userId: string,
  serialNumber: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user || user.id !== userId) {
      return { success: false, error: '인증되지 않은 사용자입니다.' }
    }

    // 시리얼 번호 검증 (실제로는 구매 DB와 매칭해야 함)
    // 여기서는 간단한 검증 로직 사용
    const isValidSerial = validateSerialNumber(serialNumber)
    
    if (!isValidSerial) {
      return { success: false, error: '유효하지 않은 시리얼 번호입니다.' }
    }

    // 중복 인증 확인
    const { data: existingUserData } = await supabase
      .from('users')
      .select('subscriber_verified, purchase_serial_number')
      .eq('id', userId)
      .single()

    const existingUser = existingUserData as Pick<UserRow, 'subscriber_verified' | 'purchase_serial_number'> | null

    if (existingUser?.subscriber_verified) {
      return { success: false, error: '이미 인증이 완료된 계정입니다.' }
    }

    // 시리얼 번호 중복 확인 (다른 사용자가 이미 사용한 경우)
    const { data: existingSerial } = await supabase
      .from('users')
      .select('id')
      .eq('purchase_serial_number', serialNumber)
      .neq('id', userId)
      .single()

    if (existingSerial) {
      return { success: false, error: '이미 사용된 시리얼 번호입니다.' }
    }

    // 구독자 인증 업데이트
    const updateData: UserUpdate = {
      subscriber_verified: true,
      purchase_serial_number: serialNumber,
      verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    const { error: updateError } = await supabase
      .from('users')
      .update(updateData as any as never)
      .eq('id', userId)

    if (updateError) {
      console.error('구독자 인증 업데이트 실패:', updateError)
      return { success: false, error: '인증 처리 중 오류가 발생했습니다.' }
    }

    // 캐시 무효화
    revalidatePath('/mypage')

    return { success: true }
  } catch (error: any) {
    console.error('구독자 인증 오류:', error)
    return { success: false, error: error.message || '알 수 없는 오류가 발생했습니다.' }
  }
}

/**
 * 시리얼 번호 검증 함수
 * 실제로는 구매 DB와 매칭해야 함
 */
function validateSerialNumber(serial: string): boolean {
  // 기본 형식 검증: NEXO-YYYY-XXXX-XXXX 또는 유사한 형식
  const serialPattern = /^NEXO-?\d{4}-?[A-Z0-9]{4}-?[A-Z0-9]{4}$/i
  return serialPattern.test(serial.trim())
}

/**
 * 구독자 인증 상태 조회
 * requestPending: 인증글을 작성했으나 아직 승인 전
 */
export async function getSubscriberStatus(userId: string) {
  try {
    const supabase = await createClient()

    const [userResult, postResult] = await Promise.all([
      supabase
        .from('users')
        .select('subscriber_verified, purchase_serial_number, verified_at')
        .eq('id', userId)
        .single(),
      supabase
        .from('posts')
        .select('id, created_at')
        .eq('board_type', 'verification')
        .eq('author_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])

    if (userResult.error) {
      return { verified: false, error: userResult.error.message }
    }

    const data = userResult.data as {
      subscriber_verified?: boolean
      purchase_serial_number?: string | null
      verified_at?: string | null
    } | null

    const verificationPost = postResult.data as { id: number; created_at: string } | null

    return {
      verified: data?.subscriber_verified || false,
      serialNumber: data?.purchase_serial_number || null,
      verifiedAt: data?.verified_at || null,
      requestPending: !data?.subscriber_verified && !!verificationPost,
      requestedAt: verificationPost?.created_at || null,
    }
  } catch (error: any) {
    return { verified: false, error: error.message }
  }
}

/**
 * 구독자 인증 요청 - 인증글 작성 페이지로 리다이렉트 (클라이언트에서 처리)
 */
export async function requestSubscriberVerification(_userId: string): Promise<{ success: boolean; error?: string }> {
  return { success: true }
}

/**
 * 관리자용: 사용자 구독자 상태 설정
 */
export async function setSubscriberStatus(
  targetUserId: string,
  verified: boolean,
  serialNumber?: string
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

    const typedProfileData = profileData as { role: string | null } | null
    if (typedProfileData?.role !== 'admin') {
      return { success: false, error: '관리자 권한이 필요합니다.' }
    }

    // 관리자 클라이언트로 RLS 우회하여 업데이트
    const adminSupabase = await createAdminClient()

    const updateData: any = {
      subscriber_verified: verified,
      verified_at: verified ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }

    if (serialNumber) {
      updateData.purchase_serial_number = serialNumber
    }

    const { error: updateError } = await adminSupabase
      .from('users')
      .update(updateData as any as never)
      .eq('id', targetUserId)

    if (updateError) {
      console.error('구독자 상태 업데이트 실패:', updateError)
      return { success: false, error: '구독자 상태 업데이트 중 오류가 발생했습니다.' }
    }

    // 캐시 무효화 (승인된 사용자의 마이페이지도 무효화)
    revalidatePath('/admin/users')
    revalidatePath('/mypage')
    revalidatePath(`/mypage`, 'layout') // 레이아웃 캐시도 무효화

    return { success: true }
  } catch (error: any) {
    console.error('구독자 상태 설정 오류:', error)
    return { success: false, error: error.message || '알 수 없는 오류가 발생했습니다.' }
  }
}

/**
 * 관리자용: 사용자 목록 조회
 */
export async function getUsersList(searchQuery?: string) {
  try {
    const supabase = await createClient()

    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: '인증되지 않은 사용자입니다.', data: [] }
    }

    // 관리자 권한 확인
    const { data: profileData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const typedProfileData = profileData as { role: string | null } | null
    if (typedProfileData?.role !== 'admin') {
      return { success: false, error: '관리자 권한이 필요합니다.', data: [] }
    }

    // 사용자 목록 조회
    // 관리자는 Service Role Key를 사용하여 RLS 우회
    const { createAdminClient } = await import('@/lib/supabase/server')
    const adminSupabase = await createAdminClient()
    
    const userColumns = 'id, email, nickname, subscriber_verified, purchase_serial_number, verified_at, created_at'

    // 인증글 작성한 사용자 ID 목록 (승인 대기)
    const { data: verificationAuthors } = await adminSupabase
      .from('posts')
      .select('author_id')
      .eq('board_type', 'verification')
    const verificationAuthorIds = new Set(
      (verificationAuthors || []).map((p: { author_id: string | null }) => p.author_id).filter(Boolean) as string[]
    )

    let query = adminSupabase
      .from('users')
      .select(userColumns)
      .order('created_at', { ascending: false })
      .limit(100)

    if (searchQuery && searchQuery.trim()) {
      const searchTerm = `%${searchQuery.trim()}%`
      const emailQuery = adminSupabase
        .from('users')
        .select(userColumns)
        .ilike('email', searchTerm)
        .order('created_at', { ascending: false })
        .limit(100)
      
      const nicknameQuery = adminSupabase
        .from('users')
        .select(userColumns)
        .ilike('nickname', searchTerm)
        .order('created_at', { ascending: false })
        .limit(100)
      
      const [emailResult, nicknameResult] = await Promise.all([
        emailQuery,
        nicknameQuery
      ])
      
      // 결과 합치기 (중복 제거)
      const emailUsers = (emailResult.data || []) as any[]
      const nicknameUsers = (nicknameResult.data || []) as any[]
      const allUsers = [...emailUsers, ...nicknameUsers]
      
      // 중복 제거 (id 기준)
      const uniqueUsers = Array.from(
        new Map(allUsers.map(user => [user.id, user])).values()
      )
      
      // 정렬 (최신순)
      uniqueUsers.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime()
        const dateB = new Date(b.created_at || 0).getTime()
        return dateB - dateA
      })
      
      // 타입 변환
      const users = uniqueUsers.slice(0, 100).map((user: any) => {
        const hasVerificationPost = verificationAuthorIds.has(String(user.id))
        return {
          id: String(user.id || ''),
          email: user.email ? String(user.email) : null,
          nickname: user.nickname ? String(user.nickname) : null,
          subscriber_verified: Boolean(user.subscriber_verified),
          purchase_serial_number: user.purchase_serial_number ? String(user.purchase_serial_number) : null,
          verified_at: user.verified_at ? String(user.verified_at) : null,
          subscriber_verification_request: hasVerificationPost && !user.subscriber_verified,
          verification_requested_at: null as string | null,
          created_at: String(user.created_at || ''),
        }
      })

      return { success: true, data: users }
    }

    const { data: usersData, error } = await query

    if (error) {
      console.error('사용자 목록 조회 실패:', error)
      return { success: false, error: error.message, data: [] }
    }

    const users = (usersData || []).map((user: any) => {
      const hasVerificationPost = verificationAuthorIds.has(String(user.id))
      return {
        id: String(user.id || ''),
        email: user.email ? String(user.email) : null,
        nickname: user.nickname ? String(user.nickname) : null,
        subscriber_verified: Boolean(user.subscriber_verified),
        purchase_serial_number: user.purchase_serial_number ? String(user.purchase_serial_number) : null,
        verified_at: user.verified_at ? String(user.verified_at) : null,
        subscriber_verification_request: hasVerificationPost && !user.subscriber_verified,
        verification_requested_at: null as string | null,
        created_at: String(user.created_at || ''),
      }
    })

    return { success: true, data: users }
  } catch (error: any) {
    console.error('사용자 목록 조회 오류:', error)
    return { success: false, error: error.message || '알 수 없는 오류가 발생했습니다.', data: [] }
  }
}

