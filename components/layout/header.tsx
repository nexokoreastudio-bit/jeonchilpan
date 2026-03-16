import Link from 'next/link'
import { UserButton } from '@/components/auth/user-button'
import { AdminMenu } from '@/components/admin/admin-menu'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'
import { SearchInput } from './search-input'

type UserRow = Database['public']['Tables']['users']['Row']

// 헤더는 자주 렌더링되므로 캐싱 적용
export const revalidate = 60 // 1분마다 재검증

export async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 관리자 권한 확인 (캐싱 최적화)
  let isAdmin = false
  if (user) {
    try {
      // 사용자 ID를 기반으로 캐시 키 생성
      const cacheKey = `user-role-${user.id}`
      
      // 간단한 쿼리로 최적화 (role만 조회)
      const { data: profileData, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .maybeSingle() // 데이터가 없어도 에러가 아닌 null 반환
      
      const profile = profileData as Pick<UserRow, 'role'> | null
      
      if (!error && profile) {
        isAdmin = profile.role === 'admin'
      }
    } catch (error) {
      // 에러 발생 시 기본값 유지 (isAdmin = false)
      if (process.env.NODE_ENV === 'development') {
        console.error('관리자 권한 확인 오류:', error)
      }
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
      {/* 첫 번째 줄: 로고, 검색바, 마이페이지 */}
      <div className="container flex h-16 items-center justify-between px-4 max-w-7xl mx-auto gap-4">
        <div className="flex items-center gap-8 flex-1">
          <Link href="/" className="flex items-center space-x-3 flex-shrink-0">
            <img
              src="/assets/images/nexo_logo_black.png"
              alt="NEXO Daily"
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold font-serif text-nexo-navy tracking-tight hidden sm:inline">
              Daily
            </span>
          </Link>
          
          {/* 검색 바 */}
          <SearchInput />
        </div>
        <UserButton />
      </div>
      
      {/* 두 번째 줄: 네비게이션 메뉴 */}
      <div className="border-t border-gray-100 bg-white">
        <div className="container px-4 max-w-7xl mx-auto">
          <nav className="flex items-center gap-6 overflow-x-auto overflow-y-visible py-3">
            <Link
              href="/"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-nexo-navy whitespace-nowrap"
            >
              홈
            </Link>
            <Link
              href="/news"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-nexo-navy whitespace-nowrap"
            >
              인사이트 모아보기
            </Link>
            <Link
              href="/news/crawled"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-nexo-navy whitespace-nowrap"
            >
              전체 기사
            </Link>
            <Link
              href="/community"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-nexo-navy whitespace-nowrap"
            >
              전칠판
            </Link>
            <Link
              href="/seminar"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-nexo-navy whitespace-nowrap"
            >
              세미나
            </Link>
            <Link
              href="/reviews"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-nexo-navy whitespace-nowrap"
            >
              고객 후기
            </Link>
            <Link
              href="/resources"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-nexo-navy whitespace-nowrap"
            >
              자료실
            </Link>
            <Link
              href="/smartstore"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-nexo-navy whitespace-nowrap"
            >
              스마트상점 모집
            </Link>
            <Link
              href="/field"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-nexo-navy whitespace-nowrap"
            >
              현장 소식
            </Link>
            <Link
              href="/benefits"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-nexo-navy whitespace-nowrap"
            >
              레벨별 혜택
            </Link>
            <Link
              href="/leads/demo"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-nexo-navy whitespace-nowrap"
            >
              상담 신청
            </Link>
            <Link
              href="/leads/quote"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-nexo-navy whitespace-nowrap"
            >
              견적 요청
            </Link>
            <Link
              href="/location"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-nexo-navy whitespace-nowrap"
            >
              오시는 길
            </Link>
            {isAdmin && (
              <div className="relative whitespace-nowrap">
                <AdminMenu />
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
