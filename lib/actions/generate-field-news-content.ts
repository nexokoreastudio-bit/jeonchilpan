'use server'

import { StructuredFieldData } from '@/lib/utils/field-news-content'

/**
 * AI를 사용하여 현장소식 블로그 글 생성
 */
export async function generateFieldNewsBlogContent(
  rawText: string,
  fields: StructuredFieldData,
  images: string[] = []
): Promise<{ success: boolean; content?: string; error?: string }> {
  const geminiApiKey = process.env.GEMINI_API_KEY

  if (!geminiApiKey) {
    return {
      success: false,
      error: 'GEMINI_API_KEY가 설정되지 않았습니다.',
    }
  }

  try {
    // Gemini API에 전달할 프롬프트 작성
    const prompt = `당신은 넥소(NEXO) 전자칠판 전문 설치 블로그 작가입니다. 학원 원장 선생님들이 읽었을 때 "아! 이래서 넥소 전자칠판을 구매하는구나!" 하고 자연스럽게 공감할 수 있는 친화적이고 실용적인 블로그 글을 작성해주세요.

**넥소(NEXO) 전자칠판 전문 지식:**

넥소는 K-AI 시대를 선도하는 혁신적인 All-in-One 전자칠판 솔루션입니다.

**핵심 특징:**
1. **All-in-One 솔루션**: 별도의 PC, 마이크, 카메라 연결 없이 넥소 하나로 모든 환경 완성
   - 고성능 옥타코어 컴퓨터 내장
   - 4K UHD 초고화질 패널 (3840 x 2160P, 450nits)
   - 4,800만 화소 AI 카메라 (120도 시야각 FOV)
   - 8개 어레이 고성능 마이크 및 스피커

2. **아날로그의 필기감, 디지털의 강력함**
   - 제로갭 본딩(Zero-Gap Bonding): 패널과 유리 사이 간격 제거로 실제 종이에 쓰는 듯한 정밀한 터치감 (응답속도 2ms 미만)
   - 무반사(Anti-glare) 처리와 경도 9H 고강도 강화유리로 시력 보호 및 스크래치 방지
   - 50포인트 멀티 터치로 여러 명이 동시에 판서 가능

3. **강력한 무선 미러링**
   - 최대 9개 기기 동시 연결 (노트북, 태블릿, 스마트폰 등)
   - 양방향 제어로 미러링된 화면을 전자칠판에서 직접 제어 가능
   - Windows, Mac, Android, iOS 등 모든 OS 지원, QR 코드 스캔 한 번으로 연결

4. **AI 및 소프트웨어**
   - OpenAI ChatGPT 탑재로 실시간 피드백과 개인 맞춤형 학습 지원
   - UMIND 판서 소프트웨어: 수학(함수/그래프), 과학(실험 도구) 등 교육 특화 도구 제공
   - 무한 판서 캔버스 기본 제공

5. **시장 리더십**
   - 다양한 교육 현장에서 선택되는 검증된 솔루션
   - 여성기업 및 중소벤처기업부 인증 중소기업
   - 관공서, 기업, 대학교에 압도적인 설치 실적 보유

**입력된 초안 텍스트:**
${rawText}

**파싱된 정보:**
${fields.storeName ? `- 상점명: ${fields.storeName}` : ''}
${fields.location ? `- 지역: ${fields.location}` : ''}
${fields.model ? `- 모델: ${fields.model}` : ''}
${fields.additionalCables ? `- 추가 케이블: ${fields.additionalCables}` : ''}
${fields.stand ? `- 스탠드: ${fields.stand}` : ''}
${fields.wallMount ? `- 벽걸이: ${fields.wallMount}` : ''}
${fields.payment ? `- 결제: ${fields.payment}` : ''}
${fields.notes ? `- 특이사항: ${fields.notes}` : ''}
${fields.installationDate ? `- 설치일: ${fields.installationDate}` : ''}

**작성 요구사항 (매우 중요):**

1. **학원 원장 관점에서 작성하세요:**
   - 비즈니스 성향이 아닌, 실제 학원 운영에서 겪는 고민과 해결책을 중심으로 작성
   - "이 기능 덕분에 수업이 이렇게 편해졌어요", "학생들이 이렇게 좋아해요" 같은 실용적이고 구체적인 장점을 강조
   - 학원 원장 선생님이 읽고 "우리 학원에도 꼭 필요하겠다"고 느낄 수 있도록 작성
   - 예: "복잡한 케이블 연결 없이 바로 사용할 수 있어서 설치 시간이 단축되었어요" → "학원 운영자 입장에서 설치 시간이 줄어들면 수업 준비가 훨씬 수월해지죠!"

2. **문장 길이와 단락 구분:**
   - 한 문장이 너무 길어지지 않도록 주의하세요 (한 문장 25자~45자 권장)
   - 내용이 전환되거나 주제가 바뀔 때는 반드시 단락을 구분하세요
   - 전체 분량은 짧고 핵심적으로 작성하세요: **4~6개 문단, 총 700~1,100자**
   - 단락 구분 방법:
     * 일반적인 전환: <p> 태그 사이에 빈 줄 하나 추가 (한 번 엔터)
     * 큰 주제 전환: <p> 태그 사이에 빈 줄 두 개 추가 (두 번 엔터) 또는 새로운 <p> 태그로 시작
   - 예: "설치가 완료되었습니다. [빈 줄] 이제 실제 수업에서 어떻게 활용되는지 살펴보겠습니다."

3. **가독성을 위한 HTML 포맷팅 활용:**
   - **중요한 포인트나 핵심 내용**은 반드시 강조 스타일을 적용하세요:
     * 굵게: <strong style="font-weight: bold;">텍스트</strong> 또는 <b>텍스트</b>
     * 색상 강조: <span style="color: #2563eb;">텍스트</span> (파란색) 또는 <span style="color: #dc2626;">텍스트</span> (빨간색)
     * 기울임: <em style="font-style: italic;">텍스트</em> 또는 <i>텍스트</i>
     * 밑줄: <span style="text-decoration: underline;">텍스트</span> 또는 <u>텍스트</u>
     * 조합: <strong style="color: #2563eb; font-weight: bold;">굵고 파란색</strong>
   - 제품 특징, 수치, 장점 등을 언급할 때는 반드시 강조하세요
   - 예: "넥소 전자칠판의 <strong style="color: #2563eb;">제로갭 본딩 기술</strong> 덕분에 실제 종이에 쓰는 것처럼 자연스러운 필기감을 느낄 수 있어요!"

4. **표 사용 (필요시):**
   - 비교 정보나 상세 스펙을 설명할 때는 표를 사용해도 좋습니다
   - 표 형식: <table style="margin: 0 auto; border-collapse: collapse;"><tr><th style="border: 1px solid #ddd; padding: 8px;">항목</th><th style="border: 1px solid #ddd; padding: 8px;">내용</th></tr><tr><td style="border: 1px solid #ddd; padding: 8px;">모델</td><td style="border: 1px solid #ddd; padding: 8px;">NXH65</td></tr></table>

5. **넥소 전문 지식 활용:**
   - 모델명이 언급되면 해당 모델의 특징(크기, 해상도 등)을 자연스럽게 설명하되, 학원 운영에 도움이 되는 관점에서 작성
   - 설치 환경에 따라 제로갭 본딩의 필기감, 무선 미러링의 편리함 등을 구체적으로 언급하되, "이래서 좋은지"를 명확히 설명
   - 교육 현장이라면 UMIND 판서 소프트웨어의 교육 특화 기능을 자연스럽게 소개하되, 실제 수업에서 어떻게 활용되는지 구체적으로 설명
   - AI 카메라나 고성능 마이크 등이 현장에서 어떻게 활용되는지 구체적으로 설명하되, 학원 운영에 어떤 도움이 되는지 강조

6. **문체와 톤 (매우 중요 - 절대 "~입니다", "~합니다" 사용 금지):**
   - 비즈니스 성향이 아닌, 친구가 조언해주는 것처럼 친화적이고 실용적인 톤
   - 밝은 톤은 유지하되 과장/과도한 홍보 문구는 지양하세요
   - **절대로 "~입니다", "~합니다", "~됩니다", "~됩니다", "~있습니다", "~됩니다" 같은 딱딱한 문체를 사용하지 마세요**
   - 반드시 다음 같은 부드러운 문체를 사용하세요:
     * "~해요", "~거예요", "~네요", "~어요", "~아요"
     * "~할까요?", "~해볼까요?", "~보시면 좋을 것 같아요"
     * "~이에요", "~예요", "~이에요"
     * "~되요", "~돼요", "~있어요"
   - 예시:
     * ❌ "설치가 완료되었습니다" → ✅ "설치가 완료되었어요!"
     * ❌ "이 기능은 매우 유용합니다" → ✅ "이 기능은 정말 유용해요"
     * ❌ "학생들이 좋아합니다" → ✅ "학생들이 정말 좋아해요"
     * ❌ "확인해보시기 바랍니다" → ✅ "확인해보시면 좋을 것 같아요"
   - 실제 현장에 다녀온 것처럼 생생하고 자연스러운 문체
   - 고객이 느낄 수 있는 만족감과 편의성을 자연스럽게 표현

7. **이모티콘 활용 (네이버 블로그/카페 스타일):**
   - 적절한 위치에 이모티콘을 사용하여 글을 더 친근하고 재미있게 만들어주세요
   - 사용 가능한 이모티콘 예시:
     * 감탄/기쁨: 😊, 😄, 😍, 🎉, ✨, 💫, 🎊
     * 좋아요/만족: 👍, 👏, 🙌, ❤️, 💕, 💖
     * 교육/학습: 📚, ✏️, 📝, 🎓, 📖, 🖊️
     * 기술/디지털: 💻, 📱, 🖥️, ⚡, 🔥, 💡
     * 설치/작업: 🔧, ⚙️, 🛠️, ✅, ✔️
     * 화살표/포인트: 👉, 👈, ⬇️, ⬆️, ➡️, ⭐, ⭐️
     * 기타: 🎨, 🏫, 👨‍🏫, 👩‍🏫, 🎯, 💪
   - 이모티콘 사용 가이드:
     * 문장 시작이나 끝에 자연스럽게 배치
     * 중요한 포인트나 강조할 부분에 사용
     * 너무 많이 사용하지 말고 적절히 사용 (전체 글 기준 2~4개)
     * 예: "설치가 완료되었어요! 🎉" 또는 "이 기능은 정말 유용해요 ✨"

8. **표현 제한 (매우 중요):**
   - 특정 대형 업체명(예: 메가스터디, EBS, 종로학원, 대성학원)과 같은 실명 언급 금지
   - "전국 1위", "업계 1위", "압도적 1위" 등 순위/최상급 단정 표현 금지
   - 확인되지 않은 수치/사실을 단정하지 말고, 현장 정보 중심으로 작성

9. **HTML 형식:**
   - 모든 텍스트는 가운데 정렬(center)로 작성하세요
   - 각 문단은 <p style="text-align: center;"> 태그로 감싸서 가운데 정렬하세요
   - 이미지가 ${images.length}개 제공됩니다. 반드시 모든 이미지를 [이미지1], [이미지2], [이미지3]... 형식으로 적절한 위치에 배치해주세요

10. **플레이스홀더 금지:**
   - 절대로 "[블로그 이름]"이나 "[블로그명]" 같은 플레이스홀더를 사용하지 마세요
   - 인사말은 "안녕하세요! 😊" 또는 "여러분 안녕하세요! ✨" 같은 친근한 톤으로 시작하세요

11. **문의 문구 고정 삽입 (필수):**
   - 아래 문의 문구를 글의 **중간 1회**, **마지막 1회** 총 2회 반드시 넣으세요
   - 정확히 동일한 텍스트로 작성하세요:
     문의  
     넥소 송미경 부장  
     010-7152-9403

**작성 형식:**
- 헤더: 상점명과 지역 정보를 자연스럽게 소개하며, 넥소 전자칠판 설치가 학원에 어떤 의미인지 간단히 언급 (이미지 1-2개 삽입)
- 본문: 설치 과정과 현장 상황을 생생하게 서술하며, 넥소 제품의 특징이 학원 운영에서 어떻게 도움이 되는지 구체적으로 설명 (이미지 2-3개 삽입)
- 설치 정보: 모델, 케이블, 스탠드, 벽걸이 등을 자연스럽게 언급하며, 각 구성품이 학원 운영에 어떤 이점을 제공하는지 설명 (이미지 1-2개 삽입)
- 특이사항: 특이사항이 있으면 자연스럽게 서술하며, 넥소 제품이 해당 환경에서 어떤 이점을 제공하는지 설명 (이미지 1개 삽입)
- 마무리: 설치 완료와 고객 만족을 자연스럽게 마무리하며, 넥소 전자칠판이 학원에 어떤 가치를 제공할지 기대감을 표현 (남은 이미지 모두 삽입)

**최종 체크리스트 (반드시 확인):**
- 총 ${images.length}개의 이미지가 있으므로, 반드시 [이미지1]부터 [이미지${images.length}]까지 모두 사용하세요
- 문장이 너무 길지 않은지 확인하세요 (한 문장에 3-4줄 이상 넘어가면 안 됩니다)
- 전체 분량이 4~6문단, 700~1,100자 내외인지 확인하세요
- 내용 전환 시 단락을 적절히 구분했는지 확인하세요
- 중요한 포인트에 강조 스타일(굵게, 색상, 기울임, 밑줄)을 적용했는지 확인하세요
- **"~입니다", "~합니다", "~됩니다", "~있습니다" 같은 딱딱한 말투를 절대 사용하지 않았는지 확인하세요. 반드시 "~해요", "~거예요", "~할까요?" 같은 편한 말투를 사용했는지 확인하세요**
- **적절한 위치에 이모티콘을 사용하여 글을 더 친근하게 만들었는지 확인하세요 (예: 😊, ✨, 🎉, 👍 등)**
- 학원 원장 관점에서 "이래서 구매하는구나!" 하고 느낄 수 있는 내용인지 확인하세요
- 비즈니스 성향이 아닌 친화적이고 실용적인 톤인지 확인하세요
- 특정 대형 업체명과 "1위" 같은 단정 문구를 사용하지 않았는지 확인하세요
- "[블로그 이름]", "[블로그명]", "[회사명]" 같은 플레이스홀더를 절대 사용하지 마세요
- 문의 문구(넥소 송미경 부장 / 010-7152-9403)가 글 중간과 마지막에 각각 1회씩 들어갔는지 확인하세요
- 구체적인 수치나 특징을 언급할 때는 정확하게 작성하세요 (예: "4K UHD 화질", "9개 기기 동시 연결", "2ms 응답속도" 등)

HTML 형식으로 작성해주세요.`

    // 재시도 로직 (최대 3회 시도)
    let lastError: any = null
    let response: Response | null = null
    
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
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
            signal: AbortSignal.timeout(60000), // 60초 타임아웃
          }
        )

        if (response.ok) {
          break // 성공하면 루프 종료
        }

        // 429 오류인 경우 재시도 대기 시간 확인
        if (response.status === 429) {
          const errorText = await response.text()
          let retryDelay = 5000 // 기본 5초
          
          try {
            const errorData = JSON.parse(errorText)
            if (errorData.error?.details) {
              const retryInfo = errorData.error.details.find((d: any) => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo')
              if (retryInfo?.retryDelay) {
                retryDelay = Math.min(parseInt(retryInfo.retryDelay) * 1000 || 5000, 30000) // 최대 30초
              }
            }
          } catch {
            // JSON 파싱 실패 시 기본값 사용
          }
          
          if (attempt < 2) {
            console.log(`⏳ Rate limit 도달, ${retryDelay / 1000}초 후 재시도... (시도 ${attempt + 1}/3)`)
            await new Promise(resolve => setTimeout(resolve, retryDelay))
            continue
          }
        }

        // 429가 아니거나 재시도 횟수 초과
        const errorText = await response.text()
        console.error('Gemini API 오류:', response.status, errorText)
        lastError = {
          status: response.status,
          message: errorText
        }
        break
      } catch (error: any) {
        // 네트워크 오류나 타임아웃
        if (error.name === 'TimeoutError' || error.name === 'AbortError') {
          if (attempt < 2) {
            console.log(`⏳ 타임아웃 발생, 재시도... (시도 ${attempt + 1}/3)`)
            await new Promise(resolve => setTimeout(resolve, 2000))
            continue
          }
        }
        lastError = error
        break
      }
    }

    if (!response || !response.ok) {
      return {
        success: false,
        error: lastError?.status === 429 
          ? 'API 사용량이 일시적으로 초과되었습니다. 잠시 후 다시 시도해주세요.'
          : `AI 글 생성 실패: ${lastError?.status || '네트워크 오류'}`,
      }
    }

    const data = await response.json()

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      return {
        success: false,
        error: 'AI 응답 형식이 올바르지 않습니다.',
      }
    }

    let generatedContent = data.candidates[0].content.parts[0].text.trim()

    // 사용된 이미지 인덱스 추적
    const usedImageIndices = new Set<number>()
    
    // [이미지1], [이미지2] 형식으로 명시적으로 지정된 이미지 처리
    generatedContent = generatedContent.replace(/\[이미지(\d+)\]/gi, (match: string, num: string) => {
      const idx = parseInt(num, 10) - 1
      if (idx >= 0 && idx < images.length && !usedImageIndices.has(idx)) {
        usedImageIndices.add(idx)
        return `<div class="field-news-image-wrapper my-6" style="text-align: center;"><img src="${images[idx]}" alt="현장 사진 ${idx + 1}" class="field-news-image w-full rounded-lg shadow-md" style="max-width: 100%; height: auto; display: block; margin: 0 auto;" /></div>`
      }
      return ''
    })

    // [이미지] 형식도 처리 (순서대로, 사용되지 않은 이미지부터)
    let autoImageIndex = 0
    generatedContent = generatedContent.replace(/\[이미지\]/gi, () => {
      // 사용되지 않은 이미지 찾기
      while (autoImageIndex < images.length && usedImageIndices.has(autoImageIndex)) {
        autoImageIndex++
      }
      
      if (autoImageIndex < images.length) {
        usedImageIndices.add(autoImageIndex)
        const imgTag = `<div class="field-news-image-wrapper my-6" style="text-align: center;"><img src="${images[autoImageIndex]}" alt="현장 사진 ${autoImageIndex + 1}" class="field-news-image w-full rounded-lg shadow-md" style="max-width: 100%; height: auto; display: block; margin: 0 auto;" /></div>`
        autoImageIndex++
        return imgTag
      }
      return ''
    })

    // 사용되지 않은 이미지가 있으면 문단 사이에 자연스럽게 배치
    const unusedImages: number[] = []
    for (let i = 0; i < images.length; i++) {
      if (!usedImageIndices.has(i)) {
        unusedImages.push(i)
      }
    }

    if (unusedImages.length > 0) {
      // 문단을 찾아서 이미지를 삽입
      const paragraphs = generatedContent.split(/<\/p>/i)
      const imagesPerParagraph = Math.ceil(unusedImages.length / Math.max(paragraphs.length - 1, 1))
      
      let unusedIndex = 0
      const newParagraphs = paragraphs.map((para: string, idx: number) => {
        if (idx === paragraphs.length - 1) return para // 마지막은 그대로
        
        let result = para
        // 각 문단 뒤에 이미지 삽입
        for (let i = 0; i < imagesPerParagraph && unusedIndex < unusedImages.length; i++) {
          const imgIdx = unusedImages[unusedIndex]
          result += `<div class="field-news-image-wrapper my-6" style="text-align: center;"><img src="${images[imgIdx]}" alt="현장 사진 ${imgIdx + 1}" class="field-news-image w-full rounded-lg shadow-md" style="max-width: 100%; height: auto; display: block; margin: 0 auto;" /></div>`
          unusedIndex++
        }
        return result + '</p>'
      })
      
      generatedContent = newParagraphs.join('')
      
      // 아직 남은 이미지가 있으면 마지막에 추가
      if (unusedIndex < unusedImages.length) {
        const remainingImages = unusedImages.slice(unusedIndex).map((imgIdx) => 
          `<div class="field-news-image-wrapper my-6" style="text-align: center;"><img src="${images[imgIdx]}" alt="현장 사진 ${imgIdx + 1}" class="field-news-image w-full rounded-lg shadow-md" style="max-width: 100%; height: auto; display: block; margin: 0 auto;" /></div>`
        ).join('\n')
        generatedContent += '\n' + remainingImages
      }
    }

    // 모든 텍스트를 가운데 정렬로 변경
    generatedContent = generatedContent.replace(/<p([^>]*)>/gi, (match: string, attrs: string) => {
      if (!attrs.includes('text-align')) {
        return `<p${attrs} style="text-align: center;">`
      }
      return match
    })

    // 플레이스홀더 제거: [블로그 이름], [블로그명] 등을 제거
    generatedContent = generatedContent.replace(/\[블로그\s*(이름|명|이름\)|명\))\]/gi, '')
    generatedContent = generatedContent.replace(/\[회사명\]/gi, '')
    generatedContent = generatedContent.replace(/\[.*?\]/g, (match: string) => {
      // [이미지1] 같은 이미지 플레이스홀더는 이미 처리되었으므로 남은 것만 제거
      if (!match.includes('이미지')) {
        return ''
      }
      return match
    })

    // 금지 표현 정리: 특정 대형 업체명, 순위 단정 문구 제거
    generatedContent = generatedContent
      .replace(/메가스터디|EBS|종로학원|대성학원/gi, '교육기관')
      .replace(/전국\s*학원\s*납품\s*1위/gi, '다양한 교육 현장 적용 사례')
      .replace(/업계\s*1위|압도적\s*1위|전국\s*1위/gi, '검증된 운영 사례')

    // 문의 문구가 중간/끝에 반드시 들어가도록 보정
    const contactBlock = `<p style="text-align: center;"><strong style="color: #0f766e;">문의</strong><br/>넥소 송미경 부장<br/>010-7152-9403</p>`
    const contactMentions = (generatedContent.match(/010-7152-9403/g) || []).length
    if (contactMentions < 2) {
      const paragraphs = generatedContent.split(/<\/p>/i)
      const midpoint = Math.max(1, Math.floor((paragraphs.length - 1) / 2))
      if (paragraphs.length > 1) {
        paragraphs.splice(midpoint, 0, contactBlock)
        paragraphs.push(contactBlock)
        generatedContent = paragraphs.join('</p>')
      } else {
        generatedContent = `${generatedContent}\n${contactBlock}\n${contactBlock}`
      }
    }

    // 딱딱한 말투를 편한 말투로 자동 변환 (HTML 태그 내부는 제외하고 텍스트만 변환)
    // "~입니다" → "~이에요" 또는 "~예요"
    generatedContent = generatedContent.replace(/([가-힣])습니다/g, (match: string, char: string) => {
      // 받침이 있으면 "~이에요", 없으면 "~예요"
      const hasFinalConsonant = (char.charCodeAt(0) - 0xAC00) % 28 !== 0
      return hasFinalConsonant ? `${char}이에요` : `${char}예요`
    })
    
    // "~합니다" → "~해요"
    generatedContent = generatedContent.replace(/([가-힣])합니다/g, '$1해요')
    
    // "~됩니다" → "~돼요"
    generatedContent = generatedContent.replace(/([가-힣])됩니다/g, '$1돼요')
    
    // "~있습니다" → "~있어요"
    generatedContent = generatedContent.replace(/([가-힣])있습니다/g, '$1있어요')
    
    // "~없습니다" → "~없어요"
    generatedContent = generatedContent.replace(/([가-힣])없습니다/g, '$1없어요')
    
    // "~됩니다" → "~돼요" (다시 한 번, 다른 패턴)
    generatedContent = generatedContent.replace(/됩니다/g, '돼요')
    
    // "~하시기 바랍니다" → "~하시면 좋을 것 같아요"
    generatedContent = generatedContent.replace(/하시기 바랍니다/g, '하시면 좋을 것 같아요')
    generatedContent = generatedContent.replace(/하시기 바랍니다/g, '하시면 좋을 것 같아요')
    
    // "~해주시기 바랍니다" → "~해주시면 좋을 것 같아요"
    generatedContent = generatedContent.replace(/해주시기 바랍니다/g, '해주시면 좋을 것 같아요')
    
    // "~확인하시기 바랍니다" → "~확인하시면 좋을 것 같아요"
    generatedContent = generatedContent.replace(/확인하시기 바랍니다/g, '확인하시면 좋을 것 같아요')
    
    // "~입니다" → "~이에요" 또는 "~예요" (더 일반적인 패턴)
    generatedContent = generatedContent.replace(/([가-힣])입니다/g, (match: string, char: string) => {
      const hasFinalConsonant = (char.charCodeAt(0) - 0xAC00) % 28 !== 0
      return hasFinalConsonant ? `${char}이에요` : `${char}예요`
    })

    return {
      success: true,
      content: generatedContent,
    }
  } catch (error: any) {
    console.error('AI 글 생성 오류:', error)
    return {
      success: false,
      error: error.message || 'AI 글 생성 중 오류가 발생했습니다.',
    }
  }
}
