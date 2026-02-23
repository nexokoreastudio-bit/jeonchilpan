import { MetadataRoute } from 'next'
import { getAllEditions } from '@/lib/supabase/articles'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://daily-nexo.netlify.app'
  
  // 기본 페이지
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/community`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/resources`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/field`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/reviews`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/seminar`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/quiz`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/community?board=bamboo`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.75,
    },
    {
      url: `${baseUrl}/community?board=materials`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.75,
    },
  ]

  try {
    // 발행호 페이지
    const editions = await getAllEditions()
    const editionRoutes = editions.map((editionId) => ({
      url: `${baseUrl}/news/${editionId}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    // 발행된 현장 소식 페이지
    const supabase = await createClient()
    const { data: fieldNews } = await supabase
      .from('field_news')
      .select('id, updated_at, published_at, created_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(100) // 최근 100개만 (사이트맵 크기 제한 고려)

    // 커뮤니티 게시글 (SEO용 - 검색 노출)
    const { data: communityPosts } = await supabase
      .from('posts')
      .select('id, updated_at, created_at')
      .order('created_at', { ascending: false })
      .limit(200)

    const communityRoutes = (communityPosts || []).map((post: { id: number; updated_at: string; created_at: string }) => ({
      url: `${baseUrl}/community/${post.id}`,
      lastModified: post.updated_at ? new Date(post.updated_at) : new Date(post.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

    // 세미나 목록
    const { data: seminars } = await supabase
      .from('seminars')
      .select('id, updated_at')
      .limit(50)

    const seminarRoutes = (seminars || []).map((s: { id: number; updated_at: string }) => ({
      url: `${baseUrl}/seminar/${s.id}`,
      lastModified: s.updated_at ? new Date(s.updated_at) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))

    const fieldNewsRoutes = (fieldNews || []).map((news: any) => ({
      url: `${baseUrl}/field/${news.id}`,
      lastModified: news.updated_at 
        ? new Date(news.updated_at) 
        : news.published_at 
        ? new Date(news.published_at) 
        : new Date(news.created_at),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
    
    return [...routes, ...editionRoutes, ...communityRoutes, ...seminarRoutes, ...fieldNewsRoutes]
  } catch (error) {
    console.error('Sitemap 생성 오류:', error)
    return routes
  }
}

