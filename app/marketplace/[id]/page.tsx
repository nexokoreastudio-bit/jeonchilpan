import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getDigitalMaterialById } from '@/lib/supabase/digital-materials'
import { PurchaseButton } from '@/components/marketplace/purchase-button'
import { FileText, Coins, ArrowLeft } from 'lucide-react'

interface PageProps {
  params: { id: string }
}

export default async function MarketplaceDetailPage({ params }: PageProps) {
  const id = parseInt(params.id, 10)
  if (isNaN(id)) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const material = await getDigitalMaterialById(id, user?.id)
  if (!material) notFound()

  const isAuthor = user?.id === material.author_id
  const canDownload = material.price === 0 || (material as any).purchased || isAuthor

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          목록으로
        </Link>

        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-[#00c4b4]/10 flex items-center justify-center">
              <FileText className="w-8 h-8 text-[#00c4b4]" />
            </div>
            <div className="flex-1 min-w-0">
              {material.subject_category && (
                <span className="inline-block px-2 py-1 text-xs rounded bg-gray-100 text-gray-600 mb-2">
                  {material.subject_category}
                </span>
              )}
              <h1 className="text-2xl font-bold text-gray-900 mb-3">{material.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <Coins className="w-4 h-4 text-amber-500" />
                  {material.price === 0 ? '무료' : `${material.price}P`}
                </span>
                <span>다운로드 {material.downloads_count}회</span>
                <span>{(material.author as { nickname?: string } | null)?.nickname ?? '익명'}</span>
              </div>
              {material.description && (
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {material.description}
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            {canDownload ? (
              <a
                href={material.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#00c4b4] text-white font-semibold hover:bg-[#00a396] transition-colors"
              >
                다운로드
              </a>
            ) : user ? (
              <PurchaseButton materialId={material.id} price={material.price} />
            ) : (
              <Link
                href={`/login?redirect=/marketplace/${id}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#1a1a1a] text-white font-semibold hover:bg-[#00c4b4] transition-colors"
              >
                로그인 후 구매하기
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
