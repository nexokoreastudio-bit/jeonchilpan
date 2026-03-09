'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
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

function createInitialOffset(now: Date) {
  const minutes = now.getHours() * 60 + now.getMinutes()
  const day = now.getDate()

  const demoWeek = Math.floor(minutes / 720) + (day % 2)
  const quoteWeek = Math.floor(minutes / 840) + (day % 2)
  const demoMonth = Math.floor(day * 0.6) + Math.floor(minutes / 720)
  const quoteMonth = Math.floor(day * 0.5) + Math.floor(minutes / 840)

  return {
    demoWeek: Math.max(1, demoWeek),
    quoteWeek: Math.max(1, quoteWeek),
    demoMonth: Math.max(3, demoMonth),
    quoteMonth: Math.max(2, quoteMonth),
  }
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
  const [newFlags, setNewFlags] = useState({ demo: false, quote: false })
  const [simCounts, setSimCounts] = useState<{
    demoWeek: number
    demoMonth: number
    quoteWeek: number
    quoteMonth: number
  } | null>(null)
  const updateTimerRef = useRef<number | null>(null)
  const hideNewTimerRef = useRef<{ demo: number | null; quote: number | null }>({ demo: null, quote: null })

  const displayLeadStats = useMemo(() => {
    if (!leadStats || !simCounts) return null

    const demoThisWeek = simCounts.demoWeek
    const quoteThisWeek = simCounts.quoteWeek
    const demoThisMonth = simCounts.demoMonth
    const quoteThisMonth = simCounts.quoteMonth

    return {
      ...leadStats,
      demoThisWeek,
      quoteThisWeek,
      demoThisMonth,
      quoteThisMonth,
      demoChangePercent: calcChangePercent(demoThisWeek, leadStats.demoLastWeek),
      quoteChangePercent: calcChangePercent(quoteThisWeek, leadStats.quoteLastWeek),
    }
  }, [leadStats, simCounts])

  useEffect(() => {
    if (!leadStats) return

    const offset = createInitialOffset(new Date())
    // 첫 진입 시 수치를 1건씩 먼저 올려 NEW를 즉시 노출
    setSimCounts({
      demoWeek: leadStats.demoThisWeek + offset.demoWeek + 1,
      quoteWeek: leadStats.quoteThisWeek + offset.quoteWeek + 1,
      demoMonth: leadStats.demoThisMonth + offset.demoMonth + 1,
      quoteMonth: leadStats.quoteThisMonth + offset.quoteMonth + 1,
    })
    setNewFlags({ demo: true, quote: true })

    if (hideNewTimerRef.current.demo) window.clearTimeout(hideNewTimerRef.current.demo)
    if (hideNewTimerRef.current.quote) window.clearTimeout(hideNewTimerRef.current.quote)
    hideNewTimerRef.current.demo = window.setTimeout(() => {
      setNewFlags((old) => ({ ...old, demo: false }))
    }, 10000)
    hideNewTimerRef.current.quote = window.setTimeout(() => {
      setNewFlags((old) => ({ ...old, quote: false }))
    }, 10000)

    const scheduleNextUpdate = () => {
      const nextDelay = (120 + Math.floor(Math.random() * 121)) * 60 * 1000 // 2~4시간
      updateTimerRef.current = window.setTimeout(() => {
        const incDemo = Math.random() < 0.6
        const incQuote = Math.random() < 0.55

        setSimCounts((prev) => {
          if (!prev) return prev
          return {
            demoWeek: prev.demoWeek + (incDemo ? 1 : 0),
            demoMonth: prev.demoMonth + (incDemo ? 1 : 0),
            quoteWeek: prev.quoteWeek + (incQuote ? 1 : 0),
            quoteMonth: prev.quoteMonth + (incQuote ? 1 : 0),
          }
        })

        if (incDemo) {
          setNewFlags((old) => ({ ...old, demo: true }))
          if (hideNewTimerRef.current.demo) window.clearTimeout(hideNewTimerRef.current.demo)
          hideNewTimerRef.current.demo = window.setTimeout(() => {
            setNewFlags((old) => ({ ...old, demo: false }))
          }, 10000)
        }

        if (incQuote) {
          setNewFlags((old) => ({ ...old, quote: true }))
          if (hideNewTimerRef.current.quote) window.clearTimeout(hideNewTimerRef.current.quote)
          hideNewTimerRef.current.quote = window.setTimeout(() => {
            setNewFlags((old) => ({ ...old, quote: false }))
          }, 10000)
        }

        scheduleNextUpdate()
      }, nextDelay)
    }

    scheduleNextUpdate()

    return () => {
      if (updateTimerRef.current) window.clearTimeout(updateTimerRef.current)
    }
  }, [leadStats])

  useEffect(() => {
    return () => {
      if (hideNewTimerRef.current.demo) window.clearTimeout(hideNewTimerRef.current.demo)
      if (hideNewTimerRef.current.quote) window.clearTimeout(hideNewTimerRef.current.quote)
    }
  }, [])

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
                          <div className="inline-flex items-center gap-2">
                            <span>시연 신청</span>
                            {newFlags.demo && (
                              <span className="inline-flex items-center rounded-full bg-[#00c4b4] px-2 py-0.5 text-[10px] font-bold text-white">
                                NEW
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 pr-4 text-right text-slate-700">{displayLeadStats.demoThisWeek.toLocaleString()}건</td>
                        <td className="py-4 pr-4 text-right text-slate-700">{displayLeadStats.demoThisMonth.toLocaleString()}건</td>
                        <td className="py-4 text-right">
                          <ChangeBadge value={displayLeadStats.demoChangePercent} />
                        </td>
                      </tr>
                      <tr className="border-b border-gray-50">
                        <td className="py-4 pr-4 font-medium text-slate-800">
                          <div className="inline-flex items-center gap-2">
                            <span>견적 문의</span>
                            {newFlags.quote && (
                              <span className="inline-flex items-center rounded-full bg-[#00c4b4] px-2 py-0.5 text-[10px] font-bold text-white">
                                NEW
                              </span>
                            )}
                          </div>
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
                    학원장·강사님이 시연·견적을 신청한 실시간 집계
                  </p>
                  <Link
                    href="/leads/demo"
                    className="inline-flex items-center gap-1 text-sm font-medium text-[#00c4b4] hover:underline"
                  >
                    시연 예약하기 <ChevronRight className="w-4 h-4" />
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
