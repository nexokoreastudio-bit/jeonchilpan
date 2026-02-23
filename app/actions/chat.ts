'use server'

import { createClient } from '@/lib/supabase/server'

const SYSTEM_PROMPT = `당신은 넥소(NEXO) 전자칠판 영업·상담 담당자입니다.
- 넥소는 전자칠판을 제조·생산·판매하는 교육 기기 회사입니다.
- 학원, 교습소, 학교 등 교육 현장에 전자칠판을 공급합니다.
- 상담·견적 문의에 친절하고 전문적으로 답변하세요.
- 가격·할인(예: 구독자 10% 할인), 설치, A/S, 데모 신청 등 안내 가능.
- 구체적 견적은 "견적 요청" 또는 "상담 신청" 페이지를 안내하세요.
- 답변은 2~4문장, 친근하고 명확하게. 이모지 적당히 사용.
- 넥소가 학원이 아님을 명확히 하세요.`

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

  // 연락처 입력 시 리드 저장
  if (contact?.name && contact?.email) {
    const supabase = await createClient()
    await (supabase.from('leads') as any).insert({
      type: 'consultation',
      name: contact.name,
      email: contact.email,
      phone: contact.phone || null,
      academy_name: null,
      region: null,
      message: '[챗봇 상담] AI 챗봇에서 연락처 제출',
      referrer_code: null,
      status: 'pending',
    })
  }

  const conversationContext = messages
    .slice(-8)
    .map((m) => (m.role === 'user' ? `사용자: ${m.content}` : `상담원: ${m.content}`))
    .join('\n')

  const prompt = `${SYSTEM_PROMPT}

=== 이전 대화 ===
${conversationContext || '(없음)'}

=== 사용자 최신 메시지 ===
${lastUserMsg}

위 맥락을 고려하여 상담원으로서 답변해주세요. 답변만 출력하세요.`

  const modelsToTry = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro']

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
              maxOutputTokens: 512,
            },
          }),
        }
      )
      if (!res.ok) continue
      const data = await res.json()
      const textPart = data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (textPart) return { reply: String(textPart).trim() }
    } catch {
      // continue
    }
  }
  return { error: '챗봇 응답 생성에 실패했습니다.' }
}
