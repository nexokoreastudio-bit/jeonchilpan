import { QuoteRequestForm } from '@/components/leads/quote-request-form'

export const metadata = {
  title: '견적 문의 | NEXO Daily',
  description: '학원에 맞는 수업 도구 견적을 요청하세요. 빠른 응답과 함께 학원 환경에 맞춘 제안을 드립니다.',
}

export default function QuoteRequestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              견적 문의
            </h1>
            <p className="text-gray-600">
              학원 규모와 수업 환경에 맞는 견적을 안내해 드립니다
            </p>
          </div>

          <QuoteRequestForm />
        </div>

        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-2">견적 안내</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• 학원 환경에 맞는 맞춤 견적</li>
            <li>• 빠른 응답 (영업일 기준)</li>
            <li>• 설치·교육·A/S 포함 사항 안내</li>
          </ul>
        </div>
      </div>
    </div>
  )
}


