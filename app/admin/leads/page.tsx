import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'
import { LeadsList } from '@/components/admin/leads-list'

type UserRow = Database['public']['Tables']['users']['Row']
type LeadRow = Database['public']['Tables']['leads']['Row']

export default async function AdminLeadsPage() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) redirect('/login')

  const { data: profileData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const profile = profileData as Pick<UserRow, 'role'> | null
  if (profile?.role !== 'admin') redirect('/')

  const { data: leadsData, error: leadsError } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (leadsError) console.error('리드 조회 실패:', leadsError)
  const leads = (leadsData || []) as LeadRow[]

  const stats = {
    total: leads.length,
    pending: leads.filter(l => l.status === 'pending').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    completed: leads.filter(l => ['demo_completed', 'quote_completed', 'consultation_completed', 'completed'].includes(l.status)).length,
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-xl font-bold text-slate-900">리드 관리</h1>
          <p className="mt-0.5 text-sm text-slate-500">상담신청 접수 현황을 관리하세요</p>
        </header>

        {/* 간단한 요약 */}
        <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
          <span className="text-slate-600">전체 <strong className="text-slate-900">{stats.total}</strong>건</span>
          <span className="text-slate-400">|</span>
          <span className="text-amber-600">대기중 <strong>{stats.pending}</strong></span>
          <span className="text-slate-400">|</span>
          <span className="text-sky-600">연락완료 <strong>{stats.contacted}</strong></span>
          <span className="text-slate-400">|</span>
          <span className="text-emerald-600">완료 <strong>{stats.completed}</strong></span>
        </div>

        <LeadsList leads={leads} />
      </div>
    </div>
  )
}
