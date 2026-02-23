'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdminMenuProps {
  variant?: 'default' | 'dark'
}

export function AdminMenu({ variant = 'default' }: AdminMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const isDark = variant === 'dark'

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-1',
          isDark
            ? 'text-red-400 hover:text-red-300 hover:bg-slate-600'
            : 'text-red-600 hover:text-red-700 hover:bg-red-50'
        )}
      >
        관리자
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2">
            <Link
              href="/admin/dashboard"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-nexo-navy transition-colors"
            >
              대시보드
            </Link>
            <Link
              href="/admin/insights"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-nexo-navy transition-colors"
            >
              인사이트 관리
            </Link>
            <Link
              href="/admin/crawled-news"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-nexo-navy transition-colors"
            >
              뉴스 관리
            </Link>
            <Link
              href="/admin/field-news"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-nexo-navy transition-colors"
            >
              현장소식 관리
            </Link>
            <Link
              href="/admin/leads"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-nexo-navy transition-colors"
            >
              리드 관리
            </Link>
            <Link
              href="/admin/resources"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-nexo-navy transition-colors"
            >
              자료실 관리
            </Link>
            <Link
              href="/admin/users"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-nexo-navy transition-colors"
            >
              사용자 관리
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

