import { ConsultationRequestForm } from '@/components/leads/consultation-request-form'

export const metadata = {
  title: '상담신청 - 시연·견적·도입 상담 한 번에',
  description: '넥소 전자칠판 시연, 견적, 도입 상담을 한 번에 접수하세요. 영업일 1일 이내 연락드립니다.',
  openGraph: {
    title: '전자칠판 상담신청 | 시연·견적·도입 한 번에',
    description: '넥소 전자칠판 상담을 간편하게 접수하세요. 무료 상담, 빠른 응답.',
  },
}

export default function ConsultationRequestPage() {
  const faqItems = [
    {
      question: '상담 신청 후 얼마나 빨리 연락을 받나요?',
      answer: '영업일 기준으로 최대 1일 이내 연락드립니다. 문의가 많은 시간대에는 순차적으로 안내됩니다.',
    },
    {
      question: '상담 비용이 발생하나요?',
      answer: '상담은 무료입니다. 도입 목적과 예산에 맞는 구성만 간단히 안내드립니다.',
    },
    {
      question: '시연과 견적을 따로 신청해야 하나요?',
      answer: '아닙니다. 상담신청 한 번으로 시연/견적/도입 상담을 통합해서 진행합니다.',
    },
    {
      question: '상담 전에 준비하면 좋은 정보가 있나요?',
      answer: '설치 희망 지역, 예상 교실 수, 선호 화면 크기(65/75/86인치), 희망 일정이 있으면 더 빠르게 안내가 가능합니다.',
    },
    {
      question: '개인정보는 어떻게 사용되나요?',
      answer: '상담 안내 및 일정 조율 목적에만 사용되며, 관련 법령 및 내부 정책에 따라 안전하게 관리합니다.',
    },
  ]


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

        <section className="mt-6 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-900">상담신청 Q&A</h2>
          <p className="mt-2 text-sm text-gray-600">자주 묻는 질문을 먼저 확인해보세요.</p>
          <div className="mt-5 space-y-3">
            {faqItems.map((item) => (
              <details key={item.question} className="rounded-md border border-slate-200 bg-slate-50/50 px-4 py-3">
                <summary className="cursor-pointer list-none text-sm font-semibold text-slate-800">
                  {item.question}
                </summary>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
