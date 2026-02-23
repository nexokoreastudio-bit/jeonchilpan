'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

/**
 * 아이디 찾기 - 이메일 기반 로그인에서는 이메일이 아이디입니다.
 */
export default function FindIdPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-center">아이디 찾기</CardTitle>
          <CardDescription className="text-center">
            NEXO Daily는 이메일로 로그인합니다.
            <br />
            <strong>이메일 주소가 아이디</strong>입니다.
            <br />
            <br />
            이메일을 잊으셨다면, 가입 시 사용한 이메일을 확인하시거나
            <br />
            비밀번호 찾기를 이용해 보세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link href="/find-password">
            <Button className="w-full">비밀번호 찾기</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="w-full">
              로그인으로 돌아가기
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
