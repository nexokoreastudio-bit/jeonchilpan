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
      if (result.reply) setMessages((m) => [...m, { role: 'assistant', content: result.reply ?? '' }])
    } catch (e: any) {
      const errMsg = e?.message || '죄송합니다. 잠시 후 다시 시도해주세요.'
      setMessages((m) => [...m, { role: 'assistant', content: errMsg }])
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
        <Link
          href="/leads/consultation?type=quote"
          className="fixed right-4 sm:right-6 z-40 px-4 py-3 sm:py-2 rounded-lg bg-[#00c4b4] text-white text-sm font-medium shadow-lg hover:bg-[#00a396] transition-colors min-h-[44px] sm:min-h-0 flex items-center [touch-action:manipulation] bottom-[max(6rem,calc(5rem+env(safe-area-inset-bottom)))] sm:bottom-24"
        >
          전자칠판 상담 신청
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed right-4 sm:right-6 z-[100] w-14 h-14 rounded-full bg-[#1a1a1a] text-white shadow-lg hover:bg-[#00c4b4] transition-colors flex items-center justify-center cursor-pointer [touch-action:manipulation] bottom-[max(1.5rem,env(safe-area-inset-bottom))] sm:bottom-6"
          aria-label="넥소 전자칠판 상담 열기"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </>
    )
  }

  return (
    <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-[100] w-full sm:w-[380px] sm:max-w-[calc(100vw-2rem)] max-h-[85vh] sm:max-h-none sm:rounded-2xl rounded-t-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden sm:mb-0 mb-[env(safe-area-inset-bottom,0)] bg-white" style={{ backgroundColor: '#ffffff' }}>
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
        className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-3 min-h-[280px] max-h-[400px] bg-white"
      >
        {messages.length === 0 && (
          <div className="space-y-3">
            <div className="text-slate-500 text-sm">
              안녕하세요! 넥소 전자칠판에 대해 궁금한 점을 물어보세요.
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/leads/consultation?type=demo"
                className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#00c4b4]/10 text-[#00c4b4] text-xs font-medium hover:bg-[#00c4b4]/20 transition-colors"
              >
                시연 상담
              </Link>
              <Link
                href="/leads/consultation?type=quote"
                className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#00c4b4]/10 text-[#00c4b4] text-xs font-medium hover:bg-[#00c4b4]/20 transition-colors"
              >
                견적 상담
              </Link>
              {!contactSubmitted && (
                <button
                  type="button"
                  onClick={toggleContactForm}
                  className="inline-flex items-center px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 transition-colors"
                >
                  상담사 연결
                </button>
              )}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex min-w-0 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] min-w-0 rounded-2xl px-4 py-2 text-sm break-words whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-[#00c4b4] text-white'
                  : 'bg-slate-100 text-slate-800'
              }`}
            >
              <ChatMessageContent content={m.content} isUser={m.role === 'user'} />
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
        <div className="px-4 pb-2 space-y-2 bg-white">
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

      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200 flex gap-2 bg-white">
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

      <div className="px-4 pb-3 space-y-2 bg-white">
        <div className="flex flex-wrap gap-2 justify-center">
          <Link
            href="/leads/consultation?type=demo"
            className="text-xs text-[#00c4b4] hover:underline font-medium"
          >
            시연 상담
          </Link>
          <span className="text-slate-300">|</span>
          <Link
            href="/leads/consultation?type=quote"
            className="text-xs text-[#00c4b4] hover:underline font-medium"
          >
            견적 상담
          </Link>
          {!contactSubmitted && (
            <>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={toggleContactForm}
                className="text-xs text-slate-600 hover:text-[#00c4b4] font-medium"
              >
                상담사 연결
              </button>
            </>
          )}
        </div>
        <Link
          href="/leads/consultation?type=quote"
          className="block text-center py-2 text-sm font-medium text-[#00c4b4] hover:underline"
        >
          상담신청으로 빠르게 안내받기 →
        </Link>
      </div>
    </div>
  )
}

/** 마크다운 링크 [텍스트](url) 및 URL을 클릭 가능한 링크로 렌더링. 사이트 내 경로는 같은 탭에서 이동 */
function ChatMessageContent({ content, isUser }: { content: string; isUser: boolean }) {
  const linkClass = isUser ? 'underline opacity-90' : 'text-[#00c4b4] hover:underline'
  const parts: { type: 'text' | 'internal' | 'external'; text: string; href?: string }[] = []
  let remaining = content

  // 1. 마크다운 링크 [텍스트](/path) 또는 [텍스트](https://...)
  const mdLinkRegex = /\[([^\]]+)\]\((\/[^\)]+|https?:\/\/[^\)]+)\)/g
  let match
  let lastIndex = 0
  while ((match = mdLinkRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', text: content.slice(lastIndex, match.index) })
    }
    const href = match[2]
    const isInternal = href.startsWith('/')
    parts.push({
      type: isInternal ? 'internal' : 'external',
      text: match[1],
      href,
    })
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < content.length) {
    remaining = content.slice(lastIndex)
  } else {
    remaining = ''
  }

  // 2. 남은 텍스트에서 http URL 추출
  const urlRegex = /(https?:\/\/[^\s\)]+)/g
  const urlParts = remaining.split(urlRegex)

  return (
    <>
      {parts.map((p, i) => {
        if (p.type === 'text') return <span key={i}>{p.text}</span>
        if (p.type === 'internal' && p.href)
          return (
            <Link key={i} href={p.href} className={linkClass}>
              {p.text}
            </Link>
          )
        if (p.type === 'external' && p.href)
          return (
            <a key={i} href={p.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
              {p.text}
            </a>
          )
        return null
      })}
      {urlParts.map((part, i) =>
        part.startsWith('http') ? (
          <a key={`url-${i}`} href={part} target="_blank" rel="noopener noreferrer" className={linkClass}>
            {part}
          </a>
        ) : (
          <span key={`url-${i}`}>{part}</span>
        )
      )}
    </>
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
