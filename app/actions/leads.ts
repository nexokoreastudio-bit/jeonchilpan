'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { writeAuditLog } from '@/lib/actions/audit'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/database'

type LeadInsert = Database['public']['Tables']['leads']['Insert']
type LeadUpdate = Database['public']['Tables']['leads']['Update']

interface DemoRequestData {
  name: string
  email: string
  phone: string
  academy_name?: string
  region: string
  message?: string
  referrer_code?: string
  preferred_visit_date?: string
  preferred_visit_time?: string
}

interface QuoteRequestData {
  name: string
  email: string
  phone: string
  academy_name?: string
  region: string
  size: string
  mount_type: string
  quantity?: number
  message?: string
  referrer_code?: string
}

interface ConsultationRequestData {
  name: string
  email: string
  phone?: string
  academy_name?: string
  region?: string
  message?: string
  referrer_code?: string
}

/**
 * 상담 신청 리드 생성
 */
export async function createDemoRequest(
  data: DemoRequestData
): Promise<{ success: boolean; error?: string; leadId?: number }> {
  try {
    const supabase = await createClient()

    const leadData: LeadInsert = {
      type: 'demo',
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      academy_name: data.academy_name || null,
      region: data.region,
      message: data.message || null,
      referrer_code: data.referrer_code || null, // 시연 예약에서는 미사용
      status: 'pending',
    }

    const { data: lead, error } = await (supabase
      .from('leads') as any)
      .insert(leadData)
      .select()
      .single()

    if (error) {
      console.error('상담 신청 리드 생성 실패:', error)
      return { success: false, error: '상담 신청 처리 중 오류가 발생했습니다.' }
    }

    // 관리자 페이지 캐시 무효화
    revalidatePath('/admin/leads')

    return { success: true, leadId: lead?.id }
  } catch (error: any) {
    console.error('상담 신청 오류:', error)
    return { success: false, error: error.message || '알 수 없는 오류가 발생했습니다.' }
  }
}

/**
 * 상담 스크립트 생성기 등 consultation 리드 생성
 */
export async function createConsultationRequest(
  data: ConsultationRequestData
): Promise<{ success: boolean; error?: string; leadId?: number }> {
  try {
    const supabase = await createClient()

    const leadData: LeadInsert = {
      type: 'consultation',
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      academy_name: data.academy_name || null,
      region: data.region || null,
      message: data.message || null,
      referrer_code: data.referrer_code || null,
      status: 'pending',
    }

    const { data: lead, error } = await (supabase
      .from('leads') as any)
      .insert(leadData)
      .select()
      .single()

    if (error) {
      console.error('상담 리드 생성 실패:', error)
      return { success: false, error: '처리 중 오류가 발생했습니다.' }
    }

    revalidatePath('/admin/leads')
    return { success: true, leadId: lead?.id }
  } catch (error: any) {
    console.error('상담 리드 오류:', error)
    return { success: false, error: error.message || '알 수 없는 오류가 발생했습니다.' }
  }
}

/**
 * 견적 요청 리드 생성
 */
export async function createQuoteRequest(
  data: QuoteRequestData
): Promise<{ success: boolean; error?: string; leadId?: number }> {
  try {
    const supabase = await createClient()

    const leadData: LeadInsert = {
      type: 'quote',
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      academy_name: data.academy_name || null,
      region: data.region,
      size: data.size || null,
      mount_type: data.mount_type || null,
      quantity: data.quantity || null,
      message: data.message || null,
      referrer_code: data.referrer_code || null,
      status: 'pending',
    }

    const { data: lead, error } = await (supabase
      .from('leads') as any)
      .insert(leadData)
      .select()
      .single()

    if (error) {
      console.error('견적 요청 리드 생성 실패:', error)
      return { success: false, error: '견적 요청 처리 중 오류가 발생했습니다.' }
    }

    // 관리자 페이지 캐시 무효화
    revalidatePath('/admin/leads')

    return { success: true, leadId: lead?.id }
  } catch (error: any) {
    console.error('견적 요청 오류:', error)
    return { success: false, error: error.message || '알 수 없는 오류가 발생했습니다.' }
  }
}

/**
 * 리드 상태 업데이트 (관리자용)
 */
export async function updateLeadStatus(
  leadId: number,
  status: 'pending' | 'in_consultation' | 'contacted' | 'demo_completed' | 'quote_completed' | 'consultation_completed' | 'completed' | 'cancelled',
  adminNotes?: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // 관리자 권한 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    const { data: profileData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const profile = profileData as { role: string | null } | null
    if (profile?.role !== 'admin') {
      return { success: false, error: '관리자 권한이 필요합니다.' }
    }

    // 리드 상태 업데이트
    const updateData: LeadUpdate = {
      status,
      admin_notes: adminNotes || null,
      updated_at: new Date().toISOString(),
    }

    const { error } = await (supabase
      .from('leads') as any)
      .update(updateData)
      .eq('id', leadId)

    if (error) {
      console.error('리드 상태 업데이트 실패:', error)
      return { success: false, error: '상태 업데이트에 실패했습니다.' }
    }

    // 감사 로그
    writeAuditLog({
      admin_id: user.id,
      admin_email: user.email || '',
      action: 'lead.status_update',
      target_type: 'lead',
      target_id: String(leadId),
      detail: { status, admin_notes: adminNotes || null },
    })

    // 관리자 페이지 캐시 무효화
    revalidatePath('/admin/leads')

    return { success: true }
  } catch (error: any) {
    console.error('리드 상태 업데이트 오류:', error)
    return { success: false, error: error.message || '알 수 없는 오류가 발생했습니다.' }
  }
}

/**
 * 리드별 상태 변경 이력 조회 (감사 로그에서)
 */
export async function getLeadAuditHistory(leadId: number) {
  try {
    const supabase = await createAdminClient()
    const { data, error } = await (supabase
      .from('admin_audit_logs') as any)
      .select('*')
      .eq('action', 'lead.status_update')
      .eq('target_id', String(leadId))
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) return []
    return data || []
  } catch {
    return []
  }
}
