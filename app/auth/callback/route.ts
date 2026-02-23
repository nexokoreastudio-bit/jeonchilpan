import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Supabase 인증 콜백 (회원가입 확인, 비밀번호 재설정 등)
 * Supabase 이메일 링크 클릭 시 이 경로로 리다이렉트됨
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next')?.startsWith('/')
    ? requestUrl.searchParams.get('next')!
    : '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent(error.message)}`)
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}${next}`)
}
