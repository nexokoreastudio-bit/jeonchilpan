import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getPostById } from '@/lib/supabase/posts'
import { deletePost } from '@/app/actions/posts'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { ArrowLeft, MessageSquare, FileStack, ExternalLink, BadgeCheck, Download, Briefcase } from 'lucide-react'
import { HtmlContent } from '@/components/html-content'
import { DeletePostButton } from '@/components/community/delete-post-button'
import { LikeButton } from '@/components/community/like-button'
import { CommentsSection } from '@/components/community/comments-section'
import { checkUserLiked } from '@/app/actions/likes'
import { Database } from '@/types/database'
import { JsonLd } from '@/components/seo/json-ld'
import { getNewsById } from '@/lib/supabase/news'
import styles from '../community.module.css'

const BOARD_TYPE_INFO = {
  notice: { label: '공지사항', icon: MessageSquare },
  bamboo: { label: '원장님 대나무숲', icon: MessageSquare },
  materials: { label: '공유자료실', icon: FileStack },
  job: { label: '구인/구직', icon: Briefcase },
  verification: { label: '구독자 인증', icon: BadgeCheck },
} as const

interface PageProps {
  params: {
    id: string
  }
}

export default async function PostDetailPage({ params }: PageProps) {
  const supabase = await createClient()
  const postId = parseInt(params.id)

  if (isNaN(postId)) {
    notFound()
  }

  const post = await getPostById(postId)

  if (!post) {
    notFound()
  }

  const { data: { user } } = await supabase.auth.getUser()
  const isAuthor = user?.id === post.author_id

  // 관리자 권한 확인
  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    const profileData = profile as Pick<Database['public']['Tables']['users']['Row'], 'role'> | null
    isAdmin = profileData?.role === 'admin'
  }

  const canEdit = isAuthor || isAdmin
  const canDelete = isAuthor || isAdmin

  // 좋아요 상태 확인
  const isLiked = user ? await checkUserLiked(post.id, user.id) : false
  const boardInfo = post.board_type && post.board_type in BOARD_TYPE_INFO 
    ? BOARD_TYPE_INFO[post.board_type as keyof typeof BOARD_TYPE_INFO] 
    : null

  // 뉴스 토론 게시글인 경우 뉴스 정보 가져오기
  const newsData = post.news_id ? await getNewsById(post.news_id) : null

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://daily-nexo.netlify.app'
  const currentUrl = `${baseUrl}/community/${post.id}`
  
  // 게시판 타입에 따른 구조화된 데이터
  const getJsonLdData = () => ({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.content.replace(/<[^>]*>/g, '').substring(0, 200),
    datePublished: post.created_at,
    dateModified: post.updated_at,
    author: {
      '@type': 'Person',
      name: post.author?.nickname || '익명',
    },
    publisher: {
      '@type': 'Organization',
      name: 'NEXO Daily',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': currentUrl,
    },
  })

  return (
    <>
      <JsonLd data={getJsonLdData()} />
      <div className={styles.container}>
        <Link href="/community" className={styles.backLink}>
          <ArrowLeft className="w-4 h-4" />
          전칠판 목록
        </Link>

        <article className={styles.postDetail}>
          <header className={styles.postDetailHeader}>
            <div className={styles.postDetailMeta}>
              {boardInfo && (
                <span className={styles.boardType}>
                  {boardInfo.label}
                </span>
              )}
              <span className={styles.date}>
                {format(new Date(post.created_at), 'yyyy년 M월 d일', { locale: ko })}
              </span>
            </div>

            <h1 className={styles.postDetailTitle}>{post.title}</h1>

            <div className="flex justify-center mb-8">
              <div className={styles.authorBadge}>
                <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-[10px] font-bold">
                  {post.author?.nickname?.[0] || '익'}
                </div>
                <span>{post.author?.nickname || '익명'}</span>
              </div>
            </div>
          </header>

          {/* 뉴스 정보 표시 (Professional Card Style) */}
          {newsData && (
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl mb-12 flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1 text-center md:text-left">
                <div className="text-[10px] font-bold text-blue-600 mb-2 uppercase tracking-widest">Reference News</div>
                <h3 className="font-bold text-xl text-slate-900 mb-2">
                  {newsData.title.replace(/<[^>]*>/g, '').trim()}
                </h3>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                  {newsData.summary?.replace(/<[^>]*>/g, '').trim()}
                </p>
                <a
                  href={newsData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#1a1a1a] hover:underline"
                >
                  원문 읽어보기 <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {post.images && post.images.length > 0 && (
            <div className="space-y-6">
              {post.images.some((url) => {
                const ext = (url.split('/').pop() || '').split('.').pop()?.toLowerCase() || ''
                return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)
              }) && (
                <div className={styles.postImages}>
                  {post.images
                    .filter((url) => {
                      const ext = (url.split('/').pop() || '').split('.').pop()?.toLowerCase() || ''
                      return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)
                    })
                    .map((imageUrl, index) => (
                      <img
                        key={index}
                        src={imageUrl}
                        alt={`첨부 이미지 ${index + 1}`}
                        className={styles.postImage}
                      />
                    ))}
                </div>
              )}
              {post.images.some((url) => {
                const fn = url.split('/').pop() || ''
                const ext = fn.split('.').pop()?.toLowerCase() || ''
                return ['pdf', 'pptx', 'docx', 'xlsx', 'hwp'].includes(ext)
              }) && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-700 mb-3">📎 첨부 문서</p>
                  <ul className="flex flex-wrap gap-2">
                    {post.images
                      .filter((url) => {
                        const fn = url.split('/').pop() || ''
                        const ext = fn.split('.').pop()?.toLowerCase() || ''
                        return ['pdf', 'pptx', 'docx', 'xlsx', 'hwp'].includes(ext)
                      })
                      .map((url, index) => {
                        const fn = url.split('/').pop() || `파일${index + 1}`
                        return (
                          <li key={index}>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                            >
                              <Download className="w-4 h-4" />
                              {decodeURIComponent(fn)}
                            </a>
                          </li>
                        )
                      })}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className={styles.postDetailContent}>
            <HtmlContent html={post.content} />
          </div>

          <div className={styles.postDetailFooter}>
            <div className={styles.postStats}>
              <LikeButton
                postId={post.id}
                userId={user?.id || null}
                initialLikesCount={post.likes_count}
                initialIsLiked={isLiked}
              />
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                <span>{post.comments_count}</span>
              </div>
            </div>

            {(canEdit || canDelete) && (
              <div className={styles.postActions}>
                {canEdit && (
                  <Link href={`/community/${post.id}/edit`} className={styles.editButton}>
                    수정
                  </Link>
                )}
                {canDelete && <DeletePostButton postId={post.id} />}
              </div>
            )}
          </div>
        </article>

        <div className="mb-20">
          <CommentsSection
            postId={post.id}
            userId={user?.id || null}
            initialCommentsCount={post.comments_count}
            postCreatedAt={post.created_at}
            isAdmin={isAdmin}
          />
        </div>
      </div>
    </>
  )
}

// 메타데이터 생성
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const postId = parseInt(params.id)
  
  if (isNaN(postId)) {
    return {
      title: '게시글을 찾을 수 없습니다',
      description: '요청하신 게시글을 찾을 수 없습니다.',
    }
  }

  const post = await getPostById(postId)
  
  if (!post) {
    return {
      title: '게시글을 찾을 수 없습니다',
      description: '요청하신 게시글을 찾을 수 없습니다.',
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://daily-nexo.netlify.app'
  const currentUrl = `${baseUrl}/community/${post.id}`
  const boardInfo = post.board_type && post.board_type in BOARD_TYPE_INFO 
    ? BOARD_TYPE_INFO[post.board_type as keyof typeof BOARD_TYPE_INFO] 
    : null
  
  const title = `${post.title} | ${boardInfo?.label || '전칠판'} - NEXO Daily`
  const description = post.content.replace(/<[^>]*>/g, '').substring(0, 160) || '넥소 전칠판 게시글'
  const imageUrl = post.images && post.images.length > 0 
    ? (post.images[0].startsWith('http') ? post.images[0] : `${baseUrl}${post.images[0]}`)
    : `${baseUrl}/assets/images/og-image.png`

  return {
    title,
    description,
    keywords: [
      '넥소 전칠판',
      boardInfo?.label || '전칠판',
      '전자칠판',
      '학원 운영',
      '교육 정보',
    ],
    openGraph: {
      title,
      description,
      url: currentUrl,
      siteName: 'NEXO Daily',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      type: 'article',
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: currentUrl,
    },
  }
}


