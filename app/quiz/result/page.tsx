import { QuizResultClient } from '@/components/quiz/quiz-result-client'
import type { Metadata } from 'next'

const RESULT_TYPES: Record<string, { title: string; desc: string; color: string }> = {
  leader: {
    title: '리더형 학원장',
    desc: '목표를 향해 팀을 이끄는 당신. 강한 추진력과 결단력이 강점입니다.',
    color: '#00c4b4',
  },
  support: {
    title: '지원형 학원장',
    desc: '강사와 학생을 먼저 생각하는 당신. 신뢰 기반의 소통이 학원의 무기입니다.',
    color: '#3b82f6',
  },
  innovate: {
    title: '혁신형 학원장',
    desc: '새로운 것에 열린 당신. 트렌드 파악과 실험적 도입에 강점이 있습니다.',
    color: '#8b5cf6',
  },
  detail: {
    title: '디테일형 학원장',
    desc: '체계와 데이터를 중시하는 당신. 꼼꼼한 관리가 학원의 안정을 만듭니다.',
    color: '#f59e0b',
  },
}

interface PageProps {
  searchParams: { type?: string }
}

export const metadata: Metadata = {
  title: '학원장 유형 테스트 결과 | NEXO Daily',
  description: '나의 학원장 유형을 확인하고, 상세 분석 결과지를 받아보세요.',
}

export default function QuizResultPage({ searchParams }: PageProps) {
  const type = searchParams.type && RESULT_TYPES[searchParams.type]
    ? searchParams.type
    : 'leader'
  const result = RESULT_TYPES[type]

  return (
    <div className="min-h-screen bg-[#fafafa] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <QuizResultClient resultType={type} result={result} />
      </div>
    </div>
  )
}
