import Link from 'next/link'
import { ArrowRight, Store, BadgeCheck, FileCheck } from 'lucide-react'

export function SmartstoreHeroSection() {
  return (
    <section className="bg-[radial-gradient(circle_at_top,#10316b_0%,#0b1f45_52%,#08142f_100%)] border border-[#1b3f7a] rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold bg-[#00c4b4]/20 text-[#7df6ec]">
            2026 캠페인
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold bg-white/10 text-slate-100">
            소상공인 스마트상점 모집
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white leading-tight">
          전자칠판 도입,
          <br />
          <span className="inline-block smartstore-headline-twinkle">
            2026 소상공인 스마트상점을 통해 준비하세요
          </span>
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-200/90 max-w-3xl">
          지원 대상, 준비 서류, 신청 절차를 한 번에 확인하고 바로 상담받을 수 있습니다.
        </p>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="rounded-md border border-white/20 bg-white/5 px-3 py-2 text-xs text-slate-100 flex items-center gap-2">
            <Store className="w-4 h-4 text-[#7df6ec]" />
            지원 대상 빠른 확인
          </div>
          <div className="rounded-md border border-white/20 bg-white/5 px-3 py-2 text-xs text-slate-100 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-[#7df6ec]" />
            신청 절차 3단계 안내
          </div>
          <div className="rounded-md border border-white/20 bg-white/5 px-3 py-2 text-xs text-slate-100 flex items-center gap-2">
            <BadgeCheck className="w-4 h-4 text-[#7df6ec]" />
            신청이 어렵다면? 상담신청을 통해 신청절자를 알려드립니다.
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2.5">
          <Link
            href="/smartstore"
            className="inline-flex items-center gap-2 rounded-md bg-[#00c4b4] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#00a99a] transition-colors"
          >
            모집 안내 보기
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="https://2026-nexo-polic-y-fund.netlify.app/?partner_code=johanju"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
          >
            신청상담 바로가기
          </Link>
        </div>
      </div>

    </section>
  )
}
