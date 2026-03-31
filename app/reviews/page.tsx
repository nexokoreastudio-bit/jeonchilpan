import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getBestReviews, getReviews, getAverageRating, getRatingStats } from '@/lib/supabase/reviews'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Star, Award, CheckCircle2, TrendingUp, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { Metadata } from 'next'
import { JsonLd } from '@/components/seo/json-ld'
import styles from './reviews.module.css'

export const metadata: Metadata = {
  title: '고객 후기 | NEXO Daily',
  description: '넥소 전자칠판을 사용하시는 고객님들의 생생한 후기를 확인하세요. 실제 사용자들의 솔직한 후기와 평점을 확인할 수 있습니다.',
  keywords: [
    '넥소 후기',
    '전자칠판 후기',
    '전자칠판 사용 후기',
    '학원 전자칠판 후기',
    '스마트보드 후기',
  ],
  openGraph: {
    title: '고객 후기 | NEXO Daily',
    description: '넥소 전자칠판을 사용하시는 고객님들의 생생한 후기를 확인하세요.',
    type: 'website',
  },
}

interface PageProps {
  searchParams: {
    sort?: 'rating' | 'latest' | 'popular'
  }
}

export default async function ReviewsPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const sortBy = searchParams.sort || 'latest'
  const bestReviews = await getBestReviews(3)
  const reviews = await getReviews(sortBy, 20, 0)
  const averageRating = await getAverageRating()
  const ratingStats = await getRatingStats()

  const totalReviews = Object.values(ratingStats).reduce((sum, count) => sum + count, 0)

  // 리뷰 5개 미만이면 현장소식 페이지로 리다이렉트 (빈 리뷰 페이지 역효과 방지)
  if (totalReviews < 5) {
    redirect('/field')
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jeonchilpan.netlify.app'
  
  // 구조화된 데이터 (AggregateRating 및 Review 스키마)
  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: '넥소 전자칠판',
    description: '넥소 전자칠판 사용자들의 후기',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: averageRating > 0 ? averageRating.toFixed(1) : '0',
      reviewCount: totalReviews,
      bestRating: '5',
      worstRating: '1',
    },
    review: reviews.slice(0, 10).filter(review => review.rating).map((review) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.author?.nickname || '익명',
      },
      datePublished: review.created_at,
      reviewBody: review.content?.replace(/<[^>]*>/g, '').substring(0, 500) || '',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating?.toString() || '0',
        bestRating: '5',
        worstRating: '1',
      },
    })),
  }

  return (
    <>
      <JsonLd data={jsonLdData} />
      <div className="space-y-6">
        {/* 헤더 섹션 */}
        <section className="bg-white border border-gray-200/80 overflow-hidden rounded-lg shadow-sm">
          <div className="border-b border-gray-100 bg-slate-50/50 px-4 py-3">
            <h1 className="text-sm font-bold text-slate-800">⭐ 고객 후기</h1>
            <p className="text-slate-500 text-xs mt-0.5">
              학원 수업 환경을 개선하신 원장님·강사님들의 실제 후기를 확인하세요
            </p>
          </div>
        </section>

        {/* 평점 통계 */}
        <section className="bg-white border border-gray-200/80 overflow-hidden rounded-lg shadow-sm">
        <Card className="mb-0 border-0 shadow-none rounded-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" />
              전체 평점 통계
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-nexo-cyan mb-2">
                  {averageRating > 0 ? averageRating.toFixed(1) : '-'}
                </div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-6 h-6 ${
                        star <= Math.round(averageRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  총 {totalReviews}개의 후기
                </p>
              </div>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = ratingStats[rating] || 0
                  const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
                  return (
                    <div key={rating} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-20">
                        <span className="text-sm font-semibold">{rating}점</span>
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {count}개
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
        </section>

        {/* 베스트 후기 */}
        {bestReviews.length > 0 && (
          <section className="bg-white border border-gray-200/80 overflow-hidden rounded-lg shadow-sm p-4 md:p-5">
            <div className="border-b border-gray-100 bg-slate-50/50 -mx-4 -mt-4 md:-mx-5 md:-mt-5 px-4 py-3 md:px-5 md:pt-4 md:pb-3 mb-4">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                베스트 후기
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {bestReviews.map((review) => (
                <Card key={review.id} className="border border-gray-200/80 shadow-sm">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {review.rating && (
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.rating!
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <Badge className="bg-yellow-500 text-white">베스트</Badge>
                    </div>
                    <CardTitle className="text-lg">{review.title}</CardTitle>
                    <CardDescription>
                      {review.author?.nickname || '익명'} ·{' '}
                      {format(new Date(review.created_at), 'yyyy.MM.dd', { locale: ko })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                      {review.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                    </p>
                    <Link href={`/community/${review.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        자세히 보기
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* 전체 후기 목록 */}
        <section className="bg-white border border-gray-200/80 overflow-hidden rounded-lg shadow-sm p-4 md:p-5">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-2">
            <Link href="/reviews?sort=latest">
              <Button
                variant={sortBy === 'latest' ? 'default' : 'outline'}
                size="sm"
              >
                <Clock className="w-4 h-4 mr-1" />
                최신순
              </Button>
            </Link>
            <Link href="/reviews?sort=rating">
              <Button
                variant={sortBy === 'rating' ? 'default' : 'outline'}
                size="sm"
              >
                <Star className="w-4 h-4 mr-1" />
                평점순
              </Button>
            </Link>
            <Link href="/reviews?sort=popular">
              <Button
                variant={sortBy === 'popular' ? 'default' : 'outline'}
                size="sm"
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                인기순
              </Button>
            </Link>
          </div>
          {user && (
            <Link href="/community/write?type=review">
              <Button className="bg-nexo-navy hover:bg-nexo-navy/90">
                ✍️ 후기 작성하기
              </Button>
            </Link>
          )}
        </div>

        {/* 후기 목록 */}
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 mb-4">아직 후기가 없습니다.</p>
              {user && (
                <Link href="/community/write?type=review">
                  <Button>첫 후기 작성하기</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {review.is_best && (
                          <Badge className="bg-yellow-500 text-white">베스트</Badge>
                        )}
                        {review.is_verified_review && (
                          <Badge className="bg-green-500 text-white flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            구매 인증
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl mb-2">{review.title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{review.author?.nickname || '익명'}</span>
                        <span>
                          {format(new Date(review.created_at), 'yyyy.MM.dd HH:mm', {
                            locale: ko,
                          })}
                        </span>
                        {review.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{review.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4 line-clamp-3">
                    {review.content.replace(/<[^>]*>/g, '')}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>👍 {review.likes_count}</span>
                      <span>💬 {review.comments_count}</span>
                      {review.images && review.images.length > 0 && (
                        <span>📷 {review.images.length}</span>
                      )}
                    </div>
                    <Link href={`/community/${review.id}`}>
                      <Button variant="outline" size="sm">
                        자세히 보기
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </section>
      </div>
    </>
  )
}

