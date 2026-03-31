import type { Metadata } from 'next'
import { LEGAL_EFFECTIVE_DATE, LEGAL_VERSION, BUSINESS_INFO } from '@/lib/legal'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: '이용약관',
  description: '전칠판 서비스 이용약관 안내',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-lg p-6 md:p-8 space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-slate-900">이용약관</h1>
          <p className="text-sm text-slate-500 mt-1">
            시행일: {LEGAL_EFFECTIVE_DATE} · 버전: {LEGAL_VERSION.terms}
          </p>
        </header>

        <section className="space-y-2 text-sm text-slate-700 leading-6">
          <h2 className="text-base font-semibold text-slate-900">1. 목적</h2>
          <p>
            본 약관은 {BUSINESS_INFO.companyName}(이하 "회사")가 제공하는 전칠판 서비스의 이용 조건과 절차, 회사와 이용자의
            권리·의무 및 책임사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section className="space-y-2 text-sm text-slate-700 leading-6">
          <h2 className="text-base font-semibold text-slate-900">2. 서비스 내용</h2>
          <p>회사는 교육 뉴스, 커뮤니티, 자료실, 상담 신청 등 관련 서비스를 제공합니다.</p>
          <p>서비스 내용은 운영 정책에 따라 변경될 수 있으며, 중요한 변경은 사전 공지합니다.</p>
        </section>

        <section className="space-y-2 text-sm text-slate-700 leading-6">
          <h2 className="text-base font-semibold text-slate-900">3. 회원의 의무</h2>
          <p>이용자는 타인의 권리를 침해하거나 법령에 위반되는 게시물을 등록해서는 안 됩니다.</p>
          <p>허위 정보 등록, 서비스 운영 방해, 비정상적 접근 시 이용 제한이 될 수 있습니다.</p>
        </section>

        <section className="space-y-2 text-sm text-slate-700 leading-6">
          <h2 className="text-base font-semibold text-slate-900">4. 게시물 관리</h2>
          <p>
            회사는 관련 법령 또는 운영정책 위반 게시물에 대해 노출 제한, 삭제 등의 조치를 할 수 있습니다. 권리침해 신고가
            접수된 경우 관련 절차에 따라 처리합니다.
          </p>
        </section>

        <section className="space-y-2 text-sm text-slate-700 leading-6">
          <h2 className="text-base font-semibold text-slate-900">5. 면책</h2>
          <p>
            회사는 천재지변, 불가항력, 이용자 귀책 사유로 인한 서비스 장애에 대해 책임을 지지 않습니다. 외부 링크 및 제3자
            제공 정보는 해당 제공자의 책임에 따릅니다.
          </p>
        </section>

        <section className="space-y-2 text-sm text-slate-700 leading-6">
          <h2 className="text-base font-semibold text-slate-900">6. 문의</h2>
          <p>문의 이메일: {BUSINESS_INFO.email}</p>
          <p>문의 전화: {BUSINESS_INFO.phone}</p>
        </section>
      </div>
    </div>
  )
}
