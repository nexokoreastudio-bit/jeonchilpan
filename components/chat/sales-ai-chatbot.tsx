'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'
import { sendChatMessage } from '@/app/actions/chat'

interface ChatMsg {
  role: 'user' | 'assistant'
  content: string
}

export function SalesAIChatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [contact, setContact] = useState({ name: '', email: '', phone: '' })
  const [contactSubmitted, setContactSubmitted] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string, includeContact?: boolean) => {
    if (!text.trim() || loading) return
    const userMsg: ChatMsg = { role: 'user', content: text.trim() }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setLoading(true)

    const payloadContact =
      (includeContact && contact.name.trim() && contact.email.trim())
        ? { name: contact.name.trim(), email: contact.email.trim(), phone: contact.phone.trim() || undefined }
        : undefined

    try {
      const result = await sendChatMessage(
        [...messages, userMsg],
        payloadContact
      )
      if (result.error) throw new Error(result.error)
      if (result.reply) setMessages((m) => [...m, { role: 'assistant', content: result.reply }])
    } catch (e: any) {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: '죄송합니다. 잠시 후 다시 시도해주세요.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (showContactForm && !contactSubmitted) {
      if (contact.name.trim() && contact.email.trim()) {
        setContactSubmitted(true)
        sendMessage('[연락처 등록]', true)
      }
      return
    }
    sendMessage(input)
  }

  const toggleContactForm = () => {
    setShowContactForm((v) => !v)
    if (!showContactForm) setInput('')
  }

  if (!open) {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#1a1a1a] text-white shadow-lg hover:bg-[#00c4b4] transition-colors flex items-center justify-center"
          aria-label="챗봇 열기"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
        <Link
          href="/leads/quote"
          className="fixed bottom-24 right-6 z-40 px-4 py-2 rounded-lg bg-[#00c4b4] text-white text-sm font-medium shadow-lg hover:bg-[#00a396] transition-colors"
        >
          전자칠판 10% 할인가 견적 받기
        </Link>
      </>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-[#1a1a1a] text-white">
        <span className="font-semibold">넥소 전자칠판 상담</span>
        {!contactSubmitted && (
          <button
            onClick={toggleContactForm}
            className="text-xs text-white/80 hover:text-white"
          >
            {showContactForm ? '취소' : '연락처 남기기'}
          </button>
        )}
        <button
          onClick={() => setOpen(false)}
          className="p-1 hover:bg-white/10 rounded"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[280px] max-h-[360px]"
      >
        {messages.length === 0 && (
          <div className="text-slate-500 text-sm">
            안녕하세요! 넥소 전자칠판에 대해 궁금한 점을 물어보세요.
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                m.role === 'user'
                  ? 'bg-[#00c4b4] text-white'
                  : 'bg-slate-100 text-slate-800'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-2xl px-4 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
            </div>
          </div>
        )}
      </div>

      {showContactForm && !contactSubmitted && (
        <div className="px-4 pb-2 space-y-2">
          <input
            type="text"
            placeholder="이름 *"
            value={contact.name}
            onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="email"
            placeholder="이메일 *"
            value={contact.email}
            onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="tel"
            placeholder="연락처"
            value={contact.phone}
            onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            showContactForm && !contactSubmitted
              ? '이름·이메일 입력 후 제출 버튼'
              : '메시지를 입력하세요'
          }
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00c4b4]"
        />
        <Button
          type="submit"
          disabled={
            loading ||
            (showContactForm && !contactSubmitted
              ? !contact.name.trim() || !contact.email.trim()
              : !input.trim())
          }
          className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#00c4b4] text-white rounded-lg shrink-0"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : showContactForm && !contactSubmitted ? (
            '연락처 등록'
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </form>

      <div className="px-4 pb-3">
        <Link
          href="/leads/quote"
          className="block text-center py-2 text-sm font-medium text-[#00c4b4] hover:underline"
        >
          전자칠판 10% 할인가 견적 받기 →
        </Link>
      </div>
    </div>
  )
}

function Button({
  type,
  disabled,
  className,
  children,
}: {
  type: 'submit'
  disabled?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <button type={type} disabled={disabled} className={className}>
      {children}
    </button>
  )
}
