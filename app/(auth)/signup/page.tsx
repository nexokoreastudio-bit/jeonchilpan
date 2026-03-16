'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { isWebView, WEBVIEW_MESSAGE } from '@/lib/utils/is-webview'
import { signup } from '@/app/actions/signup'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { normalizeReferralCode } from '@/lib/utils/referral'
import { LEGAL_VERSION, nowIsoString } from '@/lib/legal'

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    name: '',
    academy_name: '',
    phone: '',
    referrer_code: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [inWebView, setInWebView] = useState(false)
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    marketing: false,
  })

  useEffect(() => {
    if (typeof window !== 'undefined') setInWebView(isWebView())
  }, [])

  // URL 파라미터에서 추천인 코드 읽기
  useEffect(() => {
    const refCode = searchParams.get('ref')
    if (refCode) {
      const normalizedCode = normalizeReferralCode(refCode)
      setFormData(prev => ({ ...prev, referrer_code: normalizedCode }))
    }
  }, [searchParams])

  const handleGoogleSignup = async () => {
    if (typeof window !== 'undefined' && isWebView()) {
      alert(WEBVIEW_MESSAGE)
      return
    }
    setError('')
    setLoading(true)
    try {
      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback`
          : `${process.env.NEXT_PUBLIC_APP_URL || 'https://jeonchilpan.netlify.app'}/auth/callback`
      const supabase = createClient()
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      })
      if (oauthError) {
        setError(oauthError.message || '구글 로그인에 실패했습니다.')
        setLoading(false)
      }
    } catch (err: any) {
      setError(err?.message || '구글 로그인 중 오류가 발생했습니다.')
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 비밀번호 확인
      if (formData.password !== formData.passwordConfirm) {
        setError('비밀번호가 일치하지 않습니다.')
        setLoading(false)
        return
      }

      // 비밀번호 길이 확인
      if (formData.password.length < 6) {
        setError('비밀번호는 최소 6자 이상이어야 합니다.')
        setLoading(false)
        return
      }

      // 서버 액션으로 회원가입 처리 (추천인 코드 처리 포함)
      const result = await signup({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        academy_name: formData.academy_name || '',
        phone: formData.phone || '',
        referrer_code: formData.referrer_code || '',
        terms_agreed: agreements.terms,
        privacy_agreed: agreements.privacy,
        marketing_agreed: agreements.marketing,
        consent_version: `${LEGAL_VERSION.terms}|${LEGAL_VERSION.privacy}`,
        consented_at: nowIsoString(),
      })

      if (!result.success) {
        setError(result.error || '회원가입에 실패했습니다.')
        setLoading(false)
        return
      }

      // 회원가입 성공
      alert('회원가입이 완료되었습니다! 🎉\n이메일을 확인하여 계정을 활성화해주세요.')
      router.push('/login')
    } catch (err: any) {
      setError(err.message || '회원 가입 중 오류가 발생했습니다.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">회원가입</CardTitle>
          <CardDescription className="text-center">
            NEXO Daily에 가입하고 다양한 혜택을 받아보세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">이메일 *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호 *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="최소 6자 이상"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">비밀번호 확인 *</Label>
              <Input
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
                value={formData.passwordConfirm}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">이름 *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="이름을 입력하세요"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="academy_name">학원명</Label>
              <Input
                id="academy_name"
                name="academy_name"
                type="text"
                placeholder="소속 학원명 (선택사항)"
                value={formData.academy_name}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">연락처</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="010-0000-0000 (선택사항)"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <input type="hidden" name="referrer_code" value={formData.referrer_code} readOnly />

            <div className="rounded-md border border-slate-200 p-3 space-y-2 text-xs text-slate-600">
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={agreements.terms}
                  onChange={(e) => setAgreements((prev) => ({ ...prev, terms: e.target.checked }))}
                  disabled={loading}
                  className="mt-0.5"
                  required
                />
                <span>
                  [필수] <Link href="/terms" target="_blank" className="underline">이용약관</Link>에 동의합니다.
                </span>
              </label>
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={agreements.privacy}
                  onChange={(e) => setAgreements((prev) => ({ ...prev, privacy: e.target.checked }))}
                  disabled={loading}
                  className="mt-0.5"
                  required
                />
                <span>
                  [필수] <Link href="/privacy" target="_blank" className="underline">개인정보처리방침</Link>에 동의합니다.
                </span>
              </label>
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={agreements.marketing}
                  onChange={(e) => setAgreements((prev) => ({ ...prev, marketing: e.target.checked }))}
                  disabled={loading}
                  className="mt-0.5"
                />
                <span>[선택] 마케팅 정보 수신에 동의합니다.</span>
              </label>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '가입 중...' : '회원가입'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">또는</span>
              </div>
            </div>

            {inWebView && (
              <div className="p-3 text-xs bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
                ⚠️ 인앱 브라우저에서는 Google 로그인이 차단됩니다. Chrome 또는 Safari에서 접속해 주세요.
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={loading}
              onClick={handleGoogleSignup}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.18H12v4.16h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google로 가입하기
            </Button>

            <div className="text-center text-sm">
              이미 계정이 있으신가요?{' '}
              <Link href="/login" className="text-primary hover:underline">
                로그인
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
