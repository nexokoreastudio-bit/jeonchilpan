'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createMaterial(params: {
  userId: string
  title: string
  description: string | null
  fileUrl: string
  subjectCategory: string | null
  price: number
}): Promise<{ success: boolean; materialId?: number; error?: string }> {
  try {
    const supabase = (await createClient()) as any
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== params.userId) {
      return { success: false, error: '인증되지 않은 사용자입니다.' }
    }

    const insertData = {
      author_id: params.userId,
      title: params.title,
      description: params.description,
      file_url: params.fileUrl,
      subject_category: params.subjectCategory,
      price: params.price,
      is_published: true,
    }
    const { data, error } = await supabase
      .from('digital_materials')
      .insert(insertData)
      .select('id')
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/marketplace')
    return { success: true, materialId: (data as { id: number }).id }
  } catch (e: any) {
    console.error('createMaterial error:', e)
    return { success: false, error: e?.message || '등록에 실패했습니다.' }
  }
}

export async function purchaseMaterial(
  materialId: number,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = (await createClient()) as any

    const { data: material, error: matError } = await supabase
      .from('digital_materials')
      .select('id, price, author_id, downloads_count')
      .eq('id', materialId)
      .single()

    if (matError || !material) {
      return { success: false, error: '자료를 찾을 수 없습니다.' }
    }

    const price = (material as { price: number }).price
    if (price === 0) {
      return { success: false, error: '무료 자료는 구매할 수 없습니다. 직접 다운로드해 주세요.' }
    }

    if ((material as { author_id: string }).author_id === userId) {
      return { success: false, error: '본인이 등록한 자료입니다.' }
    }

    const { data: profile } = await supabase.from('users').select('point').eq('id', userId).single()
    const userPoint = (profile as { point?: number } | null)?.point ?? 0

    if (userPoint < price) {
      return { success: false, error: `포인트가 부족합니다. (보유: ${userPoint}P, 필요: ${price}P)` }
    }

    const { error: purchaseError } = await supabase
      .from('marketplace_purchases')
      .insert({
        buyer_id: userId,
        material_id: materialId,
        price_paid: price,
      } as any)

    if (purchaseError) {
      if (purchaseError.code === '23505') {
        return { success: false, error: '이미 구매한 자료입니다.' }
      }
      return { success: false, error: purchaseError.message }
    }

    await supabase.from('users').update({ point: userPoint - price } as any).eq('id', userId)
    await supabase.from('point_logs').insert({
      user_id: userId,
      amount: -price,
      reason: 'marketplace_purchase',
      related_id: materialId,
      related_type: 'marketplace',
    } as any)

    const authorId = (material as { author_id: string }).author_id
    const { data: authorProfile } = await supabase.from('users').select('point').eq('id', authorId).single()
    const authorPoint = (authorProfile as { point?: number } | null)?.point ?? 0
    await supabase.from('users').update({ point: authorPoint + price } as any).eq('id', authorId)
    await supabase.from('point_logs').insert({
      user_id: authorId,
      amount: price,
      reason: 'marketplace_sale',
      related_id: materialId,
      related_type: 'marketplace',
    } as any)

    const currentDownloads = (material as { downloads_count?: number }).downloads_count ?? 0
    await supabase
      .from('digital_materials')
      .update({ downloads_count: currentDownloads + 1, updated_at: new Date().toISOString() })
      .eq('id', materialId)

    revalidatePath('/marketplace')
    revalidatePath('/mypage')
    return { success: true }
  } catch (e: any) {
    console.error('purchaseMaterial error:', e)
    return { success: false, error: e?.message || '구매 처리 중 오류가 발생했습니다.' }
  }
}
