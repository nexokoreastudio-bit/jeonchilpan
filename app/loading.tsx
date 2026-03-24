import { Skeleton, SkeletonCard, SkeletonInsightCard } from '@/components/shared/skeleton'

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      <div className="container mx-auto max-w-7xl px-3 sm:px-4 md:px-6 py-5 sm:py-8 md:py-10">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 xl:gap-8">
          {/* 메인 콘텐츠 */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* 히어로 스켈레톤 */}
            <Skeleton className="h-48 sm:h-64 w-full rounded-lg" />

            {/* 뉴스 바 */}
            <Skeleton className="h-10 w-full rounded-lg" />

            {/* 자료실 섹션 */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3 w-72" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
                <SkeletonCard />
                <div className="lg:col-span-2 space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              </div>
            </div>

            {/* 커뮤니티 섹션 */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
              <Skeleton className="h-5 w-64" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>

            {/* 인사이트 카드 */}
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <Skeleton className="h-5 w-56 mb-6" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonInsightCard key={i} />
                ))}
              </div>
            </div>
          </div>

          {/* 사이드바 스켈레톤 */}
          <div className="hidden lg:block w-[280px] shrink-0 space-y-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    </div>
  )
}
