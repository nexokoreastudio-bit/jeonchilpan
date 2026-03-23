import { ConsultationRequestForm } from '@/components/leads/consultation-request-form'

export const metadata = {
  title: '견적 상담 | NEXO Daily',
  description: '학원 규모와 수업 환경에 맞는 견적 상담을 하나의 상담신청으로 접수하세요.',
}

export default function QuoteRequestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              견적 상담
            </h1>
            <p className="text-gray-600">
              견적, 설치 환경, 도입 상담을 한 번에 접수하실 수 있습니다.
            </p>
          </div>

          <ConsultationRequestForm initialRequestType="견적상담" sourceLabel="견적 페이지" />
        </div>

        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-2">견적 안내</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• 상담신청 한 번으로 견적, 시연, 설치 문의를 함께 접수</li>
            <li>• 학원 환경에 맞는 맞춤 견적</li>
            <li>• 빠른 응답 (영업일 기준)</li>
            <li>• 설치·교육·A/S 포함 사항 안내</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

