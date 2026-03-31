import type { Metadata } from 'next'
import { BUSINESS_INFO, LEGAL_EFFECTIVE_DATE, LEGAL_VERSION } from '@/lib/legal'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description: '전칠판 서비스 개인정보처리방침 안내',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-lg p-6 md:p-8 space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-slate-900">개인정보처리방침</h1>
          <p className="text-sm text-slate-500 mt-1">
            시행일: {LEGAL_EFFECTIVE_DATE} · 버전: {LEGAL_VERSION.privacy}
          </p>
        </header>

        <section className="space-y-2 text-sm text-slate-700 leading-6">
          <h2 className="text-base font-semibold text-slate-900">1. 수집 항목 및 목적</h2>
          <p>
            회사는 회원가입, 상담 신청, 서비스 제공을 위해 이름, 이메일, 연락처, 학원명, 접속 로그 등 필요한 최소한의
            정보를 수집·이용합니다.
          </p>
        </section>

        <section className="space-y-2 text-sm text-slate-700 leading-6">
          <h2 className="text-base font-semibold text-slate-900">2. 보유 및 이용기간</h2>
          <p>개인정보는 수집·이용 목적 달성 시 지체 없이 파기합니다.</p>
          <p>관련 법령에 따라 보관이 필요한 경우 해당 기간 동안 안전하게 보관합니다.</p>
        </section>

        <section className="space-y-2 text-sm text-slate-700 leading-6">
          <h2 className="text-base font-semibold text-slate-900">3. 제3자 제공 및 처리위탁</h2>
          <p>회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.</p>
          <p>서비스 운영을 위해 필요한 경우 관련 법령 및 계약에 따라 안전하게 처리합니다.</p>
        </section>

        <section className="space-y-2 text-sm text-slate-700 leading-6">
          <h2 className="text-base font-semibold text-slate-900">4. 이용자 권리</h2>
          <p>
            이용자는 개인정보 열람, 정정, 삭제, 처리정지 요구를 할 수 있으며, 문의 채널을 통해 요청할 수 있습니다.
          </p>
        </section>

        <section className="space-y-2 text-sm text-slate-700 leading-6">
          <h2 className="text-base font-semibold text-slate-900">5. 안전성 확보 조치</h2>
          <p>회사는 접근권한 관리, 암호화, 접속기록 관리 등 기술적·관리적 보호조치를 시행합니다.</p>
        </section>

        <section className="space-y-2 text-sm text-slate-700 leading-6">
          <h2 className="text-base font-semibold text-slate-900">6. 개인정보보호책임자</h2>
          <p>책임자: {BUSINESS_INFO.privacyOfficer}</p>
          <p>이메일: {BUSINESS_INFO.email}</p>
          <p>전화: {BUSINESS_INFO.phone}</p>
        </section>
      </div>
    </div>
  )
}
