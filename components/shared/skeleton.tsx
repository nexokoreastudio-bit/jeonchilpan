import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-slate-200/70',
        className
      )}
    />
  )
}

/** 카드형 스켈레톤 — 리스트 아이템용 */
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-full" />
    </div>
  )
}

/** 인사이트 카드 스켈레톤 — 썸네일 + 텍스트 */
export function SkeletonInsightCard() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  )
}

/** 리스트 행 스켈레톤 */
export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Skeleton className="h-5 w-5 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  )
}
