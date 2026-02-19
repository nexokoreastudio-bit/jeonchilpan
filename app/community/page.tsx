import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPostsByBoardType } from '@/lib/supabase/posts'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { MessageSquare, HelpCircle, Lightbulb, Newspaper } from 'lucide-react'
import styles from './community.module.css'

const BOARD_TYPES = [
  { type: null, label: '전체', icon: MessageSquare },
  { type: 'news_discussion', label: '📰 뉴스 토론', icon: Newspaper },
  { type: 'free', label: '자유게시판', icon: MessageSquare },
  { type: 'qna', label: 'Q&A', icon: HelpCircle },
  { type: 'tip', label: '팁 & 노하우', icon: Lightbulb },
  // 중고장터는 숨김
  // { type: 'market', label: '중고장터', icon: ShoppingBag },
] as const

interface PageProps {
  searchParams: {
    board?: string
  }
}

export default async function CommunityPage({ searchParams }: PageProps) {
  const supabase = await createClient()

  // 현재 사용자 확인
  const { data: { user } } = await supabase.auth.getUser()

  // 게시판 타입 파싱 (중고장터 제외)
  const boardType =
    searchParams.board && ['free', 'qna', 'tip', 'news_discussion'].includes(searchParams.board)
      ? (searchParams.board as 'free' | 'qna' | 'tip' | 'news_discussion')
      : null

  // 게시글 목록 가져오기
  const posts = await getPostsByBoardType(boardType)

  const selectedBoard = BOARD_TYPES.find(b => b.type === boardType) || BOARD_TYPES[0]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>💬 커뮤니티</h1>
        <p className={styles.subtitle}>
          {boardType === 'news_discussion' 
            ? '교육 뉴스를 주제로 토론하고 의견을 나눠보세요'
            : '넥소 사용자들과 정보를 공유하고 소통하세요'}
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
      {user && (
        <div className={styles.actions}>
          <Link href="/community/write" className={styles.writeButton}>
            ✍️ 글쓰기
          </Link>
        </div>
      )}

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
            >
              <div className={styles.postHeader}>
                <div className={styles.postMeta}>
                  <span className={styles.boardType}>
                    {post.board_type === 'market' 
                      ? '중고장터' 
                      : post.board_type === 'news_discussion'
                      ? '📰 뉴스 토론'
                      : BOARD_TYPES.find(b => b.type === post.board_type)?.label || '전체'}
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
                {post.content.length > 150 ? '...' : ''}
              </p>
              <div className={styles.postFooter}>
                <div className={styles.postStats}>
                  <span>👍 {post.likes_count}</span>
                  <span>💬 {post.comments_count}</span>
                </div>
                {post.images && post.images.length > 0 && (
                  <span className={styles.hasImages}>📷 {post.images.length}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}


