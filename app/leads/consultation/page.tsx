import { ConsultationRequestForm } from '@/components/leads/consultation-request-form'

export const metadata = {
  title: '상담신청 | NEXO Daily',
  description: '전자칠판 도입 상담을 하나의 상담신청으로 간편하게 접수하세요.',
}

export default function ConsultationRequestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">상담신청</h1>
            <p className="text-gray-600">
              전자칠판 상담을 한 번에 접수하실 수 있습니다.
            </p>
          </div>

          <ConsultationRequestForm />
        </div>
      </div>
    </div>
  )
}
