import Link from 'next/link'
import { MapPin, ExternalLink } from 'lucide-react'
import { BUSINESS_INFO } from '@/lib/legal'

export function Footer() {
  return (
    <footer className="mt-auto bg-[#0f172a] text-slate-300">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="py-8 sm:py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-10 md:gap-8">
            {/* 브랜드 영역 */}
            <div className="md:col-span-5">
              <Link href="/" className="inline-block mb-5">
                <span className="text-lg font-bold text-white tracking-tight">NEXO Daily</span>
              </Link>
              <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
                NEXO가 운영하는 원장님들의 고민을 함께 나누는 공개 커뮤니티입니다.
                입시 뉴스, 학원 운영 팁, 자료 공유를 통해 현장을 지원합니다.
              </p>
            </div>

            {/* 바로가기 */}
            <div className="md:col-span-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-5">
                바로가기
              </h3>
              <nav className="flex flex-wrap gap-x-6 gap-y-2 sm:gap-y-1">
                <Link href="/news" className="text-sm text-slate-400 hover:text-white transition-colors">
                  발행호
                </Link>
                <Link href="/community" className="text-sm text-slate-400 hover:text-white transition-colors">
                  전칠판
                </Link>
                <Link href="/seminar" className="text-sm text-slate-400 hover:text-white transition-colors">
                  세미나 (준비중)
                </Link>
                <Link href="/resources" className="text-sm text-slate-400 hover:text-white transition-colors">
                  자료실
                </Link>
                <Link href="/reviews" className="text-sm text-slate-400 hover:text-white transition-colors">
                  고객 후기
                </Link>
                <Link href="/field" className="text-sm text-slate-400 hover:text-white transition-colors">
                  현장 소식
                </Link>
                <Link
                  href="/leads/consultation"
                  className="text-sm font-semibold text-[#00c4b4] hover:text-[#00e5d4] transition-colors inline-flex items-center gap-1.5"
                >
                  상담신청
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </Link>
              </nav>
            </div>

            {/* 문의 */}
            <div className="md:col-span-3">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-5">
                문의
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                (주)넥소 · 학원 현장 지원 플랫폼
              </p>
              <div className="space-y-3">
                <a
                  href="tel:032-569-5771"
                  className="block text-sm text-slate-400 hover:text-white transition-colors"
                >
                  {BUSINESS_INFO.phone}
                </a>
                <Link
                  href="/location"
                  className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  <MapPin className="w-4 h-4 flex-shrink-0 opacity-70" />
                  오시는 길
                </Link>
              </div>
            </div>
          </div>

          {/* 하단 */}
          <div className="pt-10 border-t border-slate-700/50 space-y-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
              <Link href="/terms" className="hover:text-white transition-colors">
                이용약관
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                개인정보처리방침
              </Link>
            </div>
            <div className="text-xs text-slate-500 leading-6">
              <p>
                상호: {BUSINESS_INFO.companyName} | 대표자: {BUSINESS_INFO.representative} | 사업자등록번호:{' '}
                {BUSINESS_INFO.businessNumber}
              </p>
              <p>
                통신판매업 신고번호: {BUSINESS_INFO.ecommerceNumber} | 주소: {BUSINESS_INFO.address}
              </p>
              <p>
                개인정보보호책임자: {BUSINESS_INFO.privacyOfficer} | 이메일: {BUSINESS_INFO.email}
              </p>
            </div>
            <p className="text-xs text-slate-500">
              © NEXO Daily. 학원장·강사님을 위한 교육 정보 플랫폼.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
