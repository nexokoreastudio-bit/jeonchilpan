import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { CheckCircle2 } from 'lucide-react'

export const metadata = {
  title: '구독자 할인 안내 | NEXO Daily',
  description: '넥소 전자칠판 구매 시리얼 번호로 인증 시 추가 할인 혜택을 받을 수 있습니다.',
}

export default async function BenefitsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <section className="bg-white border border-gray-200/80 overflow-hidden rounded-lg shadow-sm max-w-2xl">
          <div className="border-b border-gray-100 bg-slate-50/50 px-4 py-3">
            <h1 className="text-sm font-bold text-slate-800">구독자 할인 안내</h1>
            <p className="text-slate-500 text-xs mt-0.5">
              넥소 전자칠판을 구매하신 분은 시리얼 번호 인증으로 추가 혜택을 받을 수 있습니다
            </p>
          </div>
          <div className="p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">인증 시 혜택</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#00c4b4] flex-shrink-0 mt-0.5" />
              <span>추가 구매 시 할인 적용</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#00c4b4] flex-shrink-0 mt-0.5" />
              <span>자료실 자료 무료 다운로드</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#00c4b4] flex-shrink-0 mt-0.5" />
              <span>전칠판·발행호·인사이트 이용</span>
            </li>
          </ul>

          <p className="text-sm text-gray-500 pt-4">
            구매 시 받으신 시리얼 번호를 마이페이지에서 인증하시면 됩니다.
          </p>

          <div className="pt-4">
            {user ? (
              <Link href="/mypage">
                <Button className="w-full md:w-auto">마이페이지에서 인증하기</Button>
              </Link>
            ) : (
              <div className="flex gap-2">
                <Link href="/login">
                  <Button variant="outline">로그인</Button>
                </Link>
                <Link href="/signup">
                  <Button>회원가입</Button>
                </Link>
              </div>
            )}
          </div>

          <div className="px-6 pb-8 pt-2 border-t border-gray-100 text-center">
            <Link
              href="/leads/demo"
              className="text-[#00c4b4] hover:underline font-medium"
            >
              전자칠판 시연 예약 →
            </Link>
          </div>
          </div>
    </section>
  )
}
