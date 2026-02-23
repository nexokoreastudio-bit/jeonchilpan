'use client'

import { useState } from 'react'
import { updateLeadStatus } from '@/app/actions/leads'
import { Database } from '@/types/database'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Mail, Phone, ChevronDown, ChevronUp, Building2 } from 'lucide-react'

type LeadRow = Database['public']['Tables']['leads']['Row']

interface LeadsListProps {
  leads: LeadRow[]
}

const TYPE_LABELS: Record<string, string> = {
  demo: '시연 신청',
  quote: '견적 요청',
  consultation: '상담 요청',
  chatbot_consultation: '챗봇 상담',
}

const TYPE_STYLES: Record<string, string> = {
  demo: 'bg-violet-100 text-violet-700 border-violet-200/60',
  quote: 'bg-orange-100 text-orange-700 border-orange-200/60',
  consultation: 'bg-sky-100 text-sky-700 border-sky-200/60',
  chatbot_consultation: 'bg-teal-100 text-teal-700 border-teal-200/60',
}

const STATUS_LABELS: Record<string, string> = {
  pending: '대기중',
  in_consultation: '상담중',
  contacted: '연락완료',
  demo_completed: '시연신청완료',
  quote_completed: '견적완료',
  consultation_completed: '상담완료',
  completed: '완료',
  cancelled: '취소',
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200/60',
  in_consultation: 'bg-blue-100 text-blue-800 border-blue-200/60',
  contacted: 'bg-sky-100 text-sky-800 border-sky-200/60',
  demo_completed: 'bg-violet-100 text-violet-800 border-violet-200/60',
  quote_completed: 'bg-orange-100 text-orange-800 border-orange-200/60',
  consultation_completed: 'bg-teal-100 text-teal-800 border-teal-200/60',
  completed: 'bg-emerald-100 text-emerald-800 border-emerald-200/60',
  cancelled: 'bg-slate-100 text-slate-600 border-slate-200/60',
}

type LeadStatus = Database['public']['Tables']['leads']['Row']['status']
const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: 'pending', label: '대기중' },
  { value: 'in_consultation', label: '상담중' },
  { value: 'contacted', label: '연락완료' },
  { value: 'demo_completed', label: '시연신청완료' },
  { value: 'quote_completed', label: '견적완료' },
  { value: 'consultation_completed', label: '상담완료' },
  { value: 'completed', label: '완료' },
  { value: 'cancelled', label: '취소' },
]

const TYPE_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'demo', label: '시연 신청' },
  { value: 'quote', label: '견적 요청' },
  { value: 'consultation', label: '상담 요청' },
  { value: 'chatbot_consultation', label: '챗봇 상담' },
] as const

