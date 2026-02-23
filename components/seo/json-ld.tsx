/**
 * JSON-LD 구조화 데이터 컴포넌트
 * 검색 엔진이 콘텐츠를 더 잘 이해할 수 있도록 구조화된 데이터 제공
 */

interface JsonLdProps {
  data: Record<string, any>
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

/**
 * Organization 스키마 (회사 정보)
 */
export function OrganizationJsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://daily-nexo.netlify.app'
  
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'NEXO Korea',
        url: baseUrl,
        logo: `${baseUrl}/assets/images/nexo_logo_black.png`,
        description: '넥소 전자칠판 사용자들을 위한 교육 정보 큐레이션 및 커뮤니티 플랫폼',
        sameAs: [
          // 소셜 미디어 링크 추가 가능
        ],
      }}
    />
  )
}

/**
 * NewsArticle 스키마 (뉴스 기사)
 */
export function NewsArticleJsonLd({
  headline,
  description,
  image,
  datePublished,
  dateModified,
  author,
  url,
}: {
  headline: string
  description: string
  image?: string
  datePublished?: string
  dateModified?: string
  author?: string
  url: string
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://daily-nexo.netlify.app'
  const imageUrl = image 
    ? (image.startsWith('http') ? image : `${baseUrl}${image}`)
    : `${baseUrl}/assets/images/og-image.png`

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline,
        description,
        image: imageUrl,
        datePublished: datePublished || new Date().toISOString(),
        dateModified: dateModified || datePublished || new Date().toISOString(),
        author: {
          '@type': 'Organization',
          name: author || 'NEXO Korea',
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
          '@id': url,
        },
      }}
    />
  )
}

/**
 * Forum 스키마 (커뮤니티 - 검색 엔진 커뮤니티 콘텐츠 노출 최적화)
 */
export function ForumJsonLd({
  name,
  description,
  url,
}: {
  name: string
  description: string
  url: string
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://daily-nexo.netlify.app'
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': url,
        name,
        description,
        url,
        isPartOf: {
          '@type': 'WebSite',
          name: 'NEXO Daily',
          url: baseUrl,
        },
        about: {
          '@type': 'Thing',
          name: '학원장 강사 커뮤니티',
          description: '전자칠판 자료 공유, 지역 네트워크, 구인구직, 자유소통',
        },
      }}
    />
  )
}

/**
 * WebSite 스키마 (사이트 정보)
 */
export function WebSiteJsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://daily-nexo.netlify.app'
  
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'NEXO Daily',
        url: baseUrl,
        description: '넥소 전자칠판 사용자들을 위한 교육 정보 큐레이션 및 커뮤니티 플랫폼',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${baseUrl}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      }}
    />
  )
}

