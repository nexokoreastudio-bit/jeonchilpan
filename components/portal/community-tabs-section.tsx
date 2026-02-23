'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { PostWithAuthor } from '@/lib/supabase/posts'

type BoardType = 'all' | 'bamboo' | 'materials' | 'verification'

const TABS: { key: BoardType; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'bamboo', label: '대나무숲' },
  { key: 'materials', label: '자료실' },
  { key: 'verification', label: '구독자 인증' },
]

const BOARD_LABELS: Record<string, string> = {
  bamboo: '대나무숲',
  materials: '자료실',
  verification: '인증',
}

interface CommunityTabsSectionProps {
  postsByBoard: {
    all: PostWithAuthor[]
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
    <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="border-b border-gray-200">
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'bg-[#00c4b4] text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {posts.length === 0 ? (
          <p className="py-8 text-center text-gray-500 text-sm">게시글이 없습니다.</p>
        ) : (
          posts.slice(0, 8).map((post) => (
            <Link
              key={post.id}
              href={`/community/${post.id}`}
              className="block px-4 py-3 hover:bg-gray-50/50 group"
            >
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-0.5">
                {post.board_type && (
                  <span className="text-gray-400">[{BOARD_LABELS[post.board_type] || post.board_type}]</span>
                )}
                <span>{post.author?.nickname || '익명'}</span>
                <span>{format(new Date(post.created_at), 'M.d HH:mm', { locale: ko })}</span>
              </div>
              <h3 className="text-sm font-medium text-gray-900 group-hover:text-[#00c4b4] line-clamp-1">
                {post.title}
              </h3>
              <div className="flex gap-3 text-xs text-gray-400 mt-0.5">
                <span>👍 {post.likes_count}</span>
                <span>💬 {post.comments_count}</span>
              </div>
            </Link>
          ))
        )}
      </div>
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <Link
          href="/community"
          className="text-sm font-medium text-[#00c4b4] hover:underline"
        >
          커뮤니티 전체 보기 →
        </Link>
      </div>
    </section>
  )
}
