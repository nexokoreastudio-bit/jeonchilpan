'use client'

import { usePathname } from 'next/navigation'
import { PageSidebar } from './page-sidebar'

/**
 * 홈(/)에서는 PageSidebar 숨김 (포털 사이드바 사용)
 * 그 외 페이지에서는 PageSidebar 표시
 */
export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isHome = pathname === '/'

  return (
    <main className="flex-1 flex">
      <div className="flex-1 min-w-0">{children}</div>
      {!isHome && <PageSidebar />}
    </main>
  )
}
