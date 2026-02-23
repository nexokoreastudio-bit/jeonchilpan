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

const STATUS_LABELS = {
  pending: '대기중',
  contacted: '연락완료',
  completed: '완료',
  cancelled: '취소',
} as const

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  contacted: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
} as const

export function LeadsList({ leads }: LeadsListProps) {
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [adminNotes, setAdminNotes] = useState<Record<number, string>>({})

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
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">아직 리드가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">유형</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">연락처</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">지역</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">신청일</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{lead.id}</td>
                <td className="px-4 py-3 text-sm">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {TYPE_LABELS[lead.type] ?? lead.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{lead.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  <div>{lead.email}</div>
                  {lead.phone && <div className="text-xs text-gray-500">{lead.phone}</div>}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{lead.region || '-'}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[lead.status]}`}>
                    {STATUS_LABELS[lead.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {format(new Date(lead.created_at), 'yyyy.MM.dd HH:mm', { locale: ko })}
                </td>
                <td className="px-4 py-3 text-sm">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
                  >
                    {expandedId === lead.id ? '접기' : '상세'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 상세 정보 모달/확장 */}
      {expandedId && (
        <div className="border-t bg-gray-50 p-6">
          {leads
            .filter((lead) => lead.id === expandedId)
            .map((lead) => (
              <div key={lead.id} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500">학원명</Label>
                    <div className="text-sm text-gray-900">{lead.academy_name || '-'}</div>
                  </div>
                  {lead.type === 'quote' && (
                    <>
                      <div>
                        <Label className="text-xs text-gray-500">인치 종류</Label>
                        <div className="text-sm text-gray-900">{lead.size || '-'}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">설치 방식</Label>
                        <div className="text-sm text-gray-900">
                          {lead.mount_type === 'wall' ? '벽걸이' : lead.mount_type === 'stand' ? '이동형 스탠드' : '-'}
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">수량</Label>
                        <div className="text-sm text-gray-900">{lead.quantity || '-'}대</div>
                      </div>
                    </>
                  )}
                  {lead.referrer_code && (
                    <div>
                      <Label className="text-xs text-gray-500">추천인 코드</Label>
                      <div className="text-sm text-gray-900">{lead.referrer_code}</div>
                    </div>
                  )}
                </div>

                {lead.message && (
                  <div>
                    <Label className="text-xs text-gray-500">추가 요청사항</Label>
                    <div className="text-sm text-gray-900 bg-white p-3 rounded border">{lead.message}</div>
                  </div>
                )}

                {lead.admin_notes && (
                  <div>
                    <Label className="text-xs text-gray-500">관리자 메모</Label>
                    <div className="text-sm text-gray-900 bg-white p-3 rounded border">{lead.admin_notes}</div>
                  </div>
                )}

                <div className="border-t pt-4 space-y-4">
                  <div>
                    <Label htmlFor={`notes-${lead.id}`} className="text-sm font-medium">
                      관리자 메모
                    </Label>
                    <Textarea
                      id={`notes-${lead.id}`}
                      value={adminNotes[lead.id] || lead.admin_notes || ''}
                      onChange={(e) =>
                        setAdminNotes({ ...adminNotes, [lead.id]: e.target.value })
                      }
                      placeholder="관리자 메모를 입력하세요"
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <Label className="text-sm font-medium">상태 변경:</Label>
                    <Select
                      value={lead.status}
                      onValueChange={(value) =>
                        handleStatusChange(lead.id, value as LeadRow['status'])
                      }
                      disabled={updatingId === lead.id}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">대기중</SelectItem>
                        <SelectItem value="contacted">연락완료</SelectItem>
                        <SelectItem value="completed">완료</SelectItem>
                        <SelectItem value="cancelled">취소</SelectItem>
                      </SelectContent>
                    </Select>
                    {updatingId === lead.id && (
                      <span className="text-sm text-gray-500">업데이트 중...</span>
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

