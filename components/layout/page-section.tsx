import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

/**
 * 메인페이지와 동일한 흰색 섹션 카드
 * - border, shadow-sm, rounded-lg
 * - 상단 헤더: bg-slate-50/50, border-b
 */
export function PageSection({
  title,
  subtitle,
  children,
  actionHref,
  actionLabel,
  className = '',
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  actionHref?: string
  actionLabel?: string
  className?: string
}) {
  return (
    <section
      className={`bg-white border border-gray-200/80 overflow-hidden rounded-lg shadow-sm ${className}`}
    >
      <div className="border-b border-gray-100 bg-slate-50/50 px-4 py-3 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-800">{title}</h2>
          {subtitle && (
            <p className="text-slate-500 text-xs mt-0.5">{subtitle}</p>
          )}
        </div>
        {actionHref && actionLabel && (
          <Link
            href={actionHref}
            className="shrink-0 flex items-center gap-1 text-sm font-medium text-[#00c4b4] hover:text-[#00a396] transition-colors"
          >
            {actionLabel}
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
      <div className="p-4 md:p-5">{children}</div>
    </section>
  )
}
