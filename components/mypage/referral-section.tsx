'use client'

import { useState, useEffect } from 'react'
import { getUserReferralCode } from '@/app/actions/referral'
import { Copy, Check, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export function ReferralSection({ userId }: { userId: string }) {
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadReferralCode()
  }, [userId])

  const loadReferralCode = async () => {
    try {
      const result = await getUserReferralCode(userId)
      if (result.code) {
        setReferralCode(result.code)
      }
    } catch (error) {
      console.error('추천인 코드 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const referralUrl = referralCode
    ? `${process.env.NEXT_PUBLIC_APP_URL || 'https://jeonchilpan.netlify.app'}/signup?ref=${referralCode}`
    : ''

  const copyReferralLink = async () => {
    if (!referralUrl) return

    try {
      await navigator.clipboard.writeText(referralUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = referralUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareReferralLink = async () => {
    if (!referralUrl) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'NEXO Daily에 가입하고 혜택을 받아보세요!',
          text: '추천인 코드로 가입하면 양쪽 모두 포인트를 받습니다!',
          url: referralUrl,
        })
      } catch (err) {
        // 사용자가 공유를 취소한 경우
      }
    } else {
      copyReferralLink()
    }
  }

  if (loading) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50">
        <p className="text-sm text-gray-600">추천인 코드를 불러오는 중...</p>
      </div>
    )
  }

  if (!referralCode) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50">
        <p className="text-sm text-gray-600">추천인 코드를 생성할 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="p-6 border rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50">
      <h3 className="text-lg font-bold text-gray-800 mb-4">🎁 내 추천 링크</h3>
      
      <div className="space-y-4">
        <div>
          <Label className="text-sm text-gray-600 mb-2 block">추천인 코드</Label>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-4 py-2 bg-white border rounded-lg font-mono font-bold text-lg text-blue-600">
              {referralCode}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(referralCode)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div>
          <Label className="text-sm text-gray-600 mb-2 block">추천 링크</Label>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-4 py-2 bg-white border rounded-lg text-sm text-gray-700 break-all">
              {referralUrl}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copyReferralLink}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <Button
                variant="outline"
                size="sm"
                onClick={shareReferralLink}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border border-blue-200">
          <p className="text-sm text-gray-700 mb-2">
            <strong>💡 추천인 혜택:</strong>
          </p>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>추천인 코드로 가입한 친구: <strong className="text-blue-600">+100 포인트</strong></li>
            <li>추천인 본인: <strong className="text-blue-600">+50 포인트</strong></li>
          </ul>
        </div>

        {copied && (
          <div className="text-sm text-green-600 font-medium">
            ✅ 링크가 복사되었습니다!
          </div>
        )}
      </div>
    </div>
  )
}

