/**
 * 교육 뉴스 크롤링 유틸리티
 * 각 신문사별 크롤링 함수 및 카테고리 분류 로직
 */

export interface CrawledNewsItem {
  title: string
  url: string
  source: string
  category: '입시' | '학업' | '취업' | '교육정책' | '기타'
  summary?: string
  thumbnail_url?: string
  published_at?: string
}

/**
 * 기사 제목과 내용을 기반으로 카테고리 분류
 */
export function categorizeNews(title: string, content?: string): CrawledNewsItem['category'] {
  const text = `${title} ${content || ''}`.toLowerCase()
  
  // 입시 관련 키워드
  const admissionKeywords = [
    '입시', '수능', '대입', '수시', '정시', '모집', '전형', 
    '합격', '지원', '원서', '면접', '논술', '적성', '학생부',
    'sky', '서울대', '연세대', '고려대', '의대', '약대'
  ]
  
  // 학업 관련 키워드
  const studyKeywords = [
    '학업', '학습', '공부', '교육과정', '교과', '수업', '과제',
    '시험', '성적', '학점', '학생', '교사', '선생님', '학교',
    '교육', '학원', '과외', '독서', '논문', '연구'
  ]
  
  // 취업 관련 키워드
  const employmentKeywords = [
    '취업', '채용', '인턴', '공채', '면접', '이력서', '자기소개서',
    '신입', '경력', '직장', '회사', '기업', '공기업', '공무원',
    '대기업', '중소기업', '스타트업', '연봉', '급여'
  ]
  
  // 교육정책 관련 키워드
  const policyKeywords = [
    '교육부', '정책', '개편', '제도', '법안', '법률', '규정',
    '개선', '변경', '발표', '발표', '시행', '시행령', '시행규칙',
    '예산', '지원', '보조금', '장학금', '학자금'
  ]
  
  // 키워드 매칭
  const admissionCount = admissionKeywords.filter(keyword => text.includes(keyword)).length
  const studyCount = studyKeywords.filter(keyword => text.includes(keyword)).length
  const employmentCount = employmentKeywords.filter(keyword => text.includes(keyword)).length
  const policyCount = policyKeywords.filter(keyword => text.includes(keyword)).length
  
  // 가장 많이 매칭된 카테고리 반환
  const counts = [
    { category: '입시' as const, count: admissionCount },
    { category: '학업' as const, count: studyCount },
    { category: '취업' as const, count: employmentCount },
    { category: '교육정책' as const, count: policyCount },
  ]
  
  const maxCount = Math.max(...counts.map(c => c.count))
  
  if (maxCount === 0) {
    return '기타'
  }
  
  return counts.find(c => c.count === maxCount)?.category || '기타'
}

/**
 * HTML에서 썸네일 이미지 URL 추출
 */
export function extractThumbnail(html: string, baseUrl: string): string | undefined {
  // og:image 메타 태그에서 추출
  const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i)
  if (ogImageMatch) {
    const url = ogImageMatch[1]
    return url.startsWith('http') ? url : `${baseUrl}${url}`
  }
  
  // 첫 번째 이미지 태그에서 추출
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i)
  if (imgMatch) {
    const url = imgMatch[1]
    return url.startsWith('http') ? url : `${baseUrl}${url}`
  }
  
  return undefined
}

/**
 * HTML에서 본문 요약 추출
 */
export function extractSummary(html: string): string | undefined {
  // meta description에서 추출
  const metaDescMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)
  if (metaDescMatch) {
    return decodeHtmlEntities(metaDescMatch[1])
  }
  
  // og:description에서 추출
  const ogDescMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i)
  if (ogDescMatch) {
    return decodeHtmlEntities(ogDescMatch[1])
  }
  
  return undefined
}

/**
 * HTML 엔티티 디코딩
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#x([a-f\d]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .trim()
}

/**
 * HTML 태그 제거 및 텍스트만 추출
 */
function stripHtmlTags(html: string): string {
  if (!html) return ''
  
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // 스크립트 제거
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // 스타일 제거
    .replace(/<[^>]+>/g, ' ') // 모든 HTML 태그 제거
    .replace(/\s+/g, ' ') // 연속된 공백을 하나로
    .trim()
}

/**
 * HTML에서 이미지 URL 추출 (강화된 버전)
 */
