'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

/**
 * 공개 커뮤니티 섹션 박스 왼쪽에 붙는 배너
 * @param fixed - true면 position:fixed로 레이아웃에서 공간을 차지하지 않음 (넓은 화면용)
 */
export function LeftBanner({ fixed = false }: { fixed?: boolean }) {
  return (
    <aside
      className={
        fixed
          ? 'shrink-0 w-[160px] hidden xl:block fixed left-4 top-24 z-20'
          : 'shrink-0 w-full md:w-[140px] lg:w-[160px]'
      }
    >
      <div className="flex flex-row md:flex-col gap-4 md:sticky md:top-24">
        <Link
          href="/leads/consultation"
          className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-b from-[#00c4b4]/90 to-[#00a396] text-white shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
        >
          <span className="text-2xl mb-2">🖥️</span>
          <span className="text-xs font-bold text-center leading-tight">
            전자칠판
            <br />
            상담신청
            <br />
            안내받기
          </span>
          <span className="mt-2 text-[10px] flex items-center gap-1">
            상담신청
            <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
        <Link
          href="/leads/consultation"
          className="flex flex-col items-center p-3 rounded-lg border-2 border-slate-200 bg-white hover:border-[#00c4b4] hover:bg-slate-50 transition-colors"
        >
          <span className="text-lg">📋</span>
          <span className="text-[10px] font-semibold text-slate-700 mt-1 text-center">
            상담신청
          </span>
        </Link>
      </div>
    </aside>
  )
}
