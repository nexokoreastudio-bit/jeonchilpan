'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Copy, Check, FileText, ArrowRight } from 'lucide-react'
import { CollapsibleSection } from '@/components/portal/collapsible-section'

type Insight = {
  id: number
  title: string
  summary: string | null
  edition_id: string | null
  category: '입시' | '정책' | '학습법' | '상담팁' | '기타' | null
}

interface ConsultingCheatSheetProps {
  insights: Insight[]
}

type ConsultationChecklistCard = {
  id: string
  title: string
  checks: string[]
  openingMent: string
  closingMent: string
}

const CONSULTATION_CHECKLIST: ConsultationChecklistCard[] = [
  {
    id: 'student-goal',
    title: '학생 목표 정렬',
    checks: ['최근 모의고사/내신 기준점 확인', '희망 대학·학과 우선순위 정리', '현실 가능한 1차 목표 재설정'],
    openingMent: '오늘 상담은 현재 성적에서 가능한 최적의 목표를 같이 정하는 시간입니다.',
    closingMent: '다음 상담 전까지 목표 대학군을 1~2순위로 압축해 오시면 플랜을 더 정확히 잡아드릴게요.',
  },
  {
    id: 'parent-expectation',
    title: '학부모 기대치 조율',
    checks: ['학부모 우선순위(성적/습관/자존감) 파악', '기간 대비 기대치 현실화', '가정 내 학습 관리 방식 점검'],
    openingMent: '성적 향상도 중요하지만, 아이가 지속 가능한 학습 루틴을 만드는 게 먼저입니다.',
    closingMent: '기대치를 월 단위로 나눠서 확인하면 아이도 훨씬 안정적으로 따라옵니다.',
  },
  {
    id: 'bottleneck-subject',
    title: '과목별 병목 진단',
    checks: ['오답 유형 상위 3개 확인', '개념/문해력/시간관리 중 병목 구분', '당장 고칠 1개 습관 선정'],
    openingMent: '점수는 결과고, 지금은 점수를 막는 병목을 먼저 찾는 게 핵심입니다.',
    closingMent: '이번 주는 병목 1개만 확실히 줄이는 데 집중하겠습니다.',
  },
  {
    id: 'study-routine',
    title: '주간 학습 루틴',
    checks: ['주중/주말 학습 시간표 실제 가능성 점검', '과제량 과부하 여부 확인', '복습 간격(24h/72h) 반영'],
    openingMent: '무리한 계획보다 지켜지는 계획이 성적을 만듭니다.',
    closingMent: '이번 주는 완벽함보다 실행률 80%를 목표로 잡아보겠습니다.',
  },
  {
    id: 'communication',
    title: '상담 후 소통 설계',
    checks: ['피드백 주기(주 1회/격주) 확정', '공유 지표(출석/과제/테스트) 합의', '이슈 발생 시 연락 프로토콜 정리'],
    openingMent: '상담 이후 소통 방식이 정리되면 불안이 크게 줄어듭니다.',
    closingMent: '다음 피드백은 수치와 사례 중심으로 짧고 명확하게 공유드리겠습니다.',
  },
  {
    id: 'next-action',
    title: '다음 액션 확정',
    checks: ['오늘 결정사항 3줄 요약', '학생·학부모·학원 역할 분담', '다음 상담 일정/목표 확정'],
    openingMent: '오늘 상담은 듣고 끝나는 시간이 아니라, 바로 실행으로 이어지는 시간입니다.',
    closingMent: '지금 정한 3가지 액션만 지켜도 다음 상담에서 변화를 체감하실 겁니다.',
  },
]

export function ConsultingCheatSheet({ insights }: ConsultingCheatSheetProps) {
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const handleCopy = async (text: string, id: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1500)
    } catch {
      // fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1500)
    }
  }

  return (
    <CollapsibleSection
      title="오늘의 상담 컨닝페이퍼"
      subtitle="원장님이 학부모 상담 전에 바로 점검할 핵심 체크리스트와 멘트를 모았습니다."
      defaultOpen={false}
    >
      <div className="px-5 pt-5">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="min-w-0">
            {insights[0]?.title && (
              <p className="text-xs text-slate-500">
                오늘 이슈 참고: {insights[0].title}
              </p>
            )}
          </div>
          <Link
            href="/news"
            className="hidden md:flex items-center gap-2 text-sm font-medium text-[#00c4b4] hover:text-[#00a396] transition-colors shrink-0"
          >
            전체 보기 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
      <div className="px-5 pb-8">
        <div className="grid md:grid-cols-2 gap-6 py-2">
          {CONSULTATION_CHECKLIST.map((card, idx) => {
            const checksText = card.checks.map((check, checkIdx) => `${checkIdx + 1}. ${check}`).join('\n')
            const openingMentId = idx + 1
            const closingMentId = idx + 10001

            return (
              <article
                key={card.id}
                className="group relative my-1 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="relative p-5 pb-4 bg-gradient-to-br from-[#00c4b4]/12 via-[#00c4b4]/5 to-white border-b border-slate-100">
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-flex items-center text-[11px] font-semibold tracking-wide text-[#008f84] bg-white/80 px-2.5 py-1 rounded-full border border-[#00c4b4]/20">
                      상담 카드뉴스
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {String(idx + 1).padStart(2, '0')} / {CONSULTATION_CHECKLIST.length}
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-bold leading-snug text-slate-900">
                    {card.title}
                  </h3>
                </div>

                <div className="p-5">
                  <h4 className="text-xs font-semibold tracking-wide text-slate-500 mb-2">상담 전 체크</h4>
                  <ul className="text-sm md:text-base text-slate-700 space-y-2">
                    {card.checks.map((check) => (
                      <li key={check}>• {check}</li>
                    ))}
                  </ul>

                  <div className="mt-5 space-y-3">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs font-semibold text-slate-500 mb-1">오프닝 멘트</p>
                      <p className="text-sm text-slate-700">{card.openingMent}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs font-semibold text-slate-500 mb-1">클로징 멘트</p>
                      <p className="text-sm text-slate-700">{card.closingMent}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(card.openingMent, openingMentId)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      {copiedId === openingMentId ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      <span>오프닝 멘트 복사</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(card.closingMent, closingMentId)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      {copiedId === closingMentId ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      <span>클로징 멘트 복사</span>
                    </button>
                    <Link
                      href="/news"
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-full border border-slate-200 text-slate-700 hover:text-[#00a396] hover:border-[#00c4b4]/40 transition-colors"
                      aria-label="상세 보기"
                    >
                      <FileText className="w-4 h-4" />
                      <span>관련 인사이트 보기</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleCopy(checksText, idx + 20001)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-full border border-slate-200 text-slate-700 hover:text-[#00a396] hover:border-[#00c4b4]/40 transition-colors"
                    >
                      {copiedId === idx + 20001 ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      <span>체크리스트 복사</span>
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </CollapsibleSection>
  )
}
