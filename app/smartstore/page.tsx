import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const dynamic = 'force-static'

export const metadata = {
  title: '소상공인 스마트상점 모집 마감 안내',
  description: '2026년 1차 소상공인 스마트상점 모집이 마감되었습니다. 다음 모집 일정을 안내드립니다.',
}

/* ==========================================================================
   [2026-04-01 마감] 아래는 기존 캠페인 코드입니다. 내년 재사용을 위해 보존합니다.

   기존 import:
   import Image from 'next/image'
   import { ArrowRight, CheckCircle2, FileText, Users, ClipboardList } from 'lucide-react'

   기존 상수: SMARTSTORE_EXTERNAL_URL, SMARTSTORE_REGIONAL_CONTACT_URL, STEPS, NOTICE_POINTS
   기존 컴포넌트: SmartstoreCampaignPage (모집 안내 full page)

   복원 시 이 파일 전체를 git history에서 c36202b 커밋 기준으로 복원하면 됩니다.
   ========================================================================== */

export default function SmartstoreCampaignPage() {
  return (
    <div className="bg-[#f4f6f8] min-h-screen">
      <div className="container mx-auto max-w-3xl px-4 py-10 md:py-16">
        <div className="bg-white border border-gray-200/80 rounded-lg shadow-sm overflow-hidden">
          <div className="px-5 sm:px-8 py-8 sm:py-12 text-center">
            <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-4 py-1.5 text-sm font-semibold text-slate-600">
              2026년 1차 모집 마감
            </span>

            <h1 className="mt-5 text-2xl sm:text-3xl font-bold text-slate-800 leading-tight">
              소상공인 스마트상점 모집에<br />
              관심 가져주셔서 감사합니다
            </h1>

            <p className="mt-4 text-base text-slate-500 max-w-lg mx-auto leading-relaxed">
              2026년 1차 모집은 <strong className="text-slate-700">4월 1일</strong>부로 마감되었습니다.<br />
              다음 모집 일정이 확정되면 가장 먼저 안내드리겠습니다.
            </p>

            <div className="mt-6 p-4 rounded-lg bg-slate-50 border border-slate-100 max-w-md mx-auto">
              <p className="text-sm text-slate-600">
                전자칠판 도입 상담은 모집 기간과 관계없이<br className="hidden sm:inline" /> 언제든 가능합니다.
              </p>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/leads/consultation"
                className="inline-flex items-center gap-2 rounded-md bg-[#00c4b4] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#00a99a] transition-colors"
              >
                도입 상담 신청
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                홈으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
