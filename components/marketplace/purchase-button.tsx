'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { purchaseMaterial } from '@/app/actions/marketplace'
import { createClient } from '@/lib/supabase/client'
import { Coins } from 'lucide-react'

interface PurchaseButtonProps {
  materialId: number
  price: number
}

export function PurchaseButton({ materialId, price }: PurchaseButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePurchase = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('로그인이 필요합니다.')
      return
    }

    setLoading(true)
    setError(null)
    const result = await purchaseMaterial(materialId, user.id)
    setLoading(false)

    if (result.success) {
      router.refresh()
    } else {
      setError(result.error || '구매에 실패했습니다.')
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handlePurchase}
        disabled={loading}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#1a1a1a] text-white font-semibold hover:bg-[#00c4b4] transition-colors disabled:opacity-60"
      >
        <Coins className="w-5 h-5" />
        {loading ? '처리 중...' : `${price}P로 구매하기`}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
