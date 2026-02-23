'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createDemoRequest } from '@/app/actions/leads'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function DemoRequestForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    academy_name: '',
    region: '',
    preferred_visit_date: '',
    preferred_visit_time: '',
    message: '',
  })

  const TIME_SLOTS = [
    { value: '', label: '선택하세요' },
    { value: '오전 10시~12시', label: '오전 10시~12시' },
    { value: '오후 2시~4시', label: '오후 2시~4시' },
    { value: '오후 4시~6시', label: '오후 4시~6시' },
    { value: '협의 후 결정', label: '협의 후 결정' },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const visitInfo = `[시연 예약] 희망 방문일: ${formData.preferred_visit_date} / 희망 시간대: ${formData.preferred_visit_time}`
    const fullMessage = formData.message.trim()
      ? `${visitInfo}\n\n추가 요청사항: ${formData.message}`
      : visitInfo

    try {
      const result = await createDemoRequest({
        ...formData,
        message: fullMessage,
        referrer_code: undefined,
      })

      if (!result.success) {
        setError(result.error || '예약 신청에 실패했습니다.')
        setLoading(false)
        return
      }

      // 성공 시 감사 페이지로 이동
      alert('시연 예약 신청이 완료되었습니다! 🎉\n빠른 시일 내에 연락드려 방문 일정을 안내해 드리겠습니다.')
      router.push('/')
    } catch (err: any) {
      setError(err.message || '예약 신청 중 오류가 발생했습니다.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">이름 *</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="홍길동"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">연락처 *</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="010-0000-0000"
            value={formData.phone}
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
            placeholder="학원명 (선택사항)"
            value={formData.academy_name}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="region">지역 *</Label>
        <Input
          id="region"
          name="region"
          type="text"
          placeholder="예: 서울 노원구"
          value={formData.region}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="preferred_visit_date">방문 희망 날짜 *</Label>
          <Input
            id="preferred_visit_date"
            name="preferred_visit_date"
            type="date"
            value={formData.preferred_visit_date}
            onChange={handleChange}
            required
            disabled={loading}
            min={new Date().toISOString().split('T')[0]}
          />
          <p className="text-xs text-gray-500">
            쇼룸 방문 희망일을 선택해주세요
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferred_visit_time">방문 희망 시간대 *</Label>
          <select
            id="preferred_visit_time"
            name="preferred_visit_time"
            value={formData.preferred_visit_time}
            onChange={handleChange}
            required
            disabled={loading}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {TIME_SLOTS.map((slot) => (
              <option key={slot.value} value={slot.value}>
                {slot.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">추가 요청사항</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="특별히 안내해 주실 사항이 있으면 입력해주세요"
          value={formData.message}
          onChange={handleChange}
          rows={4}
          disabled={loading}
        />
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? '신청 중...' : '시연 예약 신청'}
      </Button>

      <p className="text-xs text-center text-gray-500">
        제출하신 정보는 쇼룸 방문 예약 및 안내 목적으로만 사용됩니다.
      </p>
    </form>
  )
}

