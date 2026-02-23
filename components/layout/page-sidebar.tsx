import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SolutionCta } from '@/components/shared/solution-cta'
import { UtilityWidget } from '@/components/utility-widget'

/**
 * 모든 페이지에 표시되는 전역 사이드바
 * - 수업 유틸리티 (타이머, 랜덤뽑기) - 상태 유지
 * - 수업 환경 개선 CTA
 * - 자료실 바로가기
 */
export function PageSidebar() {
  return (
    <aside className="hidden lg:block w-80 shrink-0 pl-8 pr-8 xl:pl-12 xl:pr-12">
      <div className="sticky top-24 flex flex-col gap-6">
        <UtilityWidget />
        <SolutionCta variant="default" />
        <div className="p-6 rounded-xl border border-gray-200 bg-white">
          <h3 className="text-base font-semibold text-gray-900 mb-2">자료실</h3>
          <p className="text-gray-500 text-sm mb-6">
            학원 수업·상담에 활용할 수 있는 입시 자료, 템플릿을 다운로드하세요.
          </p>
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#00c4b4] hover:underline"
          >
            자료실 바로가기
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </aside>
  )
}
