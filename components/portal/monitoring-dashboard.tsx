'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TrendingUp, TrendingDown, ChevronRight } from 'lucide-react'
import type { PortalLeadStats, PortalEngagementStats } from '@/lib/supabase/portal'

const TABS = [
  { key: 'leads', label: '문의 현황' },
  { key: 'engagement', label: '후기·전칠판' },
] as const

type TabKey = (typeof TABS)[number]['key']

interface MonitoringDashboardProps {
  leadStats: PortalLeadStats | null
  engagementStats: PortalEngagementStats
}

function calcChangePercent(current: number, last: number): number {
  if (last === 0) return current > 0 ? 100 : 0
  return Math.round(((current - last) / last) * 100)
}

function ChangeBadge({ value }: { value: number }) {
  if (value === 0) {
    return <span className="text-gray-500 text-xs">0%</span>
  }
  const isUp = value > 0
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
        isUp ? 'text-emerald-600' : 'text-red-600'
      }`}
    >
      {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
      {isUp ? '+' : ''}
      {value}%
    </span>
  )
}

export function MonitoringDashboard({ leadStats, engagementStats }: MonitoringDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('leads')
  const displayLeadStats = leadStats
    ? {
        ...leadStats,
        demoChangePercent: calcChangePercent(leadStats.demoThisWeek, leadStats.demoLastWeek),
        quoteChangePercent: calcChangePercent(leadStats.quoteThisWeek, leadStats.quoteLastWeek),
      }
    : null

  return (
    <div>
      <div className="border-b border-gray-100">
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === tab.key
                  ? 'bg-white text-[#00c4b4] border-[#00c4b4]'
                  : 'bg-slate-50/30 text-slate-600 hover:text-slate-800 hover:bg-slate-50/60 border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5">
        {activeTab === 'leads' && (
          <div className="space-y-4">
            {displayLeadStats ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-left text-slate-500 font-medium">
                        <th className="py-2 pr-4">구분</th>
                        <th className="py-2 pr-4 text-right">이번 주</th>
                        <th className="py-2 pr-4 text-right">이번 달</th>
                        <th className="py-2 text-right">전주 대비</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-50">
                        <td className="py-4 pr-4 font-medium text-slate-800">
                          <span>상담 신청(시연)</span>
                        </td>
                        <td className="py-4 pr-4 text-right text-slate-700">{displayLeadStats.demoThisWeek.toLocaleString()}건</td>
                        <td className="py-4 pr-4 text-right text-slate-700">{displayLeadStats.demoThisMonth.toLocaleString()}건</td>
                        <td className="py-4 text-right">
                          <ChangeBadge value={displayLeadStats.demoChangePercent} />
                        </td>
                      </tr>
                      <tr className="border-b border-gray-50">
                        <td className="py-4 pr-4 font-medium text-slate-800">
                          <span>상담 신청(견적)</span>
                        </td>
                        <td className="py-4 pr-4 text-right text-slate-700">{displayLeadStats.quoteThisWeek.toLocaleString()}건</td>
                        <td className="py-4 pr-4 text-right text-slate-700">{displayLeadStats.quoteThisMonth.toLocaleString()}건</td>
                        <td className="py-4 text-right">
                          <ChangeBadge value={displayLeadStats.quoteChangePercent} />
                        </td>
                      </tr>
                      {displayLeadStats.consultationThisMonth > 0 && (
                        <tr>
                          <td className="py-4 pr-4 font-medium text-slate-800">상담 신청</td>
                          <td className="py-3 pr-4 text-right">-</td>
                          <td className="py-3 pr-4 text-right">{displayLeadStats.consultationThisMonth.toLocaleString()}건</td>
                          <td className="py-3 text-right">-</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between pt-3">
                  <p className="text-xs text-slate-500">
                    학원장·강사님의 상담신청 실데이터 집계
                  </p>
                  <Link
                    href="/leads/consultation"
                    className="inline-flex items-center gap-1 text-sm font-medium text-[#00c4b4] hover:underline"
                  >
                    상담신청 바로가기 <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </>
            ) : (
              <p className="py-10 text-center text-slate-500 text-sm">
                문의 현황을 불러오는 중입니다.
              </p>
            )}
          </div>
        )}

        {activeTab === 'engagement' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50/50 border border-gray-100 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">고객 후기</p>
                <p className="text-lg font-bold text-slate-800">{engagementStats.reviewCount.toLocaleString()}건</p>
                {engagementStats.reviewCount > 0 && (
                  <p className="text-sm text-amber-600 font-medium">
                    ★ {engagementStats.avgRating}
                  </p>
                )}
              </div>
              <div className="p-4 bg-slate-50/50 border border-gray-100 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">이번 주 전칠판</p>
                <p className="text-lg font-bold text-slate-800">
                  {engagementStats.postsThisWeek}글 · {engagementStats.commentsThisWeek}댓글
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3">
              <p className="text-xs text-slate-500">
                실제 사용자들의 후기와 활동
              </p>
              <Link
                href="/reviews"
                className="inline-flex items-center gap-1 text-sm font-medium text-[#00c4b4] hover:underline"
              >
                후기 보기 <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
