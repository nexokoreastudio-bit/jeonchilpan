import { FileQuestion } from 'lucide-react'
import Link from 'next/link'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  actionLabel?: string
  actionHref?: string
}

/**
 * 빈 상태 컴포넌트 — 데이터가 없을 때 행동 유도
 */
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        {icon || <FileQuestion className="w-6 h-6 text-slate-400" />}
      </div>
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      {description && (
        <p className="text-xs text-slate-500 mt-1 max-w-xs">{description}</p>
      )}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-4 inline-flex items-center px-4 py-2 rounded-lg text-xs font-medium bg-[#00c4b4] text-white hover:bg-[#00a396] transition-colors"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
