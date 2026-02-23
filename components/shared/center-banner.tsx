'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * 중앙 콘텐츠 구역의 가로 배너 (코인판 스타일)
 * 섹션 사이에 자연스럽게 배치
 */
type Variant = 'primary' | 'outline'

interface CenterBannerProps {
  variant?: Variant
  className?: string
}

export function CenterBanner({ variant = 'primary', className }: CenterBannerProps) {
  return (
    <div
      className={cn(
        'rounded-xl p-4 md:p-5 flex flex-col sm:flex-row items-center justify-between gap-4',
        variant === 'primary'
          ? 'bg-gradient-to-r from-[#1a1a1a] to-slate-800 text-white'
          : 'border-2 border-slate-200 bg-white',
        className
      )}
    >
      <div className="flex items-center gap-4">
        <span className="text-3xl">🖥️</span>
        <div>
          <p className="font-semibold text-sm md:text-base">
            전자칠판 10% 할인가 견적 받기
          </p>
          <p className="text-xs md:text-sm opacity-80 mt-0.5">
            쇼룸 방문 후 직접 체험해보세요
          </p>
        </div>
      </div>
      <Link
        href="/leads/demo"
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm shrink-0 transition-colors',
          variant === 'primary'
            ? 'bg-white text-slate-900 hover:bg-slate-100'
            : 'bg-[#00c4b4] text-white hover:bg-[#00a396]'
        )}
      >
        시연 신청
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  )
}
