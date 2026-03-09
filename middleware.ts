import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Next.js Middleware
 * 모든 요청에 대해 Supabase 세션을 업데이트하고,
 * 보호된 경로에 대한 접근 제어를 수행
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * 다음 경로를 제외한 모든 요청 경로와 일치:
     * - api (API routes) - Supabase Auth rate limit 방지
     * - _next/static, _next/image (정적 파일)
     * - favicon.ico, robots.txt, sitemap.xml
     * - 이미지/HTML 확장자
     */
    '/((?!api|_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|html)$).*)',
  ],
}


