import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isValidUrl } from '@/lib/utils/security'
import { sanitizeHtml } from '@/lib/utils/sanitize'
import { Database } from '@/types/database'
// v1 API 직접 호출로 변경 (SDK는 v1beta 사용으로 인한 모델 호환성 문제)

/**
 * HTML 엔티티 디코딩
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&#x([a-f\d]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
}

/**
 * HTML에서 텍스트 추출 (스크립트, 스타일 제거)
 */
function extractTextFromHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * 뉴스 기사 URL을 분석하여 넥소 에디터의 관점으로 분석하는 API
 * 관리자 권한 필요
 */
export async function POST(request: NextRequest) {
  try {
    // 관리자 권한 확인
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      )
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const profileData = profile as Pick<Database['public']['Tables']['users']['Row'], 'role'> | null
    if (profileData?.role !== 'admin') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const { url } = await request.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL이 필요합니다.' },
        { status: 400 }
      )
    }

    // URL 검증 (XSS 방지)
    if (!isValidUrl(url)) {
      return NextResponse.json(
        { error: '유효하지 않은 URL입니다.' },
        { status: 400 }
      )
    }

    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'Gemini API 키가 설정되지 않았습니다.' },
        { status: 500 }
      )
    }

    // 1. 기사 본문 스크래핑
    let articleText = ''
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'Referer': 'https://www.google.com/',
        },
        signal: AbortSignal.timeout(20000),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // 인코딩 처리 개선
      let html = ''
      const contentType = response.headers.get('content-type') || ''
      const charsetMatch = contentType.match(/charset=([^;]+)/i)
      const charset = charsetMatch ? charsetMatch[1].toLowerCase() : 'utf-8'
      
      if (charset.includes('euc-kr') || charset.includes('cp949')) {
        // EUC-KR 인코딩 처리
        const buffer = await response.arrayBuffer()
        const decoder = new TextDecoder('euc-kr')
        html = decoder.decode(buffer)
      } else {
        html = await response.text()
      }
      
      // HTML sanitization (XSS 방지)
      const sanitizedHtml = sanitizeHtml(html)
      
      // 간단한 HTML 파싱으로 본문 추출
      // 1. meta description 또는 og:description에서 추출 시도
      const metaDescMatch = sanitizedHtml.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)
      if (metaDescMatch) {
        articleText = decodeHtmlEntities(metaDescMatch[1])
      }

      const ogDescMatch = sanitizedHtml.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i)
      if (ogDescMatch) {
        const ogDesc = decodeHtmlEntities(ogDescMatch[1])
        if (ogDesc.length > articleText.length) {
          articleText = ogDesc
        }
      }

      // 2. article 태그에서 텍스트 추출 (범위 확대)
      const articleMatch = sanitizedHtml.match(/<article[^>]*>([\s\S]{0,50000})<\/article>/i)
      if (articleMatch) {
        const articleContent = extractTextFromHtml(articleMatch[1])
        if (articleContent.length > articleText.length) {
          articleText = articleContent.substring(0, 3000) // 최대 3000자
        }
      }

      // 3. div.content, div.article-content 등 일반적인 본문 클래스에서 추출 (패턴 확대)
      const contentPatterns = [
        /<div[^>]*class=["'][^"']*(?:content|article|body|text|본문|view|story|news|post)[^"']*["'][^>]*>([\s\S]{0,50000})<\/div>/gi,
        /<div[^>]*id=["'][^"']*(?:content|article|body|text|본문|view|story|news|post)[^"']*["'][^>]*>([\s\S]{0,50000})<\/div>/gi,
        /<section[^>]*class=["'][^"']*(?:content|article|body|text|본문|view|story|news|post)[^"']*["'][^>]*>([\s\S]{0,50000})<\/section>/gi,
        /<main[^>]*>([\s\S]{0,50000})<\/main>/gi,
      ]
      
      for (const pattern of contentPatterns) {
        const matches = sanitizedHtml.matchAll(pattern)
        for (const match of matches) {
          if (match[1]) {
            const contentText = extractTextFromHtml(match[1])
            // 최소 100자 이상인 텍스트만 고려 (노이즈 제거)
            if (contentText.length > 100 && contentText.length > articleText.length) {
              articleText = contentText.substring(0, 3000)
            }
          }
        }
      }

      // 4. p 태그들을 모아서 본문 추출 (뉴스 사이트에서 흔한 패턴)
      if (!articleText || articleText.length < 100) {
        const pMatches = sanitizedHtml.matchAll(/<p[^>]*>([\s\S]{0,2000})<\/p>/gi)
        const pTexts: string[] = []
        for (const match of pMatches) {
          if (match[1]) {
            const pText = extractTextFromHtml(match[1])
            // 최소 20자 이상인 문단만 고려
            if (pText.length > 20 && !pText.match(/^(댓글|좋아요|응원수|공유|로그인|회원가입|이메일|전화번호)/i)) {
              pTexts.push(pText)
            }
          }
        }
        if (pTexts.length > 0) {
          const combinedPText = pTexts.join(' ').substring(0, 3000)
          if (combinedPText.length > articleText.length) {
            articleText = combinedPText
          }
        }
      }

      // 5. 본문이 없으면 body에서 추출 시도 (더 많은 텍스트 추출, 범위 확대)
      if (!articleText || articleText.length < 100) {
        const bodyMatch = sanitizedHtml.match(/<body[^>]*>([\s\S]{0,100000})<\/body>/i)
        if (bodyMatch) {
          const bodyText = extractTextFromHtml(bodyMatch[1])
          // body에서 추출한 텍스트가 너무 길면 본문 부분만 추출 시도
          if (bodyText.length > 100) {
            // 본문으로 보이는 긴 연속 텍스트 블록 찾기
            const sentences = bodyText.split(/[.!?]\s+/).filter(s => s.length > 30)
            if (sentences.length > 3) {
              const mainContent = sentences.slice(0, 20).join('. ').substring(0, 3000)
              if (mainContent.length > articleText.length) {
                articleText = mainContent
              }
            } else if (bodyText.length > articleText.length) {
              articleText = bodyText.substring(0, 3000)
            }
          }
        }
      }

      // 6. 최소 길이 요구사항 완화 (한국어 사이트의 경우)
      if (!articleText || articleText.length < 30) {
        throw new Error('기사 본문을 추출할 수 없습니다.')
      }
    } catch (error) {
      // 개발 환경에서는 상세 에러 로깅
      if (process.env.NODE_ENV === 'development') {
        console.error('기사 스크래핑 실패:', error)
        console.error('URL:', url)
        console.error('추출된 텍스트 길이:', articleText.length)
        if (articleText) {
          console.error('추출된 텍스트 샘플:', articleText.substring(0, 200))
        }
      }
      
      // 에러 메시지 개선
      const errorMessage = error instanceof Error 
        ? error.message 
        : '알 수 없는 오류'
      
      return NextResponse.json(
        { 
          error: '기사 본문을 가져올 수 없습니다. URL을 확인해주세요.',
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        },
        { status: 400 }
      )
    }

    // 2. Gemini API로 분석 (v1 API 직접 호출 - v1beta 문제 해결)
    try {
      const prompt = `당신은 "넥소 에디터"입니다. 넥소(NEXO)는 전자칠판을 제조·생산·판매하는 회사이며, 교육 현장의 전문가로서 다음 뉴스 기사를 분석해주세요.

**중요:** 넥소는 학원이 아닙니다. 넥소는 전자칠판을 제조·생산·판매하는 회사입니다.

기사 URL: ${url}
기사 본문:
${articleText.substring(0, 3000)}

**분석 요구사항:**
1. 기사를 단순 요약하지 말고, 교육 현장과 입시 상담에 어떤 기회/위기인지 해석해주세요.
2. 전문적이고 날카롭지만, 교육 전문가들에게 실질적인 인사이트를 제공하는 신뢰감 있는 말투로 작성하세요.
3. 이 뉴스가 교육 현장과 입시 상담에 어떤 의미인지 구체적으로 설명해주세요.

다음 JSON 형식으로 응답해주세요:
{
  "summary": "3줄 핵심 요약",
  "insight": "넥소 에디터의 관점 (교육 전문가가 주목해야 할 포인트, 200-300자)",
  "consulting_tips": [
    "학부모 상담 멘트 1 (구체적이고 실용적인 멘트)",
    "학부모 상담 멘트 2",
    "학부모 상담 멘트 3"
  ]
}

JSON 형식만 응답하고, 다른 설명은 포함하지 마세요.`

      // 사용 가능한 모델 목록 확인
      let availableModels: string[] = []
      try {
        const modelsResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${geminiApiKey}`
        )
        if (modelsResponse.ok) {
          const modelsData = await modelsResponse.json()
          availableModels = modelsData.models?.map((m: any) => m.name?.replace('models/', '') || '') || []
          if (process.env.NODE_ENV === 'development') {
            console.log('사용 가능한 모델 목록:', availableModels)
          }
        }
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('모델 목록 조회 실패:', err)
        }
      }

      // 사용 가능한 모델 순차적으로 시도
      const modelsToTry = [
        'gemini-1.5-flash',
        'gemini-1.5-pro', 
        'gemini-pro',
        ...availableModels.filter(m => m.includes('gemini'))
      ]
      
      let apiResponse: Response | null = null
      let lastError: Error | null = null
      
      for (const modelName of modelsToTry) {
        try {
          // v1beta API 시도
          apiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [{
                  parts: [{
                    text: prompt
                  }]
                }]
              }),
            }
          )
          
          if (apiResponse.ok) {
            if (process.env.NODE_ENV === 'development') {
              console.log(`✅ 모델 ${modelName} 사용 성공`)
            }
            break
          } else {
            const errorText = await apiResponse.text()
            if (process.env.NODE_ENV === 'development') {
              console.log(`❌ 모델 ${modelName} 실패: ${apiResponse.status} - ${errorText.substring(0, 100)}`)
            }
            lastError = new Error(`모델 ${modelName} 실패: ${apiResponse.status}`)
            apiResponse = null
          }
        } catch (err: any) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`❌ 모델 ${modelName} 예외:`, err.message)
          }
          lastError = err
          apiResponse = null
        }
      }
      
      if (!apiResponse || !apiResponse.ok) {
        const errorText = apiResponse ? await apiResponse.text() : '응답 없음'
        if (process.env.NODE_ENV === 'development') {
          console.error('Gemini API 에러 응답:', {
            status: apiResponse?.status || 'N/A',
            statusText: apiResponse?.statusText || 'N/A',
            body: errorText.substring(0, 500)
          })
        }
        throw new Error(`사용 가능한 모델을 찾을 수 없습니다. 시도한 모델: ${modelsToTry.join(', ')}. 마지막 에러: ${lastError?.message || errorText.substring(0, 200)}`)
      }

      const apiData = await apiResponse.json()
      if (process.env.NODE_ENV === 'development') {
        console.log('Gemini API 응답 구조:', JSON.stringify(apiData).substring(0, 500))
      }
      
      // v1 API 응답 구조 확인
      const text = apiData.candidates?.[0]?.content?.parts?.[0]?.text || 
                   apiData.candidates?.[0]?.output || 
                   apiData.text || ''
      
      if (!text) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Gemini API 응답 데이터:', JSON.stringify(apiData, null, 2))
        }
        throw new Error(`Gemini API 응답에서 텍스트를 찾을 수 없습니다.`)
      }

      // JSON 파싱 시도
      let analysisData
      try {
        // JSON 부분만 추출
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          analysisData = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('JSON 형식이 아닙니다.')
        }
      } catch (parseError) {
        // JSON 파싱 실패 시 기본 구조로 변환
        const lines = text.split('\n').filter((line: string) => line.trim())
        analysisData = {
          summary: lines.slice(0, 3).join(' ').substring(0, 200) || '기사 요약을 생성할 수 없습니다.',
          insight: lines.slice(3, 6).join(' ').substring(0, 400) || '분석을 생성할 수 없습니다.',
          consulting_tips: lines.slice(6, 9).filter((tip: string) => tip.length > 10).slice(0, 3) || [
            '학부모님께 이 정보를 자연스럽게 언급하며 신뢰를 구축하세요.',
            '입시 전략 수립 시 참고 자료로 활용하세요.',
            '학생의 학습 방향 설정에 도움이 되는 정보입니다.'
          ]
        }
      }

      return NextResponse.json({
        success: true,
        data: analysisData,
      })
    } catch (error: any) {
      const errorMessage = error?.message || '알 수 없는 오류'
      
      if (process.env.NODE_ENV === 'development') {
        console.error('Gemini API 호출 실패:', error)
      }
      
      // 모델명 관련 에러인지 확인
      let userFriendlyError = 'AI 분석 중 오류가 발생했습니다.'
      if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        userFriendlyError = `모델을 찾을 수 없습니다. 사용 가능한 모델: gemini-1.5-flash, gemini-1.5-pro, gemini-pro`
      } else if (errorMessage.includes('403') || errorMessage.includes('permission')) {
        userFriendlyError = `API 키 권한이 없습니다. Gemini API 키를 확인해주세요.`
      }
      
      return NextResponse.json(
        { 
          error: userFriendlyError,
          ...(process.env.NODE_ENV === 'development' && { details: errorMessage })
        },
        { status: 500 }
      )
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('API 오류:', error)
    }
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