function extractImageUrl(html: string, baseUrl?: string): string | undefined {
  if (!html) return undefined
  
  // 1. img 태그에서 src 추출 (여러 형식 지원)
  const imgPatterns = [
    /<img[^>]+src\s*=\s*["']([^"']+)["']/i,
    /<img[^>]+src\s*=\s*([^\s>]+)/i,
    /src\s*=\s*["']([^"']+)["']/i,
  ]
  
  for (const pattern of imgPatterns) {
    const imgMatch = html.match(pattern)
    if (imgMatch && imgMatch[1]) {
      let imgUrl = imgMatch[1].trim()
      
      // HTML 엔티티 디코딩
      imgUrl = decodeHtmlEntities(imgUrl)
      
      // 상대 경로를 절대 경로로 변환
      if (baseUrl && !imgUrl.startsWith('http://') && !imgUrl.startsWith('https://')) {
        try {
          const baseUrlObj = new URL(baseUrl)
          imgUrl = new URL(imgUrl, baseUrlObj.origin).href
        } catch {
          // URL 변환 실패 시 원본 사용
        }
      }
      
      // 유효한 이미지 URL인지 확인
      if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
        // data: URL 제외
        if (!imgUrl.startsWith('data:')) {
          return imgUrl
        }
      }
    }
  }
  
  // 2. og:image 메타 태그에서 추출
  const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i)
  if (ogImageMatch && ogImageMatch[1]) {
    return ogImageMatch[1].trim()
  }
  
  // 3. media:thumbnail (RSS 2.0)
  const mediaThumbnailMatch = html.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i)
  if (mediaThumbnailMatch && mediaThumbnailMatch[1]) {
    return mediaThumbnailMatch[1].trim()
  }
  
  // 4. enclosure (RSS 2.0)
  const enclosureMatch = html.match(/<enclosure[^>]+url=["']([^"']+)["']/i)
  if (enclosureMatch && enclosureMatch[1]) {
    const url = enclosureMatch[1].trim()
    // 이미지 파일 확장자 확인
    if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url)) {
      return url
    }
  }
  
  return undefined
}

/**
 * URL 유효성 검사
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * RSS 피드에서 뉴스 아이템 파싱 (간단한 버전)
 */
export async function parseRssFeed(rssUrl: string, source: string): Promise<CrawledNewsItem[]> {
  try {
    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
      signal: AbortSignal.timeout(10000), // 10초 타임아웃
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const xml = await response.text()
    const items: CrawledNewsItem[] = []
    
    // 간단한 XML 파싱 (정규식 기반)
    // 여러 형식 지원: <item>, <entry> (Atom 피드)
    const itemMatches = xml.matchAll(/<(item|entry)>([\s\S]*?)<\/(item|entry)>/gi)
    
    for (const match of itemMatches) {
      const itemXml = match[2]
      
      // 제목 추출 (여러 형식 지원)
      const titleMatch = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>|<title[^>]*>(.*?)<\/title>/i)
      // 링크 추출 (여러 형식 지원)
      const linkMatch = itemXml.match(/<link[^>]*>(.*?)<\/link>|<link[^>]*href=["']([^"']+)["']|<guid[^>]*>(.*?)<\/guid>/i)
      // 발행일 추출
      const pubDateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>|<published>(.*?)<\/published>|<dc:date>(.*?)<\/dc:date>/i)
      // 설명 추출
      const descriptionMatch = itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>|<content[^>]*><!\[CDATA\[(.*?)\]\]><\/content>|<content[^>]*>(.*?)<\/content>/i)
      
      if (titleMatch && linkMatch) {
        const title = decodeHtmlEntities(
          titleMatch[1] || titleMatch[2] || titleMatch[3] || ''
        ).trim()
        
        // 링크 URL 추출 (여러 형식 지원)
        let url = ''
        if (linkMatch[1] && !linkMatch[1].includes('<')) {
          url = linkMatch[1].trim()
        } else if (linkMatch[2]) {
          url = linkMatch[2].trim()
        } else if (linkMatch[3]) {
          url = linkMatch[3].trim()
        }
        
        // URL이 상대 경로인 경우 처리
        if (url && !url.startsWith('http')) {
          try {
            const baseUrlObj = new URL(rssUrl)
            url = new URL(url, baseUrlObj.origin).href
          } catch {
            continue // URL 파싱 실패 시 건너뛰기
          }
        }
        
        if (!url || !isValidUrl(url)) {
          continue
        }
        
        // 요약 추출 및 정리
        let summary = descriptionMatch 
          ? (descriptionMatch[1] || descriptionMatch[2] || descriptionMatch[3] || descriptionMatch[4] || '')
          : undefined
        
        // HTML 태그 제거 및 텍스트만 추출
        if (summary) {
          summary = stripHtmlTags(summary)
          summary = decodeHtmlEntities(summary).trim()
          // 너무 짧거나 의미 없는 요약 제거
          if (summary.length < 10) {
            summary = undefined
          }
        }
        
        // 이미지 URL 추출 (description과 item 전체에서)
        const descriptionHtml = descriptionMatch 
          ? (descriptionMatch[1] || descriptionMatch[2] || descriptionMatch[3] || descriptionMatch[4] || '')
          : ''
        
        // description에서 이미지 추출 시도
        let thumbnailUrl = extractImageUrl(descriptionHtml, url)
        
        // description에 없으면 item 전체 XML에서 추출 시도
        if (!thumbnailUrl) {
          thumbnailUrl = extractImageUrl(itemXml, url)
        }
        
        // 여전히 없으면 media:thumbnail 태그 확인
        if (!thumbnailUrl) {
          const mediaThumbnailMatch = itemXml.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i)
          if (mediaThumbnailMatch && mediaThumbnailMatch[1]) {
            thumbnailUrl = mediaThumbnailMatch[1].trim()
          }
        }
        
        // 교육 관련 키워드 필터링 (더 관대하게)
        if (isEducationRelated(title, summary)) {
          // 디버깅: 이미지 URL 추출 로그
          if (process.env.NODE_ENV === 'development' && thumbnailUrl) {
            console.log(`[이미지 추출 성공] ${source}: ${title.substring(0, 50)}... -> ${thumbnailUrl.substring(0, 100)}`)
          } else if (process.env.NODE_ENV === 'development' && !thumbnailUrl) {
            console.log(`[이미지 없음] ${source}: ${title.substring(0, 50)}...`)
          }
          
          items.push({
            title,
            url,
            source,
            category: categorizeNews(title, summary),
            summary: summary && summary.length > 0 ? summary : undefined,
            thumbnail_url: thumbnailUrl,
            published_at: pubDateMatch 
              ? (() => {
                  try {
                    const dateStr = pubDateMatch[1] || pubDateMatch[2] || pubDateMatch[3]
                    return new Date(dateStr).toISOString()
                  } catch {
                    return undefined
                  }
                })()
              : undefined,
          })
        }
      }
    }
    
    console.log(`[RSS 파싱] ${source}: ${items.length}개의 교육 관련 기사를 찾았습니다.`)
    return items
  } catch (error: any) {
    console.error(`[RSS 파싱 실패] ${rssUrl}:`, error?.message || error)
    return []
  }
}

