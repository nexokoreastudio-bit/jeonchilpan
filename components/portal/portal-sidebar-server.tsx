import {
  getPortalNotices,
  getPortalEducationNews,
  getPopularPosts,
  getLatestPosts,
  getLatestComments,
} from '@/lib/supabase/portal'
import { PortalSidebar } from './portal-sidebar'

/**
 * 서버에서 포털 사이드바 데이터를 가져와 PortalSidebar를 렌더링
 * 메인페이지와 동일한 섹션(공지, 학업뉴스, 인기글/최신글/댓글) 표시
 */
export async function PortalSidebarServer() {
  const [notices, educationNews, popularPosts, latestPosts, latestComments] = await Promise.all([
    getPortalNotices(5),
    getPortalEducationNews(5),
    getPopularPosts(10),
    getLatestPosts(10),
    getLatestComments(10),
  ])

  return (
    <PortalSidebar
      notices={notices}
      educationNews={educationNews}
      popularPosts={popularPosts}
      latestPosts={latestPosts}
      latestComments={latestComments}
    />
  )
}
