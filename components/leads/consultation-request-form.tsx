'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createConsultationRequest } from '@/app/actions/leads'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function ConsultationRequestForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const campaign = searchParams.get('campaign') || ''
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    academy_name: '',
    region: '',
    request_type: '상담신청',
    preferred_visit_date: '',
    preferred_visit_time: '',
    message: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const metaLines = [
        `[신청유형] ${formData.request_type}`,
        formData.region ? `[지역] ${formData.region}` : '',
        formData.preferred_visit_date ? `[희망일] ${formData.preferred_visit_date}` : '',
        formData.preferred_visit_time ? `[희망시간] ${formData.preferred_visit_time}` : '',
        campaign ? `[캠페인] ${campaign}` : '',
      ].filter(Boolean)

      const fullMessage = `${metaLines.join('\n')}${
        formData.message.trim() ? `\n\n[요청 메모]\n${formData.message.trim()}` : ''
      }`

      const result = await createConsultationRequest({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        academy_name: formData.academy_name || undefined,
        message: fullMessage,
      })

      if (!result.success) {
        setError(result.error || '상담 신청에 실패했습니다.')
        setLoading(false)
        return
      }

      alert('상담 신청이 완료되었습니다. 빠른 시일 내에 안내드리겠습니다.')
      router.push('/')
    } catch (err: any) {
      setError(err.message || '상담 신청 중 오류가 발생했습니다.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">이름 *</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleChange} required disabled={loading} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">이메일 *</Label>
          <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required disabled={loading} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">연락처 *</Label>
          <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required disabled={loading} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="academy_name">학원명</Label>
          <Input id="academy_name" name="academy_name" value={formData.academy_name} onChange={handleChange} disabled={loading} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="request_type">문의 유형 *</Label>
          <select
            id="request_type"
            name="request_type"
            value={formData.request_type}
            onChange={handleChange}
            disabled={loading}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="상담신청">상담신청</option>
            <option value="시연상담">시연상담</option>
            <option value="견적상담">견적상담</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="region">지역</Label>
          <Input id="region" name="region" value={formData.region} onChange={handleChange} disabled={loading} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="preferred_visit_time">희망 시간대</Label>
          <select
            id="preferred_visit_time"
            name="preferred_visit_time"
            value={formData.preferred_visit_time}
            onChange={handleChange}
            disabled={loading}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">선택하세요</option>
            <option value="오전">오전</option>
            <option value="오후">오후</option>
            <option value="협의 후 결정">협의 후 결정</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="preferred_visit_date">희망 날짜</Label>
        <Input
          id="preferred_visit_date"
          name="preferred_visit_date"
          type="date"
          value={formData.preferred_visit_date}
          onChange={handleChange}
          disabled={loading}
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">추가 요청사항</Label>
        <Textarea
          id="message"
          name="message"
          rows={4}
          value={formData.message}
          onChange={handleChange}
          disabled={loading}
          placeholder="상담 시 필요한 내용을 입력해주세요."
        />
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? '신청 중...' : '상담신청'}
      </Button>

      <p className="text-center text-xs text-gray-500">
        제출하신 정보는 상담 안내 목적으로만 사용됩니다.
      </p>
    </form>
  )
}
