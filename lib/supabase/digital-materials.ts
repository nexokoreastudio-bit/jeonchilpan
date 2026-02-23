/**
 * P2P 마켓플레이스 - digital_materials 테이블
 */

import { createClient } from '@/lib/supabase/server'

export interface DigitalMaterialWithAuthor {
  id: number
  author_id: string
  title: string
  description: string | null
  file_url: string
  thumbnail_url: string | null
  subject_category: string | null
  price: number
  downloads_count: number
  is_published: boolean
  created_at: string
  updated_at: string
  author?: {
    id: string
    nickname: string | null
  } | null
  purchased?: boolean
}

export async function getDigitalMaterials(limit = 20, offset = 0, subject?: string | null): Promise<DigitalMaterialWithAuthor[]> {
  const supabase = await createClient()

  let query = supabase
    .from('digital_materials')
    .select(`
      *,
      author:users (
        id,
        nickname
      )
    `)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (subject) {
    query = query.eq('subject_category', subject)
  }

  const { data, error } = await query

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('digital_materials 조회 실패:', error)
    }
    return []
  }

  return (data || []) as DigitalMaterialWithAuthor[]
}

export async function getDigitalMaterialById(
  id: number,
  userId?: string | null
): Promise<(DigitalMaterialWithAuthor & { purchased?: boolean }) | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('digital_materials')
    .select(`
      *,
      author:users (
        id,
        nickname
      )
    `)
    .eq('id', id)
    .eq('is_published', true)
    .single()

  if (error || !data) return null

  let purchased = false
  if (userId) {
    const { data: purchase } = await supabase
      .from('marketplace_purchases')
      .select('id')
      .eq('buyer_id', userId)
      .eq('material_id', id)
      .single()
    purchased = !!purchase
  }

  return Object.assign({}, data, { purchased }) as DigitalMaterialWithAuthor & { purchased: boolean }
}

export async function getPurchasedMaterialIds(userId: string): Promise<Set<number>> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('marketplace_purchases')
    .select('material_id')
    .eq('buyer_id', userId)
  const ids = (data || []).map((r: { material_id: number }) => r.material_id)
  return new Set(ids)
}
