'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function FindPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const baseUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || 'https://jeonchilpan.netlify.app'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const emailTrim = email.trim().toLowerCase()
      if (!emailTrim) {
        setError('이메일을 입력해주세요.')
        setLoading(false)
        return
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(emailTrim)) {
        setError('이메일 형식이 올바르지 않습니다.')
        setLoading(false)
        return
      }

      const supabase = createClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(emailTrim, {
        redirectTo: `${baseUrl}/auth/callback?next=/login`,
      })

      if (resetError) {
        let errorMsg = resetError.message || '비밀번호 재설정 이메일 전송에 실패했습니다.'
        if (errorMsg.includes('rate limit')) {
          errorMsg = '이메일 전송 제한에 걸렸습니다. 잠시 후 다시 시도해주세요.'
        } else if (errorMsg.includes('not found') || errorMsg.includes('User not found')) {
          errorMsg = '해당 이메일로 가입된 계정이 없습니다.'
        }
        setError(errorMsg)
        setLoading(false)
        return
      }

      setSent(true)
    } catch (err: any) {
      console.error('비밀번호 찾기 오류:', err)
      setError(err?.message || '오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-center">이메일을 확인해주세요</CardTitle>
            <CardDescription className="text-center">
              {email}로 비밀번호 재설정 링크를 보내드렸습니다.
              <br />
              이메일을 확인하여 새 비밀번호를 설정해주세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  로그인 페이지로
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">비밀번호 찾기</CardTitle>
          <CardDescription className="text-center">
            가입 시 사용한 이메일을 입력하시면
            <br />
            비밀번호 재설정 링크를 보내드립니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '전송 중...' : '재설정 링크 받기'}
            </Button>

            <div className="text-center">
              <Link href="/login" className="text-sm text-muted-foreground hover:text-primary hover:underline">
                로그인으로 돌아가기
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
