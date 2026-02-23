'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const QUESTIONS = [
  {
    id: 1,
    text: '학원 운영에서 가장 중요하다고 생각하는 것은?',
    options: [
      { value: 'leader', label: '강한 리더십으로 팀을 이끌기' },
      { value: 'support', label: '강사·학생과의 신뢰와 소통' },
      { value: 'innovate', label: '새로운 방식과 도구의 도입' },
      { value: 'detail', label: '체계적인 프로세스와 세부 관리' },
    ],
  },
  {
    id: 2,
    text: '수업 환경 개선을 고민할 때 가장 먼저 하는 것은?',
    options: [
      { value: 'leader', label: '목표를 정하고 실행 계획을 세운다' },
      { value: 'support', label: '강사님들의 의견을 먼저 듣는다' },
      { value: 'innovate', label: '최신 트렌드와 솔루션을 검색한다' },
      { value: 'detail', label: '현황 분석과 ROI를 따져본다' },
    ],
  },
  {
    id: 3,
    text: '학원의 가장 큰 강점은?',
    options: [
      { value: 'leader', label: '명확한 방향 제시와 결단력' },
      { value: 'support', label: '따뜻한 분위기와 애정 어린 지도' },
      { value: 'innovate', label: '차별화된 수업 방식과 도구' },
      { value: 'detail', label: '꼼꼼한 관리와 데이터 기반 운영' },
    ],
  },
  {
    id: 4,
    text: '새로운 디지털 도구를 도입할 때 나의 반응은?',
    options: [
      { value: 'leader', label: '먼저 도입하고 팀에 강력히 밀어붙인다' },
      { value: 'support', label: '강사님들이 편하게 쓸 수 있는지가 최우선' },
      { value: 'innovate', label: '얼마나 새로운지, 차별화되는지가 관심사' },
      { value: 'detail', label: '성과 지표와 투자 대비 효과를 먼저 본다' },
    ],
  },
  {
    id: 5,
    text: '가장 보람을 느끼는 순간은?',
    options: [
      { value: 'leader', label: '팀이 하나 되어 목표를 달성했을 때' },
      { value: 'support', label: '학생·강사가 나에게 마음을 열었을 때' },
      { value: 'innovate', label: '새로운 시도가 성공했을 때' },
      { value: 'detail', label: '체계가 잡혀 안정적으로 돌아갈 때' },
    ],
  },
]

const RESULT_TYPES: Record<string, { title: string; desc: string; color: string }> = {
  leader: {
    title: '리더형 학원장',
    desc: '목표를 향해 팀을 이끄는 당신. 강한 추진력과 결단력이 강점입니다. 디지털 도구 도입 시 팀원들의 적응을 고려한 단계적 교육이 시너지를 높입니다.',
    color: '#00c4b4',
  },
  support: {
    title: '지원형 학원장',
    desc: '강사와 학생을 먼저 생각하는 당신. 신뢰 기반의 소통이 학원의 무기입니다. 수업 환경 개선 시 강사님들의 목소리를 반영하면 현장 만족도가 높아집니다.',
    color: '#3b82f6',
  },
  innovate: {
    title: '혁신형 학원장',
    desc: '새로운 것에 열린 당신. 트렌드 파악과 실험적 도입에 강점이 있습니다. ROI와 팀 합의를 함께 고려하면 더욱 효과적인 변화를 만들 수 있습니다.',
    color: '#8b5cf6',
  },
  detail: {
    title: '디테일형 학원장',
    desc: '체계와 데이터를 중시하는 당신. 꼼꼼한 관리가 학원의 안정을 만듭니다. 때로는 직관과 속도도 시도해 보는 것, 새로운 성장의 기회가 될 수 있습니다.',
    color: '#f59e0b',
  },
}

export function QuizClient() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})

  const currentQuestion = QUESTIONS[step]
  const isLastStep = step === QUESTIONS.length - 1

  const handleSelect = (value: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value }
    setAnswers(newAnswers)

    if (isLastStep) {
      const counts: Record<string, number> = { leader: 0, support: 0, innovate: 0, detail: 0 }
      Object.values(newAnswers).forEach((v) => { counts[v] = (counts[v] || 0) + 1 })
      const resultType = (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0]) || 'leader'
      router.push(`/quiz/result?type=${resultType}`)
    } else {
      setStep(step + 1)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 md:p-10">
      <div className="mb-8">
        <span className="text-sm text-gray-500">
          {step + 1} / {QUESTIONS.length}
        </span>
        <div className="h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-[#00c4b4] transition-all duration-300"
            style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
          />
        </div>
      </div>

      <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-6">
        {currentQuestion.text}
      </h2>

      <div className="space-y-3">
        {currentQuestion.options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleSelect(opt.value)}
            className={cn(
              'w-full text-left p-4 rounded-lg border-2 transition-all',
              answers[currentQuestion.id] === opt.value
                ? 'border-[#00c4b4] bg-[#00c4b4]/5'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {step > 0 && (
        <button
          type="button"
          onClick={() => setStep(step - 1)}
          className="mt-6 text-sm text-gray-500 hover:text-gray-700"
        >
          ← 이전 질문
        </button>
      )}
    </div>
  )
}
