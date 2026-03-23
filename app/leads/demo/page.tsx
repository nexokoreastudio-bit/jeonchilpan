import { ConsultationRequestForm } from '@/components/leads/consultation-request-form'

export const metadata = {
  title: '전자칠판 시연 상담 | NEXO Daily',
  description: '넥소 전자칠판 쇼룸 방문, 시연, 도입 상담을 하나의 상담신청으로 접수하세요.',
}

export default function DemoRequestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              전자칠판 시연 상담
            </h1>
            <p className="text-gray-600">
              시연, 방문 일정, 도입 상담을 한 번에 접수하실 수 있습니다.
            </p>
          </div>

          <ConsultationRequestForm initialRequestType="시연상담" sourceLabel="시연 페이지" />
        </div>

        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-2">시연 안내</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• <strong>쇼룸 방문</strong> – 상담 접수 후 일정 조율을 도와드립니다</li>
            <li>• <strong>상담신청 한 번으로 충분</strong> – 시연, 견적, 도입 문의를 함께 남길 수 있습니다</li>
            <li>• 학원 환경에 맞는 1:1 맞춤 상담</li>
            <li>• 직접 사용해보며 확인 가능</li>
            <li>• 설치·운영 관련 궁금증 해결</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
