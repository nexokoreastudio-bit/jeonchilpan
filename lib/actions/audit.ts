'use server'

import { createAdminClient } from '@/lib/supabase/server'

export interface AuditLogEntry {
  admin_id: string
  admin_email: string
  action: string
  target_type?: string
  target_id?: string
  detail?: Record<string, unknown>
}

/**
 * 관리자 작업을 감사 로그에 기록합니다.
 * service role 클라이언트를 사용하므로 RLS를 우회합니다.
 */
export async function writeAuditLog(entry: AuditLogEntry) {
  try {
    const supabase = await createAdminClient()
    await (supabase.from('admin_audit_logs') as any).insert({
      admin_id: entry.admin_id,
      admin_email: entry.admin_email,
      action: entry.action,
      target_type: entry.target_type || null,
      target_id: entry.target_id || null,
      detail: entry.detail || null,
    })
  } catch {
    // 감사 로그 실패가 주 기능을 막으면 안 됨
    console.error('[audit] Failed to write audit log:', entry.action)
  }
}

/**
 * 감사 로그 조회 (관리자 대시보드용)
 */
export async function getAuditLogs(options?: {
  limit?: number
  offset?: number
  action?: string
  admin_id?: string
}) {
  const supabase = await createAdminClient()
  let query = (supabase.from('admin_audit_logs') as any)
    .select('*')
    .order('created_at', { ascending: false })

  if (options?.action) {
    query = query.eq('action', options.action)
  }
  if (options?.admin_id) {
    query = query.eq('admin_id', options.admin_id)
  }
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1)
  }

  const { data, error } = await query
  if (error) return { logs: [], error: error.message }
  return { logs: data || [], error: null }
}
