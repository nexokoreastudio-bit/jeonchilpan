'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createConsultationRequest } from '@/app/actions/leads'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle2, Loader2 } from 'lucide-react'

type ConsultationRequestType = '상담신청' | '시연상담' | '견적상담'

interface ConsultationRequestFormProps {
  initialRequestType?: ConsultationRequestType
  sourceLabel?: string
}

export function ConsultationRequestForm({
  initialRequestType = '상담신청',
  sourceLabel,
}: ConsultationRequestFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const campaign = searchParams.get('campaign') || ''
  const typeFromQuery = searchParams.get('type')
  const normalizedType =
    typeFromQuery === 'demo'
      ? '시연상담'
      : typeFromQuery === 'quote'
        ? '견적상담'
        : initialRequestType
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    academy_name: '',
    region: '',
    request_type: normalizedType,
    preferred_visit_date: '',
    preferred_visit_time: '',
    message: '',
  })

  useEffect(() => {
    setFormData((prev) => ({ ...prev, request_type: normalizedType }))
  }, [normalizedType])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const metaLines = [
        `[신청유형] ${formData.request_type}`,
        sourceLabel ? `[유입페이지] ${sourceLabel}` : '',
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
        region: formData.region || undefined,
        message: fullMessage,
        referrer_code: campaign || sourceLabel || undefined,
      })

      if (!result.success) {
        setError(result.error || '상담 신청에 실패했습니다.')
        setLoading(false)
        return
      }

      setSuccess(true)
      setLoading(false)
    } catch (err: any) {
      setError(err.message || '상담 신청 중 오류가 발생했습니다.')
      setLoading(false)
    }
  }

  // 성공 화면
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-[#00c4b4]/10 flex items-center justify-center mb-5">
          <CheckCircle2 className="w-8 h-8 text-[#00c4b4]" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">상담 신청이 완료되었습니다</h3>
        <p className="text-sm text-slate-500 mb-1">영업일 1일 이내 담당자가 연락드리겠습니다.</p>
        <p className="text-xs text-slate-400 mb-6">
          {formData.name}님, {formData.phone || formData.email}로 안내드립니다.
        </p>
        <Button variant="outline" onClick={() => router.push('/')}>
          홈으로 돌아가기
        </Button>
      </div>
    )
  }

  const inputClass = 'transition-colors focus:border-[#00c4b4] focus:ring-1 focus:ring-[#00c4b4]/30'
  const selectClass = `flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${inputClass}`

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 animate-fade-in">
          {error}
        </div>
      )}

      {/* 필수 정보 */}
      <fieldset className="space-y-4">
        <legend className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">필수 정보</legend>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">이름 <span className="text-red-400">*</span></Label>
            <Input id="name" name="name" placeholder="홍길동" value={formData.name} onChange={handleChange} required disabled={loading} className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">연락처 <span className="text-red-400">*</span></Label>
            <Input id="phone" name="phone" type="tel" placeholder="010-0000-0000" value={formData.phone} onChange={handleChange} required disabled={loading} className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="email">이메일 <span className="text-red-400">*</span></Label>
            <Input id="email" name="email" type="email" placeholder="example@email.com" value={formData.email} onChange={handleChange} required disabled={loading} className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="academy_name">학원명</Label>
            <Input id="academy_name" name="academy_name" placeholder="OO학원" value={formData.academy_name} onChange={handleChange} disabled={loading} className={inputClass} />
          </div>
        </div>
      </fieldset>

      {/* 상담 정보 */}
      <fieldset className="space-y-4">
        <legend className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">상담 정보</legend>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="request_type">문의 유형 <span className="text-red-400">*</span></Label>
            <select id="request_type" name="request_type" value={formData.request_type} onChange={handleChange} disabled={loading} className={selectClass}>
              <option value="상담신청">상담신청</option>
              <option value="시연상담">시연상담</option>
              <option value="견적상담">견적상담</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="region">지역</Label>
            <Input id="region" name="region" placeholder="서울, 경기 등" value={formData.region} onChange={handleChange} disabled={loading} className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="preferred_visit_time">희망 시간대</Label>
            <select id="preferred_visit_time" name="preferred_visit_time" value={formData.preferred_visit_time} onChange={handleChange} disabled={loading} className={selectClass}>
              <option value="">선택하세요</option>
              <option value="오전">오전</option>
              <option value="오후">오후</option>
              <option value="협의 후 결정">협의 후 결정</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="preferred_visit_date">희망 날짜</Label>
          <Input
            id="preferred_visit_date"
            name="preferred_visit_date"
            type="date"
            value={formData.preferred_visit_date}
            onChange={handleChange}
            disabled={loading}
            min={new Date().toISOString().split('T')[0]}
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="message">추가 요청사항</Label>
          <Textarea
            id="message"
            name="message"
            rows={3}
            value={formData.message}
            onChange={handleChange}
            disabled={loading}
            placeholder="교실 수, 희망 화면 크기(65/75/86인치) 등을 남겨주시면 더 빠르게 안내해드립니다."
            className={inputClass}
          />
        </div>
      </fieldset>

      <Button
        type="submit"
        className="w-full bg-[#00c4b4] hover:bg-[#00a396] hover:shadow-lg hover:shadow-[#00c4b4]/20 transition-all duration-200"
        size="lg"
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            신청 처리 중...
          </span>
        ) : (
          '상담신청'
        )}
      </Button>

      <p className="text-center text-xs text-gray-400">
        제출하신 정보는 상담 안내 목적으로만 사용됩니다.
      </p>
    </form>
  )
}
