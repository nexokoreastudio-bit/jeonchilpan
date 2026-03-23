import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * 자연스러운 솔루션 CTA 컴포넌트
 * - 홍보 느낌 없이 "학원 운영에 도움이 되는" 가치 중심
 * - variant로 페이지별 문맥에 맞게 사용
 */
type Variant = 'default' | 'compact' | 'inline'

interface SolutionCtaProps {
  variant?: Variant
  className?: string
}

const VARIANTS = {
  default: {
    wrapper: 'p-6 rounded-xl bg-[#1a1a1a] text-white',
    title: 'text-base font-semibold mb-2',
    desc: 'text-white/80 text-sm mb-6 leading-relaxed',
    link: 'inline-flex items-center gap-2 text-sm font-medium text-white hover:underline',
  },
  compact: {
    wrapper: 'p-5 rounded-lg border border-gray-200 bg-white',
    title: 'text-sm font-semibold text-gray-900 mb-1',
    desc: 'text-gray-500 text-xs mb-4 leading-relaxed',
    link: 'inline-flex items-center gap-1.5 text-sm font-medium text-[#00c4b4] hover:underline',
  },
  inline: {
    wrapper: 'py-4',
    title: 'text-sm font-semibold text-gray-900 mb-2',
    desc: 'text-gray-500 text-xs mb-3',
    link: 'text-sm text-[#00c4b4] hover:underline font-medium',
  },
} as const

const CONTENT = {
  default: {
    title: '수업 환경 개선이 궁금하신가요?',
    desc: '상담신청 한 번으로 시연, 견적, 도입 상담까지 함께 안내해드립니다.',
    linkText: '상담 신청하기',
  },
  compact: {
    title: '전자칠판 상담',
    desc: '시연, 견적, 설치 문의를 한 번에 접수하세요.',
    linkText: '자세히 보기',
  },
  inline: {
    title: '학원 수업에 도움이 되는 도구',
    desc: '상담신청 후 시연과 도입 일정을 안내받으세요.',
    linkText: '상담 신청하기',
  },
}

export function SolutionCta({ variant = 'default', className }: SolutionCtaProps) {
  const v = VARIANTS[variant]
  const c = CONTENT[variant]

  return (
    <div className={cn(v.wrapper, className)}>
      <h3 className={v.title}>{c.title}</h3>
      <p className={v.desc}>{c.desc}</p>
      <Link href="/leads/consultation" className={v.link}>
        {c.linkText}
        <ArrowRight className="w-4 h-4 flex-shrink-0" />
      </Link>
    </div>
  )
}
