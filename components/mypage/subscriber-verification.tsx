'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getSubscriberStatus } from '@/app/actions/subscriber'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Clock, Edit3, RefreshCw } from 'lucide-react'

interface SubscriberVerificationProps {
  userId: string
}

/**
 * 구독자 인증 - 인증글 작성 후 관리자 승인
 */
export function SubscriberVerification({ userId }: SubscriberVerificationProps) {
  const [status, setStatus] = useState<{
    verified: boolean
    requestPending: boolean
    requestedAt: string | null
  } | null>(null)
  const [loading, setLoading] = useState(true)

  const loadStatus = async () => {
    try {
      const result = await getSubscriberStatus(userId)
      setStatus({
        verified: result.verified || false,
        requestPending: result.requestPending || false,
        requestedAt: result.requestedAt || null,
      })
    } catch (error) {
      console.error('구독자 상태 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStatus()
  }, [userId])

  useEffect(() => {
    if (!status?.requestPending || status?.verified) return
    const id = setInterval(loadStatus, 30000)
    return () => clearInterval(id)
  }, [status?.requestPending, status?.verified])

  if (loading) {
    return (
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-6">
        <p className="text-sm text-gray-600">구독자 인증 정보를 불러오는 중...</p>
      </div>
    )
  }

  if (status?.verified) {
    return (
      <div className="bg-white border-2 border-green-200 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-bold text-gray-900">구독자 인증 완료</h2>
        </div>
        <p className="text-sm text-gray-600">
          ✅ 구독자 인증이 완료되었습니다. <strong className="text-[#00c4b4]">할인</strong> 혜택이 적용됩니다.
        </p>
      </div>
    )
  }

  if (status?.requestPending) {
    const requestedDate = status.requestedAt
      ? new Date(status.requestedAt).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : null

    return (
      <div className="bg-white border-2 border-orange-200 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Clock className="w-6 h-6 text-orange-600" />
          <h2 className="text-xl font-bold text-gray-900">인증 요청 접수됨</h2>
        </div>
        <p className="text-sm text-gray-600 mb-2">
          인증글이 접수되었습니다. 관리자 확인 후 승인됩니다.
        </p>
        {requestedDate && (
          <p className="text-xs text-gray-500 mb-4">요청일: {requestedDate}</p>
        )}
        <Button
          onClick={loadStatus}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          상태 새로고침
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        🔐 구독자 인증
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        <strong>인증글</strong>을 작성하면 관리자가 확인 후 승인해드립니다.
        시리얼 번호 없이도 간편하게 인증할 수 있어요.
        인증 완료 시 <strong className="text-[#00c4b4]">할인</strong> 혜택이 적용됩니다.
      </p>
      <p className="text-xs text-gray-500 mb-4">
        예: &quot;OO학원 원장 홍길동입니다. 넥소 전자칠판 사용 중입니다.&quot;
      </p>
      <Link href="/community/write?type=verification">
        <Button className="w-full bg-[#1a1a1a] hover:bg-[#00c4b4] text-white">
          <Edit3 className="w-4 h-4 mr-2" />
          인증글 작성하기
        </Button>
      </Link>
    </div>
  )
}
