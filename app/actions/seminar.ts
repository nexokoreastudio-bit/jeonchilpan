'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * 세미나 신청
 */
export async function applySeminar(
  seminarId: number,
  data: {
    name: string
    email: string
    phone?: string
    academy_name?: string
    message?: string
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const { error } = await (supabase as any).from('seminar_applications').insert({
      seminar_id: seminarId,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      academy_name: data.academy_name || null,
      message: data.message || null,
      status: 'pending',
    })

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: '이미 해당 세미나에 신청하셨습니다.' }
      }
      console.error('세미나 신청 실패:', error)
      return { success: false, error: '신청 처리 중 오류가 발생했습니다.' }
    }

    revalidatePath(`/seminar/${seminarId}`)
    revalidatePath('/seminar')

    return { success: true }
  } catch (error: any) {
    console.error('세미나 신청 오류:', error)
    return { success: false, error: error.message || '알 수 없는 오류가 발생했습니다.' }
  }
}
