'use server'

import { createClient } from '@/lib/supabase/server'
import { getNexoManualForPrompt } from '@/lib/chat/nexo-manual'
import { NEXO_PRODUCT_MANUAL } from '@/lib/chat/nexo-product-manual'

function buildSystemPrompt(): string {
  const manualText = getNexoManualForPrompt()
  return `당신은 넥소(NEXO) 전자칠판 영업·상담 담당자입니다.
- 넥소는 전자칠판을 제조·생산·판매하는 교육 기기 회사입니다.
- 학원, 교습소, 학교 등 교육 현장에 전자칠판을 공급합니다.
- 넥소가 학원이 아님을 명확히 하세요.

[사이트 내부 링크 - 반드시 아래 상대 경로만 사용하세요. 절대 URL(https://) 금지]
- 상담신청: /leads/consultation (시연/견적 통합 안내)
- 자료실: /resources (입시 자료, 다운로드)
- 레벨별 혜택: /benefits (구독자 할인 혜택)
- 오시는 길: /location (쇼룸 주소, 연락처)
- 고객 후기: /reviews
- 현장 소식: /field (설치 사례)
- 커뮤니티: /community (원장님 소통)

※ 링크는 반드시 [텍스트](/leads/consultation) 형태로 작성. 예: [상담신청 하기](/leads/consultation)

[넥소 FAQ - 자주 묻는 질문]
${manualText}

[넥소칠판 NX-Series 제품 사용 매뉴얼 - 아래 내용을 참고하여 사용법·트러블슈팅을 정확히 안내하세요]
${NEXO_PRODUCT_MANUAL}

[답변 규칙]
- 시연/가격/견적 문의 → 상담신청 링크 포함
- 할인 문의 → 레벨별 혜택 링크 포함
- 상담사와 직접 상담이 필요할 때 → "연락처 남기기"를 눌러 이름·이메일을 남겨주시면 담당자가 연락드립니다
- 답변은 2~4문장으로 완결. 친근하고 명확하게. 이모지 적당히 사용.`
}

const getSystemPrompt = () => buildSystemPrompt()

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function sendChatMessage(
  messages: ChatMessage[],
  contact?: { name: string; email: string; phone?: string }
): Promise<{ reply?: string; error?: string }> {
  if (!messages?.length) return { error: '메시지를 입력해주세요.' }

  const userMessages = messages.filter((m) => m.role === 'user')
  const lastUserMsg = userMessages[userMessages.length - 1]?.content
  if (!lastUserMsg) return { error: '사용자 메시지가 없습니다.' }

  const geminiApiKey = process.env.GEMINI_API_KEY
  if (!geminiApiKey) {
    return { error: '챗봇 서비스가 설정되지 않았습니다.' }
  }

  // 연락처 입력 시 리드 저장 (대화 맥락 포함)
  if (contact?.name && contact?.email) {
    const conversationSummary = messages
      .slice(-6)
      .map((m) => `${m.role === 'user' ? '사용자' : '상담원'}: ${m.content}`)
      .join('\n')
    const leadMessage = `[챗봇 상담] AI 챗봇에서 연락처 제출\n\n최근 대화:\n${conversationSummary || '(없음)'}`

    const supabase = await createClient()
    await (supabase.from('leads') as any).insert({
      type: 'chatbot_consultation',
      name: contact.name,
      email: contact.email,
      phone: contact.phone || null,
      academy_name: null,
      region: null,
      message: leadMessage,
      referrer_code: null,
      status: 'pending',
    })
  }

  const conversationContext = messages
    .slice(-8)
    .map((m) => (m.role === 'user' ? `사용자: ${m.content}` : `상담원: ${m.content}`))
    .join('\n')

  const prompt = `${getSystemPrompt()}

=== 이전 대화 ===
${conversationContext || '(없음)'}

=== 사용자 최신 메시지 ===
${lastUserMsg}

위 맥락을 고려하여 상담원으로서 답변해주세요. 답변만 출력하세요.`

  const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro']

  for (const modelName of modelsToTry) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            },
          }),
          signal: AbortSignal.timeout(15000),
        }
      )
      if (!res.ok) {
        const errText = await res.text()
        console.warn(`[Chat] ${modelName} 실패:`, res.status, errText.substring(0, 300))
        continue
      }
      const data = await res.json()
      const candidate = data?.candidates?.[0]
      const parts = candidate?.content?.parts
      if (parts?.length) {
        const fullText = parts
          .map((p: { text?: string }) => p?.text)
          .filter(Boolean)
          .join('')
        if (fullText) return { reply: String(fullText).trim() }
      }
    } catch (e) {
      console.warn(`[Chat] ${modelName} 예외:`, e)
    }
  }
  console.error('[Chat] 모든 모델 실패 - GEMINI_API_KEY 확인 필요')
  return { error: '챗봇 응답 생성에 실패했습니다.' }
}
