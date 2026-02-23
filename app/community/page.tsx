import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPostsByBoardType, type BoardType } from '@/lib/supabase/posts'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { FileStack, MessageSquare, BadgeCheck, FileText } from 'lucide-react'
import type { Metadata } from 'next'
import { ForumJsonLd } from '@/components/seo/json-ld'
import styles from './community.module.css'
import { Megaphone } from 'lucide-react'
import { CenterBanner } from '@/components/shared/center-banner'

/** 최근 7일 이내 작성된 글인지 (NEW 배지용) */
function isNewPost(createdAt: string): boolean {
  const created = new Date(createdAt).getTime()
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  return created > sevenDaysAgo
}

const BOARD_TYPES = [
  { type: null, label: '전체', icon: MessageSquare },
  { type: 'notice', label: '공지사항', icon: Megaphone },
  { type: 'bamboo', label: '원장님 대나무숲', icon: MessageSquare },
  { type: 'materials', label: '공유자료실', icon: FileStack },
  { type: 'verification', label: '구독자 인증', icon: BadgeCheck },
] as const

const VALID_BOARD_TYPES: BoardType[] = ['notice', 'bamboo', 'materials', 'verification']

interface PageProps {
  searchParams: {
    board?: string
  }
}

export const metadata: Metadata = {
  title: '전칠판 | 한국 전자칠판 공개 커뮤니티 - NEXO 운영',
  description: '한국 전자칠판·스마트보드 사용자들의 자료 공유와 소통 공간. NEXO가 운영합니다.',
  keywords: ['전칠판', '넥소 전자칠판', '학원장 모임', '강사 커뮤니티', '전자칠판 자료', '학원 구인구직', '지역 학원 네트워크'],
  openGraph: {
    title: '전칠판 | NEXO Daily',
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
        name="전칠판 - NEXO Daily 전자칠판 커뮤니티"
        description="넥소 전자칠판 사용자들의 자료 공유, 지역 네트워크, 구인구직, 자유소통 공간. 학원장과 강사들의 실질적인 네트워킹과 역량 강화를 위한 전칠판."
        url={communityUrl}
      />
    <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-start">
    <section className="flex-1 min-w-0 bg-white border border-gray-200/80 overflow-hidden rounded-lg shadow-sm">
          <div className="border-b border-gray-100 bg-slate-50/50 px-4 py-3">
            <h1 className="text-sm font-bold text-slate-800">
              💬 전칠판
              {boardType === 'materials' && (
                <span className="text-slate-600 font-normal ml-1">
                  {' > '}공유자료실
                </span>
              )}
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">
              {boardType === 'materials'
                ? '템플릿·자료를 공유하고 큰 화면에서 활용하세요'
                : '학원장과 강사들의 실질적인 네트워킹과 역량 강화를 위한 전문가 플랫폼'}
            </p>
          </div>
          <div className="p-4 md:p-5">
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

      {/* 중앙 배너 - 콘텐츠와 사이드바 사이 */}
      <div className="mb-6">
        <CenterBanner variant="primary" />
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
              className={styles.postRow}
            >
              <div className={styles.postRowLeft}>
                <h2 className={styles.postTitle}>
                  {post.title}
                  {post.comments_count > 0 && (
                    <span className={styles.commentCount}> [{post.comments_count}]</span>
                  )}
                </h2>
                <div className={styles.postIcons}>
                  {isNewPost(post.created_at) && (
                    <span className={styles.newBadge}>N</span>
                  )}
                  {(post.images?.length ?? 0) > 0 && (
                    <FileText className={styles.attachIcon} />
                  )}
                </div>
              </div>
              <div className={styles.postRowRight}>
                <span className={styles.authorName} title={post.author?.nickname || '익명'}>
                  {post.author?.nickname || '익명'}
                </span>
                <span className={styles.date}>
                  {format(new Date(post.created_at), 'yyyy.MM.dd', { locale: ko })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* 자연스러운 연결 - 자료 공유와 연계 */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <p className="text-sm text-slate-500 text-center">
          자료 공유 게시판에 올리시는 템플릿·자료는 큰 화면에 띄워 보시기 좋게 활용하시면 효과적입니다.{' '}
          <Link href="/leads/demo" className="text-[#00c4b4] hover:underline font-medium">
            전자칠판 시연 예약
          </Link>
        </p>
      </div>
          </div>
        </section>
    </div>
    </>
  )
}


