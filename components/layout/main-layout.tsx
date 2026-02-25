'use client'

import { usePathname } from 'next/navigation'

/**
 * 홈(/)에서는 페이지 자체에 포털 사이드바 포함
 * 그 외: [왼쪽 배너 | 콘텐츠 | 우측 사이드바] 3단 레이아웃
 */
export function MainLayout({
  children,
  sidebar,
}: {
  children: React.ReactNode
  sidebar?: React.ReactNode
}) {
  const pathname = usePathname()
  const isHome = pathname === '/'

  if (isHome) {
    return <main className="flex-1">{children}</main>
  }

  return (
    <main className="flex-1 min-h-screen bg-[#f4f6f8]">
      <div className="flex flex-col lg:flex-row container mx-auto max-w-7xl px-3 sm:px-4 md:px-6 py-5 sm:py-8 md:py-10 gap-4 sm:gap-6 xl:gap-8">
        <div className="flex-1 min-w-0">{children}</div>
        {sidebar}
      </div>
    </main>
  )
}
