'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface CollapsibleSectionProps {
  title: string
  subtitle?: string
  badge?: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}

export function CollapsibleSection({
  title,
  subtitle,
  badge,
  children,
  defaultOpen = false,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <section className="bg-white border border-gray-200/80 overflow-hidden rounded-lg shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full border-b border-gray-100 bg-slate-50/50 px-4 py-3 flex items-center justify-between gap-2 text-left hover:bg-slate-50/70 transition-colors"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm font-bold text-slate-800">{title}</h2>
            {badge}
          </div>
          {subtitle && (
            <p className="text-slate-500 text-xs mt-0.5">{subtitle}</p>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 shrink-0 text-slate-500" />
        ) : (
          <ChevronDown className="w-4 h-4 shrink-0 text-slate-500" />
        )}
      </button>
      {isOpen && <div className="p-0">{children}</div>}
    </section>
  )
}
