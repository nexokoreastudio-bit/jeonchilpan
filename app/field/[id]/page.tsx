import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Database } from '@/types/database'
import { sanitizeHtml } from '@/lib/utils/sanitize'
import { ShareBar } from '@/components/social/share-bar'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { incrementFieldNewsViews } from '@/app/actions/field-news'
import { JsonLd } from '@/components/seo/json-ld'
import styles from '../field.module.css'

type FieldNewsRow = Database['public']['Tables']['field_news']['Row']

interface PageProps {
  params: {
    id: string
  }
}

export default async function FieldNewsDetailPage({ params }: PageProps) {
  const supabase = await createClient()
  const newsId = parseInt(params.id)

  if (isNaN(newsId)) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <p>존재하지 않는 현장 소식입니다.</p>
          <Link href="/field" className={styles.backLink}>
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  // 현장 소식 조회
  const { data: fieldNewsData, error } = await supabase
    .from('field_news')
    .select('*')
    .eq('id', newsId)
    .eq('is_published', true)
    .single()

  if (error || !fieldNewsData) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <p>현장 소식을 찾을 수 없습니다.</p>
          <Link href="/field" className={styles.backLink}>
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  const news = fieldNewsData as FieldNewsRow

  // 조회수 증가 (비동기로 처리하여 응답 속도 향상)
  incrementFieldNewsViews(newsId).catch((err) => {
    console.error('조회수 증가 실패:', err)
  })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jeonchilpan.netlify.app'
  const currentUrl = `${baseUrl}/field/${newsId}`
  
  // 첫 번째 이미지 URL 추출
  const firstImageMatch = news.content.match(/<img[^>]+src=["']([^"']+)["']/i)
  const imageUrl = firstImageMatch 
    ? (firstImageMatch[1].startsWith('http') ? firstImageMatch[1] : `${baseUrl}${firstImageMatch[1]}`)
    : `${baseUrl}/assets/images/og-image.png`

  // 구조화된 데이터 (NewsArticle 스키마)
  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: news.title,
    description: news.content.replace(/<[^>]*>/g, '').substring(0, 200),
    image: imageUrl,
    datePublished: news.published_at || news.created_at,
    dateModified: news.updated_at || news.published_at || news.created_at,
    author: {
      '@type': 'Organization',
      name: 'NEXO Korea',
    },
    publisher: {
      '@type': 'Organization',
      name: 'NEXO Korea',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/assets/images/nexo_logo_black.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': currentUrl,
    },
    ...(news.location && {
      contentLocation: {
        '@type': 'Place',
        name: news.location,
      },
    }),
  }

  return (
    <>
      <JsonLd data={jsonLdData} />
      <div className={styles.container}>
      <div className={styles.detailHeader}>
        <Link href="/field">
          <Button variant="ghost" size="sm" className={styles.backButton}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            목록으로
          </Button>
        </Link>
      </div>

      <article className={styles.detailCard}>
        <div className={styles.detailContent}>
          <div className={styles.meta}>
            {news.location && (
              <span className={styles.location}>📍 {news.location}</span>
            )}
            {news.installation_date && (
              <span className={styles.date}>
                📅 {format(new Date(news.installation_date), 'yyyy년 M월 d일', { locale: ko })}
              </span>
            )}
          </div>
          <h1 className={styles.detailTitle}>{news.title}</h1>
          
          {/* 네이버 카페 스타일: 이미지와 텍스트가 자연스럽게 섞인 콘텐츠 */}
          <div
            className={styles.detailDescription}
            dangerouslySetInnerHTML={{ 
              __html: (() => {
                let html = sanitizeHtml(news.content || '')
                
                // 이미지 태그가 있으면 클래스 추가 및 속성 보강
                html = html.replace(
                  /<img([^>]*?)(?:\s+class=["'][^"']*["'])?([^>]*)>/gi,
                  (match, before, after) => {
                    const hasClass = /class=["']/.test(match)
                    if (hasClass) {
                      return match.replace(
                        /class=["']([^"']*)["']/,
                        'class="$1 field-news-image"'
                      )
                    } else {
                      return `<img${before} class="field-news-image"${after}>`
                    }
                  }
                )
                
                // loading="lazy" 추가 (없는 경우만)
                html = html.replace(
                  /<img([^>]*?)(?:\s+loading=["'][^"']*["'])?([^>]*)>/gi,
                  (match) => {
                    if (!/loading=["']/.test(match)) {
                      return match.replace(/>$/, ' loading="lazy">')
                    }
                    return match
                  }
                )
                
                return html
              })()
            }}
          />
          
          <div className={styles.detailFooter}>
            <span className={styles.views}>👁️ {news.views || 0}회 조회</span>
            {news.published_at && (
              <span className={styles.publishedAt}>
                발행일: {format(new Date(news.published_at), 'yyyy년 MM월 dd일', { locale: ko })}
              </span>
            )}
          </div>
        </div>
      </article>

      <div className="px-4 py-3">
        <ShareBar
          title={news.title}
          description={news.content.replace(/<[^>]*>/g, '').substring(0, 100)}
          image={news.images?.[0] || undefined}
        />
      </div>

      <div className={styles.detailActions}>
        <Link href="/field">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            목록으로 돌아가기
          </Button>
        </Link>
      </div>
    </div>
    </>
  )
}

// 메타데이터 생성
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = await createClient()
  const newsId = parseInt(params.id)
  
  if (isNaN(newsId)) {
    return {
      title: '현장 소식을 찾을 수 없습니다',
      description: '요청하신 현장 소식을 찾을 수 없습니다.',
    }
  }

  const { data: fieldNewsData } = await supabase
    .from('field_news')
    .select('*')
    .eq('id', newsId)
    .eq('is_published', true)
    .single()

  if (!fieldNewsData) {
    return {
      title: '현장 소식을 찾을 수 없습니다',
      description: '요청하신 현장 소식을 찾을 수 없습니다.',
    }
  }

  const news = fieldNewsData as FieldNewsRow
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jeonchilpan.netlify.app'
  const currentUrl = `${baseUrl}/field/${newsId}`
  
  // 첫 번째 이미지 URL 추출
  const firstImageMatch = news.content.match(/<img[^>]+src=["']([^"']+)["']/i)
  const imageUrl = firstImageMatch 
    ? (firstImageMatch[1].startsWith('http') ? firstImageMatch[1] : `${baseUrl}${firstImageMatch[1]}`)
    : `${baseUrl}/assets/images/og-image.png`

  const title = `${news.title}${news.location ? ` - ${news.location}` : ''} | 넥소 현장 소식 - NEXO Daily`
  const description = news.content.replace(/<[^>]*>/g, '').substring(0, 160) || '넥소 전자칠판 설치 현장 소식'

  return {
    title,
    description,
    keywords: [
      '넥소 현장 소식',
      '전자칠판 설치',
      news.location || '',
      '전자칠판 후기',
      '학원 전자칠판',
    ].filter(Boolean),
    openGraph: {
      title,
      description,
      url: currentUrl,
      siteName: 'NEXO Daily',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: news.title,
        },
      ],
      type: 'article',
      publishedTime: news.published_at || news.created_at,
      modifiedTime: news.updated_at,
      ...(news.location && {
        section: news.location,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: currentUrl,
    },
  }
}
