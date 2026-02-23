import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'
import { LeadsList } from '@/components/admin/leads-list'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

type UserRow = Database['public']['Tables']['users']['Row']
type LeadRow = Database['public']['Tables']['leads']['Row']

export default async function AdminLeadsPage() {
  const supabase = await createClient()

  // 현재 사용자 확인
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // 관리자 권한 확인
  const { data: profileData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const profile = profileData as Pick<UserRow, 'role'> | null

  if (profile?.role !== 'admin') {
    redirect('/')
  }

  // 리드 목록 가져오기
  const { data: leadsData, error: leadsError } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (leadsError) {
    console.error('리드 조회 실패:', leadsError)
  }

  const leads = (leadsData || []) as LeadRow[]

  // 통계 계산
  const stats = {
    total: leads.length,
    pending: leads.filter(l => l.status === 'pending').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    completed: leads.filter(l => l.status === 'completed').length,
    demo: leads.filter(l => l.type === 'demo').length,
    quote: leads.filter(l => l.type === 'quote').length,
    chatbot: leads.filter(l => l.type === 'chatbot_consultation').length,
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">리드 관리</h1>
          <p className="text-gray-600">상담 신청 및 견적 요청을 관리하세요</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600 mb-1">전체</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-4">
            <div className="text-sm text-yellow-600 mb-1">대기중</div>
            <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-4">
            <div className="text-sm text-blue-600 mb-1">연락완료</div>
            <div className="text-2xl font-bold text-blue-700">{stats.contacted}</div>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-4">
            <div className="text-sm text-green-600 mb-1">완료</div>
            <div className="text-2xl font-bold text-green-700">{stats.completed}</div>
          </div>
          <div className="bg-purple-50 rounded-lg shadow p-4">
            <div className="text-sm text-purple-600 mb-1">시연 신청</div>
            <div className="text-2xl font-bold text-purple-700">{stats.demo}</div>
          </div>
          <div className="bg-orange-50 rounded-lg shadow p-4">
            <div className="text-sm text-orange-600 mb-1">견적 요청</div>
            <div className="text-2xl font-bold text-orange-700">{stats.quote}</div>
          </div>
          <div className="bg-teal-50 rounded-lg shadow p-4">
            <div className="text-sm text-teal-600 mb-1">챗봇 상담</div>
            <div className="text-2xl font-bold text-teal-700">{stats.chatbot}</div>
          </div>
        </div>

        {/* 리드 목록 */}
        <LeadsList leads={leads} />
      </div>
    </div>
  )
}

