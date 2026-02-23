'use client'

import Link from 'next/link'
import { useState } from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { ChevronRight } from 'lucide-react'
import type { PortalPost, PortalComment, PortalNotice } from '@/lib/supabase/portal'

interface PortalSidebarProps {
  notices: PortalNotice[]
  popularPosts: PortalPost[]
  latestPosts: PortalPost[]
  latestComments: PortalComment[]
}

type TabType = 'popular' | 'latest' | 'comments'

export function PortalSidebar({
  notices,
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
    bamboo: '대나무숲',
    materials: '자료실',
    verification: '인증',
  }

  const renderList = () => {
    if (activeTab === 'popular') {
      return popularPosts.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">인기 글이 없습니다.</p>
      ) : (
        <ol className="space-y-2">
          {popularPosts.map((post, i) => (
            <li key={post.id}>
              <Link
                href={`/community/${post.id}`}
                className="flex items-start gap-2 text-sm text-gray-700 hover:text-[#00c4b4] group"
              >
                <span className="shrink-0 font-semibold text-gray-400 w-5">{i + 1}.</span>
                <span className="line-clamp-2 flex-1 group-hover:underline">
                  {post.title}
                </span>
                <ChevronRight className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100" />
              </Link>
              <div className="text-xs text-gray-400 mt-0.5 ml-5">
                👍 {post.likes_count} · 💬 {post.comments_count}
                {post.board_type && (
                  <span className="ml-2 text-gray-400">
                    [{boardLabels[post.board_type] || post.board_type}]
                  </span>
                )}
              </div>
            </li>
          ))}
        </ol>
      )
    }
    if (activeTab === 'latest') {
      return latestPosts.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">최신 글이 없습니다.</p>
      ) : (
        <ul className="space-y-2">
          {latestPosts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/community/${post.id}`}
                className="flex items-start gap-2 text-sm text-gray-700 hover:text-[#00c4b4] group"
              >
                <span className="line-clamp-2 flex-1 group-hover:underline">{post.title}</span>
                <ChevronRight className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100" />
              </Link>
              <div className="text-xs text-gray-400 mt-0.5">
                {format(new Date(post.created_at), 'M.d HH:mm', { locale: ko })}
              </div>
            </li>
          ))}
        </ul>
      )
    }
    if (activeTab === 'comments') {
      return latestComments.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">최신 댓글이 없습니다.</p>
      ) : (
        <ul className="space-y-2">
          {latestComments.map((c) => (
            <li key={c.id}>
              <Link
                href={`/community/${c.post_id}#comment-${c.id}`}
                className="block text-sm text-gray-700 hover:text-[#00c4b4] group"
              >
                <span className="line-clamp-1 text-gray-500 text-xs">[{c.post_title}]</span>
                <span className="line-clamp-2 group-hover:underline">
                  {c.content.replace(/<[^>]*>/g, '').substring(0, 60)}
                  {c.content.length > 60 ? '...' : ''}
                </span>
              </Link>
              <div className="text-xs text-gray-400 mt-0.5">
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
    <aside className="hidden lg:block w-72 shrink-0 pl-6 border-l border-gray-200">
      <div className="sticky top-24 space-y-6">
        {/* 공지사항 */}
        {notices.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              공지사항
            </h3>
            <ul className="space-y-2">
              {notices.map((n) => (
                <li key={n.id}>
                  <Link
                    href={n.edition_id ? `/news/${n.edition_id}` : '/news'}
                    className="text-sm text-gray-700 hover:text-[#00c4b4] hover:underline line-clamp-2"
                  >
                    {n.title}
                  </Link>
                  <span className="text-xs text-gray-400">
                    {format(new Date(n.created_at), 'M.d', { locale: ko })}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 인기글 / 최신글 / 최신댓글 탭 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex gap-1 border-b border-gray-100 mb-3">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-2 text-xs font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'text-[#00c4b4] border-b-2 border-[#00c4b4] -mb-[1px]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="min-h-[200px]">{renderList()}</div>
          <Link
            href="/community"
            className="mt-3 flex items-center justify-center gap-1 text-xs font-medium text-[#00c4b4] hover:underline"
          >
            커뮤니티 전체 보기
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* 시연신청 CTA */}
        <div className="p-4 rounded-lg bg-[#00c4b4]/10 border border-[#00c4b4]/20">
          <p className="text-sm font-semibold text-gray-900 mb-2">전자칠판 시연</p>
          <p className="text-xs text-gray-600 mb-3">쇼룸에서 직접 체험해보세요</p>
          <Link
            href="/leads/demo"
            className="inline-flex items-center gap-1 text-sm font-bold text-[#00c4b4] hover:underline"
          >
            시연 예약하기
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </aside>
  )
}
