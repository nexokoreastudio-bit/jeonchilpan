import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MaterialUploadForm } from '@/components/marketplace/material-upload-form'

export default async function MarketplaceUploadPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/marketplace/upload')
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">자료 등록하기</h1>
        <p className="text-gray-500 mb-8">
          수업·상담에 활용한 자료를 포인트로 나눠보세요. 파일을 드라이브 등에 업로드한 뒤 링크를 입력할 수 있습니다.
        </p>
        <MaterialUploadForm userId={user.id} />
      </div>
    </div>
  )
}
