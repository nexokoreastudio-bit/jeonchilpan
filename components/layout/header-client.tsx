'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AdminMenu } from '@/components/admin/admin-menu'
import { SearchInput } from './search-input'
import { cn } from '@/lib/utils'
import { ChevronDown, Menu, Home, Star, Sun, Moon } from 'lucide-react'

// 전칠판 커뮤니티 스타일: 메가메뉴 구조 (2단계 네비)
const MEGA_NAV = [
  {
    name: '2026년 소상공인스마트 상점',
    href: '/smartstore',
    columns: [
      { title: '스마트상점 모집', items: [
        { name: '모집 안내', href: '/smartstore' },
        { name: '신청절차 자세히 보기', href: 'https://2026-nexo-polic-y-fund.netlify.app/?partner_code=johanju' },
      ]},
    ],
  },
  {
    name: 'NEXO',
    href: '/',
    icon: Home,
    columns: [
      { title: 'NEXO 콘텐츠', items: [
        { name: '전칠판 홈으로 이동', href: '/' },
        { name: '오늘의 인사이트 모아보기', href: '/news' },
        { name: '전체 기사 보기', href: '/news/crawled' },
      ]},
      { title: 'NEXO 신뢰', items: [
        { name: '고객 후기', href: '/reviews' },
        { name: '현장 소식', href: '/field' },
      ]},
      { title: 'NEXO 체험', items: [
        { name: '상담신청', href: '/leads/consultation' },
        { name: '세미나', href: '/seminar' },
        { name: '스마트상점 모집', href: '/smartstore' },
      ]},
      { title: 'NEXO 혜택', items: [
        { name: '구독자 할인', href: '/benefits' },
        { name: '오시는 길', href: '/location' },
      ]},
    ],
  },
  {
    name: '전칠판',
    href: '/community',
    columns: [
      { title: '전칠판', items: [
        { name: '전체', href: '/community' },
        { name: '공지사항', href: '/community?board=notice' },
        { name: '원장님 대나무숲', href: '/community?board=bamboo' },
        { name: '공유자료실', href: '/community?board=materials' },
        { name: '구독자 인증', href: '/community?board=verification' },
        { name: '질문/답변', href: '/community' },
        { name: '활용 나눔', href: '/community' },
        { name: '가입인사', href: '/community' },
      ]},
    ],
  },
  {
    name: '자료실',
    href: '/resources',
    columns: [
      { title: '자료실', items: [
        { name: '전체 자료', href: '/resources' },
        { name: '유형 테스트', href: '/quiz' },
      ]},
    ],
  },
  {
    name: '현장소식',
    href: '/field',
    columns: [
      { title: '현장소식', items: [
        { name: '현장소식 전체', href: '/field' },
      ]},
    ],
  },
  {
    name: '더보기',
    href: '#',
    columns: [
      { title: '더보기', items: [
        { name: '로그인', href: '/login' },
        { name: '회원가입', href: '/signup' },
        { name: '세미나', href: '/seminar' },
        { name: '고객 후기', href: '/reviews' },
        { name: '구독자 할인', href: '/benefits' },
        { name: '오시는 길', href: '/location' },
      ]},
    ],
  },
  {
    name: '상담신청',
    href: '/leads/consultation',
    highlight: true,
    columns: [
      { title: '상담신청', items: [
        { name: '상담신청', href: '/leads/consultation' },
      ]},
    ],
  },
]

// 플랫 링크 (모바일용) - 로그인/마이페이지 제외 (상단에 별도 배치)
const ALL_NAV_LINKS = MEGA_NAV.flatMap((n) =>
  n.columns.flatMap((c) => c.items.map((i) => ({ href: i.href, name: i.name })))
)


