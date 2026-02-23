import { redirect } from 'next/navigation'

/**
 * 마켓플레이스 → 자료실로 리다이렉트 (Lean 리뉴얼)
 */
export default function MarketplacePage() {
  redirect('/resources')
}