export function LeadsList({ leads }: LeadsListProps) {
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [adminNotes, setAdminNotes] = useState<Record<number, string>>({})
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const filteredLeads = leads.filter((lead) => {
    if (statusFilter !== 'all' && lead.status !== statusFilter) return false
    if (typeFilter !== 'all' && lead.type !== typeFilter) return false
    return true
  })

  const handleStatusChange = async (leadId: number, newStatus: LeadRow['status']) => {
    setUpdatingId(leadId)
    try {
      const result = await updateLeadStatus(leadId, newStatus, adminNotes[leadId] || null)
      if (result.success) {
        alert('상태가 업데이트되었습니다.')
        window.location.reload()
      } else {
        alert(result.error || '상태 업데이트에 실패했습니다.')
      }
    } catch (error: any) {
      alert(error.message || '상태 업데이트 중 오류가 발생했습니다.')
    } finally {
      setUpdatingId(null)
    }
  }

  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-12 text-center">
        <p className="text-slate-500 text-sm">아직 리드가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      {/* 필터 - 드롭다운 2개만 */}
      <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center gap-3">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as LeadStatus | 'all')}>
          <SelectTrigger className="w-[140px] h-8 text-sm border-slate-200">
            <SelectValue placeholder="상태" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 상태</SelectItem>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[120px] h-8 text-sm border-slate-200">
            <SelectValue placeholder="유형" />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-slate-400 ml-auto">{filteredLeads.length}건</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 w-10">ID</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 w-20">유형</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500">이름</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 min-w-[160px]">연락처</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 w-16">지역</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 w-28">상태 변경</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 w-24">신청일</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 w-16">상세</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-slate-500 text-sm">
                  조건에 맞는 리드가 없습니다.
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/30 border-b border-slate-50">
                <td className="px-4 py-2 text-sm text-slate-600 tabular-nums">{lead.id}</td>
                <td className="px-4 py-2">
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${TYPE_STYLES[lead.type] ?? 'bg-slate-100 text-slate-600'}`}>
                    {TYPE_LABELS[lead.type] ?? lead.type}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm font-medium text-slate-900">{lead.name}</td>
                <td className="px-4 py-2">
                  <div className="space-y-1">
                    <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 text-sm text-slate-700 hover:text-slate-900 hover:underline">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[160px]" title={lead.email}>{lead.email}</span>
                    </a>
                    {lead.phone && (
                      <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800 hover:underline">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{lead.phone}</span>
                      </a>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2 text-sm text-slate-600">{lead.region || '—'}</td>
                <td className="px-4 py-2">
                  <Select
                    value={lead.status}
                    onValueChange={(v) => handleStatusChange(lead.id, v as LeadRow['status'])}
                    disabled={updatingId === lead.id}
                  >
                    <SelectTrigger className="h-8 min-w-[100px] text-xs border-slate-200 bg-slate-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-2 text-sm text-slate-600 tabular-nums">
                  {format(new Date(lead.created_at), 'MM.dd HH:mm', { locale: ko })}
                </td>
                <td className="px-4 py-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
                    className="h-7 px-2 text-slate-500 hover:text-slate-700"
                  >
                    {expandedId === lead.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </Button>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 상세 패널 - 메모·추가정보 */}
      {expandedId && (
        <div className="border-t border-slate-100 bg-slate-50/30 p-4">
          {leads
            .filter((lead) => lead.id === expandedId)
            .map((lead) => (
              <div key={lead.id} className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="flex items-start gap-2">
                    <Building2 className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <Label className="text-xs text-slate-500 font-medium">학원명</Label>
                      <div className="text-sm text-slate-900 mt-0.5">{lead.academy_name || '—'}</div>
                    </div>
                  </div>
                  {lead.type === 'quote' && (
                    <>
                      <div>
                        <Label className="text-xs text-slate-500 font-medium">인치 종류</Label>
                        <div className="text-sm text-slate-900 mt-0.5">{lead.size || '—'}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-500 font-medium">설치 방식</Label>
                        <div className="text-sm text-slate-900 mt-0.5">
                          {lead.mount_type === 'wall' ? '벽걸이' : lead.mount_type === 'stand' ? '이동형 스탠드' : '—'}
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-500 font-medium">수량</Label>
                        <div className="text-sm text-slate-900 mt-0.5">{lead.quantity ?? '—'}대</div>
                      </div>
                    </>
                  )}
                  {lead.referrer_code && (
                    <div>
                      <Label className="text-xs text-slate-500 font-medium">추천인 코드</Label>
                      <div className="text-sm text-slate-900 mt-0.5">{lead.referrer_code}</div>
                    </div>
                  )}
                </div>

                {lead.message && (
                  <div>
                    <Label className="text-xs text-slate-500 font-medium">추가 요청사항</Label>
                    <div className="mt-1.5 text-sm text-slate-800 bg-white p-4 rounded-lg border border-slate-200 whitespace-pre-wrap leading-relaxed">
                      {lead.message}
                    </div>
                  </div>
                )}

                {lead.admin_notes && (
                  <div>
                    <Label className="text-xs text-slate-500 font-medium">기존 관리자 메모</Label>
                    <div className="mt-1.5 text-sm text-slate-800 bg-white p-4 rounded-lg border border-slate-200">
                      {lead.admin_notes}
                    </div>
                  </div>
                )}

                <div className="border-t border-slate-200 pt-4 space-y-3">
                  <div>
                    <Label htmlFor={`notes-${lead.id}`} className="text-xs font-medium text-slate-600">
                      관리자 메모
                    </Label>
                    <Textarea
                      id={`notes-${lead.id}`}
                      value={adminNotes[lead.id] ?? lead.admin_notes ?? ''}
                      onChange={(e) =>
                        setAdminNotes({ ...adminNotes, [lead.id]: e.target.value })
                      }
                      placeholder="메모를 입력하세요"
                      rows={3}
                      className="mt-2 border-slate-200 focus:ring-slate-500"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Label className="text-xs font-medium text-slate-600">상태 변경</Label>
                    <Select
                      value={lead.status}
                      onValueChange={(value) =>
                        handleStatusChange(lead.id, value as LeadRow['status'])
                      }
                      disabled={updatingId === lead.id}
                    >
                      <SelectTrigger className="w-36 border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {updatingId === lead.id && (
                      <span className="text-sm text-slate-500">저장 중...</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

