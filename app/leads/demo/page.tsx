import { DemoRequestForm } from '@/components/leads/demo-request-form'

export const metadata = {
  title: '전자칠판 시연 예약 | NEXO Daily',
  description: '넥소 전자칠판 쇼룸에서 직접 시연해보세요. 미리 예약 후 방문해 주시면 맞춤 상담을 제공합니다.',
}

export default function DemoRequestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              전자칠판 시연 예약
            </h1>
            <p className="text-gray-600">
              넥소 전자칠판 쇼룸에서 직접 시연해보실 수 있습니다. <strong>미리 예약 후 방문</strong>해 주세요.
            </p>
          </div>

          <DemoRequestForm />
        </div>

        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-2">시연 안내</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• <strong>쇼룸 방문</strong> – 넥소 전자칠판 쇼룸에서 시연이 진행됩니다</li>
            <li>• <strong>사전 예약 필수</strong> – 방문 전 예약해 주시면 안내해 드립니다</li>
            <li>• 학원 환경에 맞는 1:1 맞춤 상담</li>
            <li>• 직접 사용해보며 확인 가능</li>
            <li>• 설치·운영 관련 궁금증 해결</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

