'use client'

import Link from 'next/link'
import { useState } from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { ChevronRight } from 'lucide-react'
import { PortalLoginBox } from './portal-login-box'
import type { PortalPost, PortalComment, PortalNotice, PortalEducationNews } from '@/lib/supabase/portal'

interface PortalSidebarProps {
  notices: PortalNotice[]
  educationNews: PortalEducationNews[]
  popularPosts: PortalPost[]
  latestPosts: PortalPost[]
  latestComments: PortalComment[]
}

type TabType = 'popular' | 'latest' | 'comments'

export function PortalSidebar({
  notices,
  educationNews,
  popularPosts,
  latestPosts,
  latestComments,
}: PortalSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabType>('popular')

  const tabs: { key: TabType; label: string }[] = [
    { key: 'popular', label: '인기글' },
    { key: 'latest', label: '최신글' },
    { key: 'comments', label: '최신댓글' },
  ]

  const boardLabels: Record<string, string> = {
    notice: '공지',
    bamboo: '대나무숲',
    materials: '자료공유',
    job: '구인/구직',
    verification: '인증',
  }

  const renderList = () => {
    if (activeTab === 'popular') {
      return popularPosts.length === 0 ? (
        <p className="text-sm text-slate-500 py-6">인기 글이 없습니다.</p>
      ) : (
        <ol className="space-y-2">
          {popularPosts.map((post, i) => (
            <li key={post.id}>
              <Link
                href={`/community/${post.id}`}
                className="flex items-start gap-2 text-sm text-slate-700 hover:text-[#00c4b4] transition-colors group"
              >
                <span className="shrink-0 font-semibold text-gray-400 w-5">{i + 1}.</span>
                <span className="line-clamp-2 flex-1 group-hover:underline">
                  {post.title}
                </span>
                <ChevronRight className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100" />
              </Link>
              {post.board_type && (
                <div className="text-xs text-slate-400 mt-0.5 ml-5">
                  [{boardLabels[post.board_type] || post.board_type}]
                </div>
              )}
            </li>
          ))}
        </ol>
      )
    }
    if (activeTab === 'latest') {
      return latestPosts.length === 0 ? (
        <p className="text-sm text-slate-500 py-6">최신 글이 없습니다.</p>
      ) : (
        <ul className="space-y-2">
          {latestPosts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/community/${post.id}`}
                className="flex items-start gap-2 text-sm text-slate-700 hover:text-[#00c4b4] transition-colors group"
              >
                <span className="line-clamp-2 flex-1 group-hover:underline">{post.title}</span>
                <ChevronRight className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100" />
              </Link>
              <div className="text-xs text-slate-400 mt-0.5">
                {format(new Date(post.created_at), 'M.d HH:mm', { locale: ko })}
              </div>
            </li>
          ))}
        </ul>
      )
    }
    if (activeTab === 'comments') {
      return latestComments.length === 0 ? (
        <p className="text-sm text-slate-500 py-6">최신 댓글이 없습니다.</p>
      ) : (
        <ul className="space-y-2">
          {latestComments.map((c) => (
            <li key={c.id}>
              <Link
                href={`/community/${c.post_id}#comment-${c.id}`}
                className="block text-sm text-slate-700 hover:text-[#00c4b4] transition-colors group"
              >
                <span className="line-clamp-1 text-slate-500 text-xs">[{c.post_title}]</span>
                <span className="line-clamp-2 group-hover:underline">
                  {c.content.replace(/<[^>]*>/g, '').substring(0, 60)}
                  {c.content.length > 60 ? '...' : ''}
                </span>
              </Link>
              <div className="text-xs text-slate-400 mt-0.5">
                {format(new Date(c.created_at), 'M.d HH:mm', { locale: ko })}
              </div>
            </li>
          ))}
        </ul>
      )
    }
    return null
  }

  return (
    <aside className="hidden lg:block w-72 shrink-0">
      <div className="sticky top-24 space-y-4">
        {/* 로그인 섹션 - 코인판 스타일 */}
        <PortalLoginBox />

        {/* 공지사항 - 코인판 스타일 */}
        {notices.length > 0 && (
          <div className="bg-white border border-gray-200/80 overflow-hidden rounded-lg shadow-sm">
            <div className="border-b border-gray-100 bg-slate-50/50 px-4 py-2.5 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                공지사항
              </h3>
              <Link href="/community?board=notice" className="text-[10px] text-slate-500 hover:text-[#00c4b4] transition-colors">
                더보기 +
              </Link>
            </div>
            <div className="p-3">
            <ul className="space-y-2.5">
              {notices.map((n) => (
                <li key={n.id}>
                  <Link
                    href={n.edition_id ? `/news/${n.edition_id}` : `/community/${n.id}`}
                    className="text-sm text-slate-700 hover:text-[#00c4b4] transition-colors line-clamp-2"
                  >
                    {n.title}
                  </Link>
                  <span className="text-xs text-slate-400 block mt-0.5">
                    {format(new Date(n.created_at), 'M.d', { locale: ko })}
                  </span>
                </li>
              ))}
            </ul>
            </div>
          </div>
        )}

        {/* 학업뉴스 - 크롤링 뉴스 */}
        {educationNews.length > 0 && (
          <div className="bg-white border border-gray-200/80 overflow-hidden rounded-lg shadow-sm">
            <div className="border-b border-gray-100 bg-slate-50/50 px-4 py-2.5 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                학업뉴스
              </h3>
              <Link href="/news/crawled" className="text-[10px] text-slate-500 hover:text-[#00c4b4] transition-colors">
                더보기 +
              </Link>
            </div>
            <div className="p-3">
              <ul className="space-y-2.5">
                {educationNews.map((news) => (
                  <li key={news.id}>
                    <a
                      href={news.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-slate-700 hover:text-[#00c4b4] transition-colors line-clamp-2"
                    >
                      {news.title}
                    </a>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      {news.source} · {format(new Date(news.created_at), 'M.d', { locale: ko })}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* 인기글 / 최신글 / 최신댓글 - 코인판 코인뉴스/인기검색어 스타일 */}
        <div className="bg-white border border-gray-200/80 overflow-hidden rounded-lg shadow-sm">
          <div className="flex gap-0 border-b border-gray-100 bg-slate-50/50">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 px-2 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab.key
                    ? 'bg-white text-[#00c4b4] border-[#00c4b4]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="min-h-[180px] p-3">{renderList()}</div>
          <div className="border-t border-gray-100 px-3 py-2.5 bg-slate-50/30">
          <Link
            href="/community"
            className="flex items-center justify-center gap-1 text-xs font-medium text-[#00c4b4] hover:underline"
          >
            전칠판 전체 보기
            <ChevronRight className="w-3 h-3" />
          </Link>
          </div>
        </div>

        {/* 실전 팁 - 전자칠판 활용 팁 */}
        <div className="bg-white border border-gray-200/80 overflow-hidden rounded-lg shadow-sm">
          <div className="border-b border-gray-100 bg-amber-50/80 px-4 py-2.5 flex items-center gap-2">
            <span className="text-amber-600">💡</span>
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              실전 팁
            </h3>
          </div>
          <div className="p-3 space-y-2.5">
            <p className="text-sm text-slate-700 leading-relaxed">
              <strong className="text-slate-800">QR 공유:</strong> 판서 내용을 즉시 PDF로 변환하여 학생들에게 전송하세요.
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">
              <strong className="text-slate-800">화면 분할:</strong> 한쪽에는 영상을, 다른 한쪽에는 판서를 동시에 진행하세요.
            </p>
          </div>
        </div>

        {/* 상담신청 CTA - 넥소 배너 */}
        <div className="bg-white border border-gray-200/80 overflow-hidden rounded-lg shadow-sm">
          <div className="border-b border-gray-100 bg-[#00c4b4]/5 px-4 py-2.5">
            <span className="text-xs font-bold text-slate-600">NEXO</span>
          </div>
          <div className="p-4">
          <p className="text-sm font-semibold text-slate-800 mb-2">전자칠판 상담신청</p>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">도입 상담부터 신청 절차까지 안내해드립니다</p>
          <Link
            href="/leads/consultation"
            className="inline-flex items-center gap-1 text-sm font-bold text-[#00c4b4] hover:text-[#00a396] transition-colors"
          >
            상담신청 바로가기
            <ChevronRight className="w-3 h-3" />
          </Link>
          </div>
        </div>
      </div>
    </aside>
  )
}