export function HeaderClient() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const handleAddFavorite = () => {
    if (typeof window !== 'undefined') {
      const title = document.title || 'NEXO Daily'
      const url = window.location.href
      try {
        if ((window.sidebar && (window as any).sidebar.addPanel) || (window.external && (window.external as any).AddFavorite)) {
          ;(window.external as any).AddFavorite(url, title)
        } else {
          window.alert(`즐겨찾기에 추가하려면 Ctrl+D (Mac: Cmd+D)를 누르세요.\n\n또는 브라우저 메뉴에서 즐겨찾기 추가를 선택하세요.`)
        }
      } catch {
        window.alert(`즐겨찾기에 추가하려면 Ctrl+D (Mac: Cmd+D)를 누르세요.`)
      }
    }
  }

  const handleSetHomepage = () => {
    if (typeof window !== 'undefined') {
      const url = window.location.origin
      window.alert(`시작페이지로 설정하려면 브라우저 설정에서 수동으로 추가해주세요.\n\nURL: ${url}`)
    }
  }

  useEffect(() => {
    const supabase = createClient()
    let mounted = true
    async function checkAdmin() {
      if (!mounted) return
      const { data: { user } } = await supabase.auth.getUser()
      if (!mounted) return
      if (user) {
        setIsLoggedIn(true)
        const { data: profileData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()
        if (!mounted) return
        const profile = profileData as { role: string | null } | null
        if (profile && profile.role === 'admin') setIsAdmin(true)
        else setIsAdmin(false)
      } else {
        setIsLoggedIn(false)
        setIsAdmin(false)
      }
      setLoading(false)
    }
    checkAdmin()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      if (session?.user) {
        setIsLoggedIn(true)
        checkAdmin()
      } else {
        setIsLoggedIn(false)
        setIsAdmin(false)
        setLoading(false)
      }
    })
    return () => { mounted = false; subscription.unsubscribe() }
  }, [])

  useEffect(() => setMobileMenuOpen(false), [pathname])

  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href))

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm">
      {/* 1. 상단 유틸리티 바 - 모바일: 압축, 웹: 그대로 */}
      <div className="bg-slate-50 border-b border-slate-100 py-2 md:py-3 mb-2">
        <div className="container mx-auto px-3 md:px-4 flex items-center justify-between gap-2 md:gap-4">
          <div className="flex items-center gap-2 md:gap-3 text-xs text-slate-600 min-h-[44px] md:min-h-0 items-center">
            <Link href="/" className="flex items-center gap-1 hover:text-slate-800 transition-colors py-2 -my-2 px-1 -mx-1 md:py-0 md:my-0 md:px-0 md:mx-0">
              <Home className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">홈</span>
            </Link>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <button type="button" onClick={handleAddFavorite} className="flex items-center gap-1 hover:text-slate-800 transition-colors py-2 -my-2 px-1 -mx-1 md:py-0 md:my-0 md:px-0 md:mx-0">
              <Star className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">즐겨찾기 추가</span>
            </button>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <button type="button" onClick={handleSetHomepage} className="hidden sm:flex items-center gap-1 hover:text-slate-800 transition-colors">
              시작페이지 설정
            </button>
            <span className="text-slate-300 hidden md:inline">|</span>
            <button
              type="button"
              onClick={() => setDarkMode((d) => !d)}
              className="flex items-center gap-1 hover:text-slate-800 transition-colors py-2 -my-2 px-1 -mx-1 md:py-0 md:my-0 md:px-0 md:mx-0"
              aria-label="야간 모드"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5 shrink-0" /> : <Moon className="w-3.5 h-3.5 shrink-0" />}
              <span className="hidden sm:inline">야간 모드</span>
            </button>
          </div>
          <span className="text-xs text-slate-500 hidden sm:inline">NEXO Daily</span>
        </div>
      </div>

      {/* 2. 검색 섹션 - 모바일: 세로 배치·작은 로고, 웹: 가로 */}
      <div className="border-b border-slate-100 py-2 md:py-0.5 mt-0 mb-0">
        <div className="container mx-auto px-3 md:px-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 lg:gap-6">
            {/* 로고 - 모바일 작게 */}
            <Link href="/" className="shrink-0 flex items-center gap-2 self-start sm:self-center">
              <img src="/assets/images/jeonchilpan_logo.png" alt="전칠판" className="h-14 sm:h-20 md:h-24 w-auto" />
            </Link>

            {/* 검색바 - 모바일 풀폭 */}
            <div className="flex-1 w-full sm:min-w-0 max-w-xl">
              <SearchInput />
            </div>
          </div>
        </div>
      </div>

      {/* 2.5 전광판 광고 바 */}
      <Link
        href="/smartstore"
        className="block border-y border-[#8a6a00] bg-[#2a2200] hover:bg-[#3a2f00] transition-colors"
      >
        <div className="container mx-auto px-3 md:px-4">
          <div className="py-2.5 text-center text-[#ffe866] text-sm font-semibold">
            <span className="smartstore-glow mr-2">●</span>
            <span className="smartstore-text-glow">2026년 소상공인스마트상점 모집중!! 4월1일 마감 빨리신청하세요</span>
            <span className="smartstore-glow ml-2">●</span>
          </div>
        </div>
      </Link>

      {/* 3. 메뉴 바 - 개별 드롭다운 (호버 시 해당 메뉴만) */}
      <div className="bg-slate-800 pt-2 pb-2 mt-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center">
            <nav className="hidden lg:flex items-center flex-1 gap-0">
              {MEGA_NAV.map((item) => {
                const Icon = item.icon
                const isOpen = hoveredNav === item.name
                const itemActive = isActive(item.href)
                return (
                  <div
                    key={item.name}
                    className="relative flex items-center"
                    onMouseEnter={() => setHoveredNav(item.name)}
                    onMouseLeave={() => setHoveredNav(null)}
                  >
                    {item.name !== 'NEXO' && <span className="w-px h-4 bg-slate-600 shrink-0 mx-0.5" />}
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors',
                        (item as { highlight?: boolean }).highlight
                          ? 'text-[#00c4b4] hover:bg-[#00c4b4]/15'
                          : itemActive
                          ? 'text-white'
                          : 'text-slate-300 hover:text-white hover:bg-slate-700/80'
                      )}
                    >
                      {Icon && <Icon className="w-4 h-4 shrink-0" />}
                      {item.name}
                      <ChevronDown className={cn('w-3.5 h-3.5 shrink-0 transition-transform', isOpen && 'rotate-180')} />
                    </Link>

                    {/* 개별 드롭다운 - 메뉴바와 동일한 색상, 직각 */}
                    {isOpen && (
                      <div className="absolute left-0 top-full pt-1 z-50" onMouseEnter={() => setHoveredNav(item.name)}>
                        <div className={cn(
                          'py-2 bg-slate-800 border border-slate-600 shadow-lg',
                          item.name === 'NEXO'
                            ? 'min-w-[480px] grid grid-cols-2 gap-x-6 gap-y-2'
                            : item.name === '전칠판'
                            ? 'min-w-[220px] max-h-[360px] overflow-y-auto'
                            : 'min-w-[200px]'
                        )}>
                          {item.columns.map((col) => (
                            <div key={col.title} className="px-1">
                              <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-600 mb-1">
                                {col.title}
                              </div>
                              <ul className="space-y-0.5">
                                {col.items.map((link) => (
                                  <li key={`${link.href}-${link.name}`}>
                                    <Link
                                      href={link.href}
                                      className={cn(
                                        'block px-3 py-2 text-sm transition-colors',
                                        isActive(link.href)
                                          ? 'text-[#00c4b4] font-medium bg-[#00c4b4]/15'
                                          : 'text-slate-200 hover:bg-slate-700 hover:text-white'
                                      )}
                                    >
                                      {link.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
              {!loading && isAdmin && (
                <div className="ml-2 pl-2 border-l border-slate-600">
                  <AdminMenu variant="dark" />
                </div>
              )}
            </nav>

            {/* 모바일 메뉴 버튼 */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-3 text-slate-200 hover:text-white"
              aria-label="메뉴"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 (펼침) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-600 bg-slate-800 py-4">
          <div className="container px-4">
            {/* 로그인/마이페이지 - 모바일에서 최상단 노출 */}
            <div className="flex gap-2 mb-4 pb-4 border-b border-slate-600">
              {loading ? (
                <span className="px-4 py-3 text-sm text-slate-400">로딩 중...</span>
              ) : isLoggedIn ? (
                <Link
                  href="/mypage"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 px-4 py-3 text-sm font-semibold rounded-lg text-center min-h-[44px] flex items-center justify-center bg-[#00c4b4] text-white hover:bg-[#00a396]"
                >
                  마이페이지
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex-1 px-4 py-3 text-sm font-semibold rounded-lg text-center min-h-[44px] flex items-center justify-center',
                      pathname === '/login' ? 'text-[#00c4b4] bg-slate-600' : 'bg-[#00c4b4] text-white hover:bg-[#00a396]'
                    )}
                  >
                    로그인
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 px-4 py-3 text-sm font-semibold rounded-lg text-center min-h-[44px] flex items-center justify-center border border-slate-500 text-slate-200 hover:bg-slate-600"
                  >
                    회원가입
                  </Link>
                </>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {ALL_NAV_LINKS.map((item, i) => (
                <Link
                  key={`${item.href}-${item.name}-${i}`}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'px-4 py-3 text-sm font-medium rounded-lg',
                    isActive(item.href) ? 'text-[#00c4b4] bg-slate-600' : 'text-slate-200 hover:bg-slate-600'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            {!loading && isAdmin && (
              <div className="mt-4 pt-4 border-t border-slate-600">
                <AdminMenu variant="dark" />
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .smartstore-glow {
          color: #ffd23a;
          animation: smartstore-blink 1.1s steps(2, start) infinite;
        }

        .smartstore-text-glow {
          animation: smartstore-text-blink 1.1s steps(2, start) infinite;
        }

        @keyframes smartstore-blink {
          0%,
          49% {
            opacity: 1;
            text-shadow: 0 0 0 transparent;
          }
          50%,
          100% {
            opacity: 0.35;
            text-shadow: 0 0 8px rgba(255, 210, 58, 0.9);
          }
        }

        @keyframes smartstore-text-blink {
          0%,
          49% {
            opacity: 1;
            text-shadow: 0 0 0 transparent;
          }
          50%,
          100% {
            opacity: 0.75;
            text-shadow: 0 0 10px rgba(255, 224, 102, 0.5);
          }
        }
      `}</style>
    </header>
  )
}
