import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, FileText, Users, ClipboardList } from 'lucide-react'

const SMARTSTORE_EXTERNAL_URL =
  'https://2026-nexo-polic-y-fund.netlify.app/?partner_code=johanju'
const SMARTSTORE_REGIONAL_CONTACT_URL = 'https://sminfo.mss.go.kr/cm/sv/CSV001R9.do'

export const metadata = {
  title: '소상공인 스마트상점 모집 안내',
  description: '지원 대상부터 신청 절차까지, 전자칠판 도입 관점에서 핵심만 정리한 가이드입니다.',
}

const STEPS = [
  {
    title: '1단계: 지원 대상 확인',
    description:
      '업종/사업자 조건을 먼저 확인하세요. 대상 여부를 먼저 확인하면 준비 시간을 크게 줄일 수 있습니다.',
    image: null,
    icon: Users,
  },
  {
    title: '2단계: 신청 절차 확인',
    description:
      '진행 순서와 제출 흐름을 확인하세요. 신청 순서를 미리 알면 서류 누락 위험이 줄어듭니다.',
    image: '/assets/images/smartstore/application-step-guide.png',
    icon: ClipboardList,
  },
  {
    title: '3단계: 신청서 작성/제출',
    description:
      '신청서 양식을 확인하고 제출을 준비하세요. 어려운 항목은 상담을 통해 빠르게 정리할 수 있습니다.',
    image: 'https://2026-nexo-polic-y-fund.netlify.app/assets/landing/step5.png',
    icon: FileText,
  },
]

const NOTICE_POINTS = [
  {
    keyword: '목적',
    detail: '소비·유통환경의 비대면·디지털화에 따라 소상공인 사업장에 스마트기술 도입을 지원해 경쟁력을 높이는 사업',
  },
  {
    keyword: '지원대상',
    detail: '「소상공인기본법」 제2조에 따른 소상공인으로, 신청일 현재 정상 영업 중인 점포',
  },
  {
    keyword: '소상공인 부합 여부 확인 조건(요약)',
    detail: '교육/서비스업, 5인 미만(4대보험 가입자), 연매출 15억 이하',
  },
  {
    keyword: '모집내용',
    detail: '소상공인의 디지털 전환 및 스마트기술 보급 지원',
  },
  {
    keyword: '지원규모',
    detail: '공급가액 최대 60% 지원(최대 500만원)',
  },
  {
    keyword: '모집기간',
    detail: '2026년 3월 13일(금) 10:00 ~ 4월 1일(수) 17:00',
  },
]

export default function SmartstoreCampaignPage() {
  return (
    <div className="bg-[#f4f6f8] min-h-screen">
      <div className="container mx-auto max-w-6xl px-4 py-6 md:py-10 space-y-4">
        <section className="bg-[radial-gradient(circle_at_top,#10316b_0%,#0b1f45_52%,#08142f_100%)] border border-[#1b3f7a] rounded-lg shadow-sm overflow-hidden">
          <div className="px-5 sm:px-6 py-7 sm:py-8">
            <span className="inline-flex items-center rounded-full bg-[#00c4b4]/25 border border-[#7df6ec]/40 px-4 py-1.5 text-sm sm:text-base font-extrabold text-[#bafff9]">
              2026 소상공인 스마트상점 모집
            </span>
            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              신청이 복잡해도 괜찮습니다.
              <br />
              전칠판이 절차를 쉽게 안내해드립니다.
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-200/90 max-w-3xl">
              소상공인 지원 대상 확인부터 신청서 제출까지 순서대로 정리했습니다.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <a
                href={SMARTSTORE_EXTERNAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-[#00c4b4] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#00a99a] transition-colors"
              >
                신청절차 자세히 보기
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            return (
              <article key={step.title} className="bg-white border border-gray-200/80 rounded-lg shadow-sm p-5">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-[#00a396]" />
                  <h3 className="text-base font-bold text-slate-800">{step.title}</h3>
                </div>
                <p className="mt-2 text-sm text-slate-600">{step.description}</p>
                {index === 0 ? (
                  <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:p-5">
                    <h4 className="text-sm font-bold text-slate-800">2026년 스마트상점 기술보급사업 참여 소상공인 모집공고</h4>
                    <p className="mt-1 text-sm text-slate-600">
                      목적부터 지원대상, 지원규모, 모집기간까지 핵심 내용만 정리했습니다.
                    </p>
                    <ul className="mt-3 space-y-2">
                      {NOTICE_POINTS.map((point) => (
                        <li key={point.keyword} className="flex items-start gap-2 text-sm text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-[#00a396] mt-0.5 shrink-0" />
                          <span>
                            <span className="font-extrabold text-[#0e9f93]">{point.keyword}</span>
                            <span className="font-semibold text-[#0e9f93]">: </span>
                            {point.detail}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="mt-4 relative w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                    <Image
                      src={step.image as string}
                      alt={step.title}
                      width={1400}
                      height={850}
                      className="w-full h-auto"
                    />
                  </div>
                )}
              </article>
            )
          })}
        </section>

        <section className="bg-white border border-gray-200/80 rounded-lg shadow-sm p-5">
          <h2 className="text-base font-bold text-slate-800">신청이 어렵다면 이렇게 진행하세요</h2>
          <ul className="mt-3 space-y-2">
            <li className="flex items-start gap-2 text-sm text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-[#00a396] mt-0.5 shrink-0" />
              지원 대상 확인이 애매하면 상담에서 우선 판별해드립니다.
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-[#00a396] mt-0.5 shrink-0" />
              서류 준비/제출 순서를 체크리스트 형태로 안내해드립니다.
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-[#00a396] mt-0.5 shrink-0" />
              전자칠판 도입 목적에 맞춰 신청 전략을 맞춤 정리해드립니다.
            </li>
          </ul>
          <div className="mt-5">
            <a
              href={SMARTSTORE_EXTERNAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
            >
              파트너 페이지에서 상세 확인
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>

        <section className="bg-white border border-gray-200/80 rounded-lg shadow-sm p-5">
          <h2 className="text-base font-bold text-slate-800">지역 문의처 안내 이미지</h2>
          <p className="text-sm text-slate-600 mt-1">지역별 문의가 필요한 경우 아래 안내 이미지를 참고하세요.</p>
          <a
            href={SMARTSTORE_REGIONAL_CONTACT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block relative w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50 hover:border-[#00c4b4] transition-colors"
          >
            <Image
              src="/assets/images/smartstore/regional-contact-guide.png"
              alt="지역별 문의처 안내"
              width={1200}
              height={700}
              className="w-full h-auto"
            />
          </a>
        </section>
      </div>
    </div>
  )
}
