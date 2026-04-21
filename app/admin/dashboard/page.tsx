import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatsOverview } from '@/components/admin/stats-overview'
import { UserGrowthChart } from '@/components/admin/user-growth-chart'
import { PostActivityChart } from '@/components/admin/post-activity-chart'
import { ReviewRatingChart } from '@/components/admin/review-rating-chart'
import { LeadStatsChart } from '@/components/admin/lead-stats-chart'
import { getAuditLogs } from '@/lib/actions/audit'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

type UserRow = Database['public']['Tables']['users']['Row']

export const metadata = {
  title: '관리자 대시보드 | NEXO Daily',
  description: 'NEXO Daily 플랫폼 통계 및 분석 대시보드',
}

export default async function AdminDashboardPage() {
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

  // 최근 감사 로그
  const { logs: auditLogs } = await getAuditLogs({ limit: 10 })

  const ACTION_LABELS: Record<string, string> = {
    'lead.status_update': '리드 상태 변경',
    'post.pin': '게시글 고정',
    'post.unpin': '게시글 고정 해제',
    'post.delete': '게시글 삭제',
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📊 관리자 대시보드
          </h1>
          <p className="text-gray-600">
            NEXO Daily 플랫폼의 통계 및 분석 데이터를 확인하세요
          </p>
        </div>

        {/* 통계 개요 */}
        <StatsOverview />

        {/* 차트 그리드 */}
        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          {/* 사용자 증가 추이 */}
          <Card>
            <CardHeader>
              <CardTitle>사용자 증가 추이</CardTitle>
              <CardDescription>최근 30일간 가입자 수</CardDescription>
            </CardHeader>
            <CardContent>
              <UserGrowthChart />
            </CardContent>
          </Card>

          {/* 게시글 활동 */}
          <Card>
            <CardHeader>
              <CardTitle>게시글 활동</CardTitle>
              <CardDescription>최근 30일간 게시글 작성 수</CardDescription>
            </CardHeader>
            <CardContent>
              <PostActivityChart />
            </CardContent>
          </Card>

          {/* 후기 평점 분포 */}
          <Card>
            <CardHeader>
              <CardTitle>후기 평점 분포</CardTitle>
              <CardDescription>고객 후기 평점 통계</CardDescription>
            </CardHeader>
            <CardContent>
              <ReviewRatingChart />
            </CardContent>
          </Card>

          {/* 리드 통계 */}
          <Card>
            <CardHeader>
              <CardTitle>리드 통계</CardTitle>
              <CardDescription>상담/견적 신청 현황</CardDescription>
            </CardHeader>
            <CardContent>
              <LeadStatsChart />
            </CardContent>
          </Card>
        </div>

        {/* 최근 운영 로그 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>최근 운영 로그</CardTitle>
            <CardDescription>관리자 액션 감사 이력</CardDescription>
          </CardHeader>
          <CardContent>
            {auditLogs.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">기록된 로그가 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {auditLogs.map((log: any) => (
                  <div key={log.id} className="flex items-center gap-3 text-sm py-2 border-b border-gray-100 last:border-0">
                    <span className="text-xs text-gray-400 tabular-nums shrink-0">
                      {format(new Date(log.created_at), 'MM.dd HH:mm', { locale: ko })}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                      {ACTION_LABELS[log.action] || log.action}
                    </span>
                    <span className="text-gray-600 truncate">
                      {log.admin_email?.split('@')[0] || '관리자'}
                    </span>
                    {log.target_type && (
                      <span className="text-gray-400 text-xs">
                        #{log.target_id}
                      </span>
                    )}
                    {log.detail?.status && (
                      <span className="text-xs text-gray-500">
                        → {log.detail.status}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
