import { QuizClient } from '@/components/quiz/quiz-client'
import type { Metadata } from 'next'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: '학원장 유형 테스트 | 나는 어떤 학원장일까?',
  description: '5가지 질문으로 알아보는 나의 학원 운영 스타일. 학원장님의 강점과 성장 포인트를 확인해보세요.',
  openGraph: {
    title: '학원장 유형 테스트 | NEXO Daily',
    description: '5가지 질문으로 알아보는 나의 학원 운영 스타일.',
  },
}

export default function QuizPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#00c4b4] bg-[#00c4b4]/10 rounded mb-4">
            NEXO Daily
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            나는 어떤 학원장일까?
          </h1>
          <p className="text-gray-500 text-base">
            5가지 질문으로 알아보는 학원 운영 스타일
          </p>
        </div>
        <QuizClient />
      </div>
    </div>
  )
}
