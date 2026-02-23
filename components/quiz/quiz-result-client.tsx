'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Share2, Mail, Download } from 'lucide-react'
import { submitQuizLead } from '@/app/actions/quiz'

interface QuizResultClientProps {
  resultType: string
  result: { title: string; desc: string; color: string }
}

export function QuizResultClient({ resultType, result }: QuizResultClientProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  const shareUrl = `${baseUrl}/quiz?ref=result`
  const shareText = `나의 학원장 유형은 "${result.title}"! 나도 테스트해볼까?`

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '학원장 유형 테스트',
          text: shareText,
          url: shareUrl,
        })
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          await navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
          alert('링크가 복사되었습니다.')
        }
      }
    } else {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
      alert('링크가 복사되었습니다.')
    }
  }

  const handleKakaoShare = () => {
    const url = `https://story.kakao.com/share?url=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await submitQuizLead({
        quizType: 'academy_personality',
        resultType,
        resultSummary: { title: result.title, desc: result.desc },
        email,
        name,
      })
      if (res.success) setSubmitted(true)
      else setError(res.error || '오류가 발생했습니다.')
    } catch {
      setError('오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* 결과 카드 - NEXO 브랜드 컬러 활용 */}
      <div
        className="rounded-xl p-8 md:p-10 text-white"
        style={{ backgroundColor: result.color }}
      >
        <span className="text-white/80 text-sm font-medium">나의 학원장 유형</span>
        <h1 className="text-2xl md:text-3xl font-bold mt-2 mb-4">{result.title}</h1>
        <p className="text-white/90 leading-relaxed">{result.desc}</p>
      </div>

      {/* 공유 버튼 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">친구에게 결과 공유하기</h3>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#00c4b4] text-white font-medium hover:bg-[#00a396] transition-colors"
          >
            <Share2 className="w-4 h-4" />
            공유하기
          </button>
          <button
            type="button"
            onClick={handleKakaoShare}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#FEE500] text-[#1a1a1a] font-medium hover:bg-[#f5dc00] transition-colors"
          >
            카카오톡으로 공유
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          공유 버튼을 누르면 링크가 복사되거나 공유 창이 열립니다.
        </p>
      </div>

      {/* 리드 캡처: 가입하고 결과지 받기 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Download className="w-5 h-5 text-[#00c4b4]" />
          <h3 className="font-semibold text-gray-900">상세 분석 결과지 받기</h3>
        </div>
        <p className="text-gray-500 text-sm mb-6">
          가입하시면 유형별 맞춤 수업 환경 개선 팁이 담긴 PDF를 이메일로 보내드립니다.
        </p>

        {submitted ? (
          <div className="p-4 rounded-lg bg-[#00c4b4]/10 text-[#00a396] font-medium">
            ✓ 제출되었습니다. 이메일로 결과지를 발송해 드릴게요!
          </div>
        ) : (
          <form onSubmit={handleSubmitLead} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                이름
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00c4b4] focus:border-[#00c4b4]"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@academy.com"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00c4b4] focus:border-[#00c4b4]"
                required
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#1a1a1a] text-white font-semibold hover:bg-[#00c4b4] transition-colors disabled:opacity-60"
            >
              {loading ? '제출 중...' : '결과지 받기'}
            </button>
          </form>
        )}
      </div>

      <div className="text-center">
        <Link
          href="/signup"
          className="text-sm text-[#00c4b4] hover:underline font-medium"
        >
          회원가입하고 커뮤니티 참여하기 →
        </Link>
      </div>
    </div>
  )
}
