'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

const HIDE_KEY = 'nexo_smartstore_popup_hidden_until'
const ONE_DAY_MS = 24 * 60 * 60 * 1000

export function SmartstorePopupBanner() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      const hiddenUntil = Number(window.localStorage.getItem(HIDE_KEY) || '0')
      if (!hiddenUntil || Date.now() > hiddenUntil) {
        setOpen(true)
      }
    } catch {
      setOpen(true)
    }
  }, [])

  const handleCloseForToday = () => {
    try {
      window.localStorage.setItem(HIDE_KEY, String(Date.now() + ONE_DAY_MS))
    } catch {}
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 p-4">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        <div className="flex items-start justify-between gap-2 px-5 pt-5">
          <div>
            <p className="text-xs font-semibold text-[#00a396]">소상공인 스마트상점 모집</p>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              지원 대상 확인하고, 전자칠판 도입 상담받으세요
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="팝업 닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-3 text-sm text-slate-600">
          모집 안내, 신청 절차, 견적 상담까지 한 번에 확인할 수 있습니다.
        </div>

        <div className="px-5 pb-5 flex flex-wrap gap-2">
          <Link
            href="/smartstore"
            className="inline-flex items-center justify-center rounded-md bg-[#00c4b4] px-4 py-2 text-sm font-semibold text-white hover:bg-[#00a99a] transition-colors"
            onClick={() => setOpen(false)}
          >
            모집 안내 보기
          </Link>
          <Link
            href="/leads/consultation?campaign=smartstore_popup"
            className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            onClick={() => setOpen(false)}
          >
            견적 상담
          </Link>
          <button
            type="button"
            onClick={handleCloseForToday}
            className="ml-auto text-xs text-slate-500 hover:text-slate-700 underline underline-offset-2"
          >
            오늘 하루 보지 않기
          </button>
        </div>
      </div>
    </div>
  )
}

