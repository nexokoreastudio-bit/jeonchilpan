/**
 * 세미나 관련 Supabase 쿼리
 */

import { createClient } from '@/lib/supabase/server'

export type SeminarRow = {
  id: number
  title: string
  description: string | null
  format: 'offline' | 'online' | 'vod'
  status: 'recruiting' | 'closed' | 'completed'
  access_type: 'free' | 'point' | 'gold'
  point_cost: number
  thumbnail_url: string | null
  event_date: string | null
  location: string | null
  max_participants: number | null
  created_at: string
  updated_at: string
}

export async function getSeminars(): Promise<SeminarRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('seminars')
    .select('*')
    .order('event_date', { ascending: true, nullsFirst: false })

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('세미나 조회 실패:', error)
    }
    return []
  }

  return (data || []) as SeminarRow[]
}

export async function getSeminarById(id: number): Promise<SeminarRow | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('seminars')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data as SeminarRow
}
