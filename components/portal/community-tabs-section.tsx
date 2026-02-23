'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { PostWithAuthor } from '@/lib/supabase/posts'

type BoardType = 'all' | 'notice' | 'bamboo' | 'materials' | 'verification'

const TABS: { key: BoardType; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'notice', label: '공지사항' },
  { key: 'bamboo', label: '대나무숲' },
  { key: 'materials', label: '자료공유' },
  { key: 'verification', label: '구독자 인증' },
]

const BOARD_LABELS: Record<string, string> = {
  notice: '공지',
  bamboo: '대나무숲',
  materials: '자료공유',
  verification: '인증',
}

function isNewPost(createdAt: string): boolean {
  const created = new Date(createdAt).getTime()
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  return created > sevenDaysAgo
}

interface CommunityTabsSectionProps {
  postsByBoard: {
    all: PostWithAuthor[]
    notice: PostWithAuthor[]
    bamboo: PostWithAuthor[]
    materials: PostWithAuthor[]
    verification: PostWithAuthor[]
  }
}

export function CommunityTabsSection({ postsByBoard }: CommunityTabsSectionProps) {
  const [activeTab, setActiveTab] = useState<BoardType>('all')
  const posts = postsByBoard[activeTab]

  if (posts.length === 0 && activeTab === 'all') {
    const allEmpty = Object.values(postsByBoard).every((arr) => arr.length === 0)
    if (allEmpty) return null
  }

  return (
    <div>
      {/* 탭 - 코인판 커뮤니티글박스 스타일 */}
      <div className="border-b border-gray-100">
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === tab.key
                  ? 'bg-white text-[#00c4b4] border-[#00c4b4]'
                  : 'bg-slate-50/30 text-slate-600 hover:text-slate-800 hover:bg-slate-50/60 border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {posts.length === 0 ? (
          <p className="py-8 text-center text-slate-500 text-sm">게시글이 없습니다.</p>
        ) : (
          posts.slice(0, 8).map((post) => (
            <Link
              key={post.id}
              href={`/community/${post.id}`}
              className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50/50 group border-l-2 border-transparent hover:border-[#00c4b4]/50 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <h3 className="text-sm font-medium text-slate-800 group-hover:text-[#00c4b4] line-clamp-1 truncate">
                  {post.title}
                  {post.comments_count > 0 && (
                    <span className="text-red-500 font-semibold"> [{post.comments_count}]</span>
                  )}
                </h3>
                {isNewPost(post.created_at) && (
                  <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 text-[11px] font-bold leading-none text-white bg-[#f97316] rounded shrink-0">
                    N
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0 text-xs min-w-[120px]">
                <span
                  className="text-slate-600 truncate flex-1 min-w-0"
                  title={post.author?.nickname || '익명'}
                >
                  {post.author?.nickname || '익명'}
                </span>
                <span className="text-slate-400 shrink-0">{format(new Date(post.created_at), 'M.d', { locale: ko })}</span>
              </div>
            </Link>
          ))
        )}
      </div>
      <div className="px-4 py-2.5 bg-slate-50/30 border-t border-gray-100">
        <Link
          href="/community"
          className="text-xs font-medium text-[#00c4b4] hover:text-[#00a396] transition-colors"
        >
          전칠판 전체 보기 →
        </Link>
      </div>
    </div>
  )
}
