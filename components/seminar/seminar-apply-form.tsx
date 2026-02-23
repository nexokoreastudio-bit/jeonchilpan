'use client'

import { useState } from 'react'
import { applySeminar } from '@/app/actions/seminar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface SeminarApplyFormProps {
  seminarId: number
}

export function SeminarApplyForm({ seminarId }: SeminarApplyFormProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = e.currentTarget
    const formData = new FormData(form)

    const result = await applySeminar(seminarId, {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: (formData.get('phone') as string) || undefined,
      academy_name: (formData.get('academy_name') as string) || undefined,
      message: (formData.get('message') as string) || undefined,
    })

    setLoading(false)

    if (result.success) {
      setSuccess(true)
    } else {
      setError(result.error || '신청에 실패했습니다.')
    }
  }

  if (success) {
    return (
      <div className="p-8 bg-green-50 border border-green-200 text-center">
        <p className="text-green-800 font-semibold text-lg">
          신청이 완료되었습니다.
        </p>
        <p className="text-green-700 text-sm mt-2">
          확인 후 연락드리겠습니다.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      <div>
        <Label htmlFor="name">이름 *</Label>
        <Input
          id="name"
          name="name"
          required
          className="mt-2 rounded-none"
          placeholder="이름을 입력하세요"
        />
      </div>
      <div>
        <Label htmlFor="email">이메일 *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          className="mt-2 rounded-none"
          placeholder="email@example.com"
        />
      </div>
      <div>
        <Label htmlFor="phone">연락처</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          className="mt-2 rounded-none"
          placeholder="010-0000-0000"
        />
      </div>
      <div>
        <Label htmlFor="academy_name">학원명</Label>
        <Input
          id="academy_name"
          name="academy_name"
          className="mt-2 rounded-none"
          placeholder="학원명 (선택)"
        />
      </div>
      <div>
        <Label htmlFor="message">메시지</Label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className="mt-2 w-full p-3 border border-input rounded-md bg-background text-sm"
          placeholder="궁금한 점이나 요청사항을 입력하세요 (선택)"
        />
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200 text-sm">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-nexo-navy hover:bg-nexo-navy/90 rounded-none font-semibold py-6"
      >
        {loading ? '처리 중...' : '신청하기'}
      </Button>
    </form>
  )
}
