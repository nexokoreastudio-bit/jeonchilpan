'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * 중앙 콘텐츠 구역의 가로 배너
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
        'rounded-xl p-4 md:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-200',
        variant === 'primary'
          ? 'bg-gradient-to-r from-[#1a1a1a] to-slate-800 text-white hover:shadow-lg'
          : 'border-2 border-slate-200 bg-white hover:border-[#00c4b4]/30 hover:shadow-md',
        className
      )}
    >
      <div className="flex items-center gap-4">
        <span className="text-3xl">🖥️</span>
        <div>
          <p className="font-semibold text-sm md:text-base">
            전자칠판 상담신청 — 시연·견적·도입 한 번에
          </p>
          <p className="text-xs md:text-sm opacity-80 mt-0.5">
            영업일 1일 이내 맞춤 안내를 받으실 수 있습니다
          </p>
        </div>
      </div>
      <Link
        href="/leads/consultation"
        className={cn(
          'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm shrink-0 transition-all duration-200',
          variant === 'primary'
            ? 'bg-white text-slate-900 hover:bg-slate-50 hover:shadow-md'
            : 'bg-[#00c4b4] text-white hover:bg-[#00a396] hover:shadow-md hover:shadow-[#00c4b4]/20'
        )}
      >
        상담 신청하기
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  )
}
