'use server'

import { createClient } from '@/lib/supabase/server'

interface QuizLeadInput {
  quizType: string
  resultType: string
  resultSummary: Record<string, unknown>
  email: string
  name: string
}

export async function submitQuizLead(input: QuizLeadInput): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = (await createClient()) as any
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('quiz_leads')
      .insert({
        quiz_type: input.quizType,
        result_type: input.resultType,
        result_summary: input.resultSummary,
        email: input.email,
        name: input.name,
        user_id: user?.id ?? null,
      } as any)
      .select()
      .single()

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('quiz_leads insert error:', error)
      }
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (e: any) {
    console.error('submitQuizLead error:', e)
    return { success: false, error: e?.message || '오류가 발생했습니다.' }
  }
}
