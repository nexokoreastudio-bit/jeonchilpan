import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getSeminarById } from '@/lib/supabase/seminars'
import { SeminarApplyForm } from '@/components/seminar/seminar-apply-form'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Video, BookOpen, ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'

const FORMAT_LABELS = {
  offline: { label: '오프라인', icon: MapPin },
  online: { label: '온라인', icon: Video },
  vod: { label: 'VOD', icon: BookOpen },
}


interface PageProps {
  params: { id: string }
}

export default async function SeminarDetailPage({ params }: PageProps) {
  const id = parseInt(params.id)
  if (isNaN(id)) notFound()

  const seminar = await getSeminarById(id)
  if (!seminar) notFound()

  const formatInfo = FORMAT_LABELS[seminar.format]
  const FormatIcon = formatInfo.icon

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <Link
          href="/seminar"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-nexo-navy mb-8 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          목록으로
        </Link>

        <article className="border border-gray-200 bg-white">
          <div className="relative aspect-[21/9] w-full overflow-hidden bg-gray-100">
            {seminar.thumbnail_url ? (
              <Image
                src={seminar.thumbnail_url}
                alt={seminar.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-nexo-navy/10 to-gray-100">
                <FormatIcon className="w-24 h-24 text-nexo-navy/30" />
              </div>
            )}
            <div className="absolute bottom-4 left-6 flex gap-2">
              <Badge className="bg-nexo-navy text-white rounded-none">
                [{formatInfo.label}]
              </Badge>
              <Badge
                variant={seminar.status === 'recruiting' ? 'default' : 'secondary'}
                className={
                  seminar.status === 'recruiting'
                    ? 'bg-nexo-cyan text-white rounded-none'
                    : 'rounded-none'
                }
              >
                {seminar.status === 'recruiting' ? '모집중' : seminar.status === 'closed' ? '마감' : '완료'}
              </Badge>
            </div>
          </div>

          <div className="p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {seminar.title}
            </h1>

            {seminar.description && (
              <div className="prose prose-gray max-w-none mb-10">
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {seminar.description}
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-4 mb-10 text-sm">
              {seminar.access_type !== 'free' && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">접근 조건:</span>
                  <span className="text-nexo-navy">
                    {seminar.access_type === 'point'
                      ? `${seminar.point_cost.toLocaleString()} 포인트 또는 골드회원`
                      : '골드회원 전용'}
                  </span>
                </div>
              )}
              {seminar.event_date && (
                <div className="flex items-center gap-2 text-gray-600">
                  {new Date(seminar.event_date).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              )}
              {seminar.location && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  {seminar.location}
                </div>
              )}
            </div>

            {/* 신청하기 섹션 */}
            {seminar.status === 'recruiting' && (
              <div className="pt-10 border-t border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-6">신청하기</h2>
                <SeminarApplyForm seminarId={seminar.id} />
              </div>
            )}

            {seminar.status !== 'recruiting' && (
              <div className="pt-10 border-t border-gray-200">
                <p className="text-gray-500">
                  현재 모집 중이 아닙니다. 다른 세미나를 확인해보세요.
                </p>
                <Link href="/seminar" className="mt-4 inline-block">
                  <Button variant="outline" className="rounded-none">
                    세미나 목록 보기
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const id = parseInt(params.id)
  if (isNaN(id)) return { title: '세미나를 찾을 수 없습니다' }

  const seminar = await getSeminarById(id)
  if (!seminar)
    return { title: '세미나를 찾을 수 없습니다' }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jeonchilpan.netlify.app'

  return {
    title: `${seminar.title} | 세미나 - NEXO Daily`,
    description: seminar.description?.substring(0, 160) || '넥소 세미나',
    openGraph: {
      title: `${seminar.title} | NEXO Daily`,
      description: seminar.description?.substring(0, 160),
      url: `${baseUrl}/seminar/${id}`,
    },
  }
}
