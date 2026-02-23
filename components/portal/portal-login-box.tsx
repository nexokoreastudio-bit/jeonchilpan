'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { signOut } from '@/app/actions/auth'
import { ChevronRight } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

export function PortalLoginBox() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    let mounted = true

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (mounted) {
        setUser(user)
        setLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null)
        if (!session?.user) setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      await signOut()
      setUser(null)
      router.refresh()
      if (typeof window !== 'undefined') window.location.href = '/'
    } catch (error) {
      console.error('로그아웃 오류:', error)
      if (typeof window !== 'undefined') window.location.href = '/'
    }
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-200/80 overflow-hidden rounded-lg shadow-sm">
        <div className="p-4 flex items-center justify-center">
          <div className="h-8 w-24 animate-pulse bg-slate-100 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200/80 overflow-hidden rounded-lg shadow-sm">
      {!user ? (
        <>
          <div className="p-4">
            <Link
              href="/login"
              className="flex items-center justify-center w-full py-2.5 px-4 rounded-md bg-[#00c4b4] text-white text-sm font-semibold hover:bg-[#00a396] transition-colors"
            >
              로그인
            </Link>
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-3 text-xs text-slate-500">
              <Link href="/signup" className="hover:text-[#00c4b4] transition-colors">
                회원가입
              </Link>
              <span className="text-slate-300">|</span>
              <Link href="/find-password" className="hover:text-[#00c4b4] transition-colors">
                비밀번호 찾기
              </Link>
              <span className="text-slate-300">|</span>
              <Link href="/find-id" className="hover:text-[#00c4b4] transition-colors" title="이메일이 아이디입니다">
                아이디 찾기
              </Link>
            </div>
          </div>
        </>
      ) : (
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-[#00c4b4]/10 flex items-center justify-center text-sm font-bold text-[#00c4b4] shrink-0">
              {(user.user_metadata?.name || user.email || '?').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {user.user_metadata?.name || '회원'}
              </p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/mypage"
              className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium text-[#00c4b4] hover:text-[#00a396] border border-[#00c4b4]/30 rounded-md hover:bg-[#00c4b4]/5 transition-colors"
            >
              마이페이지
              <ChevronRight className="w-3 h-3" />
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 border border-gray-200 rounded-md hover:bg-slate-50 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
