'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Link2, Share2 } from 'lucide-react'

interface ShareBarProps {
  title: string
  description?: string
  url?: string
  image?: string
  className?: string
}

/**
 * 컴팩트한 공유 바 — 카카오톡 + 링크복사 + 네이티브 공유
 * 인사이트, 커뮤니티 글, 자료실 등 콘텐츠 하단에 배치
 */
export function ShareBar({ title, description, url, image, className }: ShareBarProps) {
  const [copied, setCopied] = useState(false)
  const [hasNativeShare, setHasNativeShare] = useState(false)

  useEffect(() => {
    setHasNativeShare(typeof navigator !== 'undefined' && !!navigator.share)
  }, [])

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jeonchilpan.netlify.app'
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : baseUrl)
  const shareDesc = description || '전칠판 - 전자칠판 사용자 소통·정보 포털'
  const shareImage = image || `${baseUrl}/assets/images/jeonchilpan_og_logo.png`

  const shareKakao = () => {
    const { Kakao } = window as any
    if (!Kakao?.isInitialized()) return

    try {
      Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title,
          description: shareDesc,
          imageUrl: shareImage,
          link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
        },
        buttons: [{ title: '자세히 보기', link: { mobileWebUrl: shareUrl, webUrl: shareUrl } }],
      })
    } catch {
      // 실패 시 무시
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = shareUrl
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: shareDesc, url: shareUrl })
      } catch {
        // 취소
      }
    } else {
      copyLink()
    }
  }

  return (
    <div className={`flex items-center gap-1.5 ${className || ''}`}>
      <button
        type="button"
        onClick={shareKakao}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#FEE500] text-[#1a1a1a] hover:bg-[#f5dc00] transition-colors"
        title="카카오톡으로 공유"
      >
        <MessageCircle className="w-3.5 h-3.5" />
        카카오톡
      </button>
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
        title="링크 복사"
      >
        <Link2 className="w-3.5 h-3.5" />
        {copied ? '복사됨!' : '링크 복사'}
      </button>
      {hasNativeShare && (
        <button
          type="button"
          onClick={shareNative}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          title="공유"
        >
          <Share2 className="w-3.5 h-3.5" />
          공유
        </button>
      )}
    </div>
  )
}
