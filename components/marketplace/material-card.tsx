import Link from 'next/link'
import { FileText, Coins } from 'lucide-react'

interface MaterialCardProps {
  id: number
  title: string
  description: string | null
  subjectCategory: string | null
  price: number
  downloadsCount: number
  authorNickname: string | null
  purchased?: boolean
  isAuthor?: boolean
}

export function MaterialCard({
  id,
  title,
  description,
  subjectCategory,
  price,
  downloadsCount,
  authorNickname,
  purchased,
  isAuthor,
}: MaterialCardProps) {
  return (
    <Link
      href={`/marketplace/${id}`}
      className="block p-6 bg-white border border-gray-200 rounded-xl hover:border-[#00c4b4] transition-colors"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#00c4b4]/10 flex items-center justify-center">
          <FileText className="w-6 h-6 text-[#00c4b4]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {subjectCategory && (
              <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                {subjectCategory}
              </span>
            )}
            {isAuthor && (
              <span className="text-xs px-2 py-0.5 rounded bg-[#00c4b4]/10 text-[#00c4b4]">내 자료</span>
            )}
            {purchased && (
              <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">구매완료</span>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500 line-clamp-2 mb-3">{description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Coins className="w-4 h-4 text-amber-500" />
              {price === 0 ? '무료' : `${price}P`}
            </span>
            <span>다운로드 {downloadsCount}회</span>
            <span>{authorNickname || '익명'}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
