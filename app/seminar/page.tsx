import Link from 'next/link'
import { Construction } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '세미나·클래스 | 준비중',
  description: '원장·강사 역량 강화를 위한 세미나 및 VOD 클래스. 준비 중입니다.',
  openGraph: {
    title: '세미나·클래스 | NEXO Daily',
    description: '준비 중입니다.',
  },
}

export default function SeminarPage() {
  return (
    <section className="bg-white border border-gray-200/80 overflow-hidden rounded-lg shadow-sm p-8 md:p-12">
        <div className="flex flex-col items-center justify-center text-center max-w-xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
            <Construction className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            세미나·클래스
          </h1>
          <p className="text-4xl font-bold text-[#00c4b4] mb-2">준비중</p>
          <p className="text-gray-600 mb-8">
            원장님·강사님을 위한 온·오프라인 세미나와 VOD 클래스를 준비하고 있어요.
            <br className="hidden md:block" />
            곧 공개될 예정입니다.
          </p>
          <Link
            href="/"
            className="text-sm font-medium text-[#00c4b4] hover:underline"
          >
            홈으로 돌아가기
          </Link>
        </div>
    </section>
  )
}
