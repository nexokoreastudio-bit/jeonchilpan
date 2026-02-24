'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { processReferralSignup, generateUserReferralCode } from '@/app/actions/referral'
import { Database } from '@/types/database'

type UserInsert = Database['public']['Tables']['users']['Insert']

interface SignupData {
  email: string
  password: string
  name: string
  academy_name?: string
  phone?: string
  referrer_code?: string
}

/**
 * 회원가입 서버 액션
 * 추천인 코드 처리 및 포인트 지급 포함
 */
export async function signup(data: SignupData): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // 회원가입
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          academy_name: data.academy_name || '',
          phone: data.phone || '',
          referrer_code: data.referrer_code || '',
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://jeonchilpan.netlify.app'}/auth/callback`,
      },
    })

    if (signUpError) {
      let errorMsg = signUpError.message || '알 수 없는 오류가 발생했습니다.'

      if (errorMsg.includes('rate limit')) {
        errorMsg = '이메일 전송 제한에 걸렸습니다. 잠시 후 다시 시도해주세요.'
      } else if (errorMsg.includes('invalid')) {
        errorMsg = '이메일 주소가 유효하지 않습니다.'
      } else if (errorMsg.includes('already registered')) {
        errorMsg = '이미 가입된 이메일입니다. 로그인을 시도해주세요.'
      } else if (errorMsg.includes('Email signups are disabled')) {
        errorMsg = '이메일 회원가입이 비활성화되어 있습니다.'
      }

      return { success: false, error: errorMsg }
    }

    // 회원가입 성공 시
    if (authData.user) {
      // 프로필이 생성될 때까지 잠시 대기 (트리거가 실행되도록)
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 추천인 코드가 있으면 처리
      if (data.referrer_code && data.referrer_code.trim()) {
        await processReferralSignup(authData.user.id, data.referrer_code)
      }

      // 사용자에게 고유 추천인 코드 생성
      await generateUserReferralCode(authData.user.id)
    }

    return { success: true }
  } catch (error: any) {
    console.error('회원가입 오류:', error)
    return { success: false, error: error.message || '회원가입 중 오류가 발생했습니다.' }
  }
}

