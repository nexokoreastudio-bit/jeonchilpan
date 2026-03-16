import Link from 'next/link'
import { CheckCircle2, ArrowRight } from 'lucide-react'

export const metadata = {
  title: '소상공인 스마트상점 모집',
  description: '소상공인 스마트상점 모집 안내. 지원 대상, 신청 절차, 상담 연결을 확인하세요.',
}

const HIGHLIGHTS = [
  '지원 대상과 준비 항목 빠른 확인',
  '전자칠판 도입 관점에서 신청 절차 안내',
  '시연/견적 상담 즉시 연결',
]

const STEPS = [
  { title: '지원 대상 확인', description: '업종·사업자 기준을 먼저 점검합니다.' },
  { title: '신청 자료 준비', description: '신청서 및 필수 확인 서류를 준비합니다.' },
  { title: '상담 후 신청 진행', description: '도입 계획 확정 후 신청을 진행합니다.' },
]

export default function SmartstoreCampaignPage() {
  return (
    <div className="bg-[#f4f6f8] min-h-screen">
      <div className="container mx-auto max-w-5xl px-4 py-8 md:py-10">
        <section className="bg-[radial-gradient(circle_at_top,#10316b_0%,#0b1f45_52%,#08142f_100%)] border border-[#1b3f7a] rounded-lg shadow-sm overflow-hidden">
          <div className="px-5 sm:px-7 py-8 sm:py-10">
            <span className="inline-flex items-center rounded-full bg-[#00c4b4]/20 px-2.5 py-1 text-xs font-semibold text-[#7df6ec]">
              2026 소상공인 스마트상점 모집
            </span>
            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              전칠판 도입을 위한 지원사업 안내
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-200/90 max-w-3xl">
              지원 대상 확인부터 신청 준비, 상담까지 한 페이지에서 확인하세요.
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <Link
                href="/leads/demo?campaign=smartstore"
                className="inline-flex items-center gap-2 rounded-md bg-[#00c4b4] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#00a99a] transition-colors"
              >
                시연 신청
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/leads/quote?campaign=smartstore"
                className="inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
              >
                견적 상담
              </Link>
            </div>
          </div>
        </section>

        <section className="mt-4 bg-white border border-gray-200/80 rounded-lg shadow-sm p-5">
          <h2 className="text-base font-bold text-slate-800">핵심 안내</h2>
          <ul className="mt-3 space-y-2">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-[#00a396]" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-4 bg-white border border-gray-200/80 rounded-lg shadow-sm p-5">
          <h2 className="text-base font-bold text-slate-800">신청 절차</h2>
          <div className="mt-4 grid md:grid-cols-3 gap-3">
            {STEPS.map((step, index) => (
              <article key={step.title} className="rounded-md border border-slate-200 bg-slate-50/60 p-4">
                <p className="text-xs font-semibold text-[#00a396]">STEP {index + 1}</p>
                <h3 className="mt-1 text-sm font-bold text-slate-800">{step.title}</h3>
                <p className="mt-1 text-xs text-slate-600">{step.description}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

