'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { UserButton } from '@/components/auth/user-button'
import { AdminMenu } from '@/components/admin/admin-menu'
import { SearchInput } from './search-input'
import { cn } from '@/lib/utils'
import { ChevronDown, Menu } from 'lucide-react'

// 핵심 메뉴 4개 (항상 노출)
const PRIMARY_NAV = [
  { name: '홈', href: '/' },
  { name: '발행호', href: '/news' },
  { name: '커뮤니티', href: '/community' },
  { name: '자료실', href: '/resources' },
]

// 더보기 드롭다운 메뉴
const MORE_NAV = [
  { name: '유형 테스트', href: '/quiz' },
  { name: '세미나 (준비중)', href: '/seminar' },
  { name: '고객 후기', href: '/reviews' },
  { name: '현장 소식', href: '/field' },
  { name: '구독자 할인', href: '/benefits' },
  { name: '시연신청', href: '/leads/demo', highlight: true as const },
  { name: '오시는 길', href: '/location' },
]

const ALL_NAV = [...PRIMARY_NAV, ...MORE_NAV]

export function HeaderClient() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [moreOpen, setMoreOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const isMoreActive = MORE_NAV.some((item) => pathname === item.href || pathname.startsWith(item.href + '/'))

  useEffect(() => {
    const supabase = createClient()
    let mounted = true
    async function checkAdmin() {
      if (!mounted) return
      const { data: { user } } = await supabase.auth.getUser()
      if (!mounted) return
      if (user) {
        const { data: profileData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()
        if (!mounted) return
        const profile = profileData as { role: string | null } | null
        if (profile && profile.role === 'admin') setIsAdmin(true)
        else setIsAdmin(false)
      } else setIsAdmin(false)
      setLoading(false)
    }
    checkAdmin()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      if (session?.user) checkAdmin()
      else { setIsAdmin(false); setLoading(false) }
    })
    return () => { mounted = false; subscription.unsubscribe() }
  }, [])

  useEffect(() => setMoreOpen(false), [pathname])
  useEffect(() => setMobileMenuOpen(false), [pathname])

  const navLinkClass = (isActive: boolean) =>
    cn(
      'px-3 py-2 text-base font-medium rounded-md transition-colors whitespace-nowrap',
      isActive ? 'text-[#00c4b4] bg-[#00c4b4]/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    )

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* 로고 */}
          <Link href="/" className="shrink-0">
            <img src="/assets/images/nexo_logo_black.png" alt="NEXO Daily" className="h-7 w-auto" />
          </Link>

          {/* 검색 (데스크톱) */}
          <div className="hidden lg:flex flex-1 max-w-xs mx-4">
            <SearchInput />
          </div>

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden lg:flex items-center gap-1">
            {PRIMARY_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={navLinkClass(pathname === item.href)}
              >
                {item.name}
              </Link>
            ))}
            {/* 더보기 드롭다운 */}
            <div className="relative">
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className={cn(navLinkClass(isMoreActive), 'flex items-center gap-1')}
              >
                더보기
                <ChevronDown className={cn('w-4 h-4 transition-transform', moreOpen && 'rotate-180')} />
              </button>
              {moreOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMoreOpen(false)} />
                  <div className="absolute top-full right-0 mt-1 w-44 py-2 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                    {MORE_NAV.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMoreOpen(false)}
                        className={cn(
                          'block px-4 py-2.5 text-base transition-colors',
                          (item as { highlight?: boolean }).highlight
                            ? 'font-bold text-[#00c4b4] bg-[#00c4b4]/10 hover:bg-[#00c4b4]/15'
                            : pathname === item.href ? 'text-[#00c4b4] font-medium bg-[#00c4b4]/5' : 'text-slate-600 hover:bg-slate-50'
                        )}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
            {!loading && isAdmin && (
              <div className="ml-2 pl-2 border-l border-slate-200">
                <AdminMenu />
              </div>
            )}
          </nav>

          {/* 우측: 유저 */}
          <div className="flex items-center gap-2">
            <UserButton />
            {/* 모바일 메뉴 버튼 */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md"
              aria-label="메뉴"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 (펼침/접힘) */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 py-4">
            <div className="grid grid-cols-2 gap-2">
              {ALL_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-4 py-3.5 text-base font-medium rounded-lg transition-colors',
                    (item as { highlight?: boolean }).highlight
                      ? 'font-bold text-[#00c4b4] bg-[#00c4b4]/15 ring-1 ring-[#00c4b4]/30'
                      : pathname === item.href ? 'text-[#00c4b4] bg-[#00c4b4]/10' : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            {!loading && isAdmin && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <AdminMenu />
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

