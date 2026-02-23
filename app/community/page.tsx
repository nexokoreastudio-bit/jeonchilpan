import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPostsByBoardType, type BoardType } from '@/lib/supabase/posts'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { FileStack, MessageSquare, BadgeCheck } from 'lucide-react'
import type { Metadata } from 'next'
import { ForumJsonLd } from '@/components/seo/json-ld'
import styles from './community.module.css'

const BOARD_TYPES = [
  { type: null, label: '전체', icon: MessageSquare },
  { type: 'bamboo', label: '원장님 대나무숲', icon: MessageSquare },
  { type: 'materials', label: '넥소 공식 자료실', icon: FileStack },
  { type: 'verification', label: '구독자 인증', icon: BadgeCheck },
] as const

const VALID_BOARD_TYPES: BoardType[] = ['bamboo', 'materials', 'verification']

interface PageProps {
  searchParams: {
    board?: string
  }
}

export const metadata: Metadata = {
  title: '커뮤니티 | 학원장·강사 전문가 네트워크',
  description: '넥소 전자칠판 사용자들의 자료 공유, 지역 네트워크, 구인구직, 자유소통 공간. 학원장과 강사들의 실질적인 네트워킹과 역량 강화를 위한 커뮤니티.',
  keywords: ['넥소 커뮤니티', '학원장 모임', '강사 커뮤니티', '전자칠판 자료', '학원 구인구직', '지역 학원 네트워크'],
  openGraph: {
    title: '커뮤니티 | NEXO Daily',
    description: '넥소 전자칠판 사용자들의 자료 공유, 지역 네트워크, 구인구직, 자유소통 공간.',
  },
}

export default async function CommunityPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  // 현재 사용자 확인
  const { data: { user } } = await supabase.auth.getUser()

  // 게시판 타입 파싱
  const boardType =
    searchParams.board && VALID_BOARD_TYPES.includes(searchParams.board as BoardType)
      ? (searchParams.board as BoardType)
      : null

  // 게시글 목록 가져오기
  const posts = await getPostsByBoardType(boardType)

  const selectedBoard = BOARD_TYPES.find(b => b.type === boardType) || BOARD_TYPES[0]

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://daily-nexo.netlify.app'
  const communityUrl = boardType
    ? `${baseUrl}/community?board=${boardType}`
    : `${baseUrl}/community`

  return (
    <>
      <ForumJsonLd
        name="NEXO Daily 커뮤니티"
        description="넥소 전자칠판 사용자들의 자료 공유, 지역 네트워크, 구인구직, 자유소통 공간. 학원장과 강사들의 실질적인 네트워킹과 역량 강화를 위한 커뮤니티."
        url={communityUrl}
      />
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>💬 커뮤니티</h1>
        <p className={styles.subtitle}>
          학원장과 강사들의 실질적인 네트워킹과 역량 강화를 위한 전문가 플랫폼
        </p>
      </div>

      {/* 게시판 탭 */}
      <div className={styles.tabs}>
        {BOARD_TYPES.map((board) => {
          const Icon = board.icon
          const isActive = board.type === boardType

          return (
            <Link
              key={board.type || 'all'}
              href={board.type ? `/community?board=${board.type}` : '/community'}
              className={`${styles.tab} ${isActive ? styles.active : ''}`}
            >
              <Icon className={styles.tabIcon} />
              <span>{board.label}</span>
            </Link>
          )
        })}
      </div>

      {/* 게시글 작성 버튼 */}
      <div className={styles.actions}>
        {user && (
          <Link href="/community/write" className={styles.writeButton}>
            ✍️ 글쓰기
          </Link>
        )}
      </div>

      {/* 게시글 목록 */}
      {posts.length === 0 ? (
        <div className={styles.empty}>
          <p>아직 게시글이 없습니다.</p>
          {user && (
            <Link href="/community/write" className={styles.emptyWriteButton}>
              첫 게시글 작성하기
            </Link>
          )}
        </div>
      ) : (
        <div className={styles.postsList}>
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/community/${post.id}`}
              className={styles.postCard}
              data-board={post.board_type === 'bamboo' ? 'bamboo' : undefined}
            >
              <div className={styles.postHeader}>
                <div className={styles.postMeta}>
                  <span className={styles.boardType}>
                    {BOARD_TYPES.find(b => b.type === post.board_type)?.label || '전체'}
                  </span>
                  <span className={styles.author}>
                    {post.author?.nickname || '익명'}
                  </span>
                  <span className={styles.date}>
                    {format(new Date(post.created_at), 'yyyy.MM.dd', { locale: ko })}
                  </span>
                </div>
                {post.updated_at !== post.created_at && (
                  <span className={styles.updated}>수정됨</span>
                )}
              </div>
              <h2 className={styles.postTitle}>{post.title}</h2>
              <p className={styles.postContent}>
                {post.content.replace(/<[^>]*>/g, '').substring(0, 150)}
                {post.content.replace(/<[^>]*>/g, '').length > 150 ? '...' : ''}
              </p>
              <div className={styles.postFooter}>
                <div className={styles.postStats}>
                  <div className={styles.statItem}>
                    <span>👍</span>
                    <span>{post.likes_count}</span>
                  </div>
                  <div className={styles.statItem}>
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.comments_count}</span>
                  </div>
                </div>
                {post.images && post.images.length > 0 && (
                  <span className={styles.hasImages}>
                    📷 <span>{post.images.length}</span>
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* 자연스러운 연결 - 자료 공유와 연계 */}
      <div className="mt-12 pt-8 border-t border-gray-100">
        <p className="text-sm text-gray-500 text-center">
          자료 공유 게시판에 올리시는 템플릿·자료는 큰 화면에 띄워 보시기 좋게 활용하시면 효과적입니다.{' '}
          <Link href="/leads/demo" className="text-[#00c4b4] hover:underline font-medium">
            전자칠판 시연 예약
          </Link>
        </p>
      </div>
    </div>
    </>
  )
}


