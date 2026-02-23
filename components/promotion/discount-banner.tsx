'use client'

import Link from 'next/link'
import { Percent, ShoppingCart } from 'lucide-react'

/**
 * 구독자 인증 할인 홍보 배너
 * 메인 페이지나 뉴스레터에 표시되는 홍보용 배너
 */
export function DiscountBanner() {
  return (
    <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-sm overflow-hidden">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="bg-[#00c4b4]/10 rounded-xl p-3 shrink-0">
            <Percent className="w-6 h-6 text-[#00c4b4]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              🎁 구독자 인증 시 10% 할인 혜택
            </h3>
            <p className="text-sm text-gray-600">
              전자칠판 구매 시 구독자 인증을 완료하시면 <strong className="text-gray-800">10% 할인</strong>이 자동 적용됩니다
            </p>
          </div>
        </div>
        <Link
          href="/mypage"
          className="flex items-center gap-2 bg-[#00c4b4] text-white font-medium px-5 py-2.5 rounded-lg hover:bg-[#00a396] transition-colors whitespace-nowrap text-sm"
        >
          <ShoppingCart className="w-4 h-4" />
          인증하러 가기
        </Link>
      </div>
    </div>
  )
}


