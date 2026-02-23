import { MaterialCard } from './material-card'
import type { DigitalMaterialWithAuthor } from '@/lib/supabase/digital-materials'

interface MaterialListProps {
  materials: DigitalMaterialWithAuthor[]
  purchasedIds?: Set<number>
  currentUserId?: string | null
}

export function MaterialList({ materials, purchasedIds = new Set(), currentUserId }: MaterialListProps) {
  if (materials.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p>등록된 자료가 없습니다.</p>
        <p className="text-sm mt-2">첫 번째로 자료를 공유해보세요!</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {materials.map((m) => (
        <MaterialCard
          key={m.id}
          id={m.id}
          title={m.title}
          description={m.description}
          subjectCategory={m.subject_category}
          price={m.price}
          downloadsCount={m.downloads_count}
          authorNickname={(m.author as { nickname?: string } | null)?.nickname ?? null}
          purchased={purchasedIds.has(m.id) || (m as any).purchased}
          isAuthor={currentUserId === m.author_id}
        />
      ))}
    </div>
  )
}