/**
 * 교육 관련 기사인지 확인 (더 넓은 범위로 필터링)
 */
function isEducationRelated(title: string, content?: string): boolean {
  const text = `${title} ${content || ''}`.toLowerCase()
  
  const educationKeywords = [
    // 기본 교육 키워드
    '교육', '학생', '교사', '학교', '학원', '입시', '수능', '대입',
    '학업', '학습', '공부', '취업', '채용', '면접', '교육부',
    '대학', '고등학교', '중학교', '초등학교', '유치원',
    // 추가 키워드
    '수시', '정시', '학종', '논술', '면접', '전형', '모집',
    '의대', '약대', '법대', '공대', '인문대', '자연대',
    '서울대', '연세대', '고려대', 'yonsei', 'korea', 'snu',
    '학점', '성적', '등급', '컷', '합격', '불합격',
    '장학금', '등록금', '학자금', '학비',
    '온라인', '원격', '비대면', '화상', 'zoom',
    'ai', '인공지능', '디지털', '스마트', 'edtech'
  ]
  
  // 키워드 매칭 (더 관대하게)
  const matchedKeywords = educationKeywords.filter(keyword => text.includes(keyword))
  return matchedKeywords.length >= 1 // 최소 1개 키워드만 매칭되면 교육 관련으로 판단
}

/**
 * HTML 페이지에서 뉴스 링크 추출 (신문사별 커스텀 파싱 필요)
 */
export async function crawlNewsFromHtml(
  url: string, 
  source: string,
  selector?: string
): Promise<CrawledNewsItem[]> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      signal: AbortSignal.timeout(15000), // 15초 타임아웃
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const html = await response.text()
    const items: CrawledNewsItem[] = []
    
    // 간단한 링크 추출 (실제로는 cheerio 같은 라이브러리 사용 권장)
    // 여기서는 기본적인 정규식으로 추출
    const linkMatches = html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)
    
    for (const match of linkMatches) {
      const href = match[1]
      const linkText = match[2].replace(/<[^>]*>/g, '').trim()
      
      // 상대 URL을 절대 URL로 변환
      let fullUrl = href
      if (href.startsWith('/')) {
        const baseUrlObj = new URL(url)
        fullUrl = `${baseUrlObj.origin}${href}`
      } else if (!href.startsWith('http')) {
        continue // 외부 링크나 잘못된 링크는 건너뛰기
      }
      
      // 교육 관련 링크만 필터링
      if (linkText && isEducationRelated(linkText) && isValidUrl(fullUrl)) {
        items.push({
          title: linkText.substring(0, 200), // 제목 길이 제한
          url: fullUrl,
          source,
          category: categorizeNews(linkText),
        })
      }
    }
    
    return items.slice(0, 20) // 최대 20개만 반환
  } catch (error) {
    console.error(`HTML 크롤링 실패 (${url}):`, error)
    return []
  }
}

