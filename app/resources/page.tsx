import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 120 // 2분 캐시
import { getAllResources } from '@/lib/supabase/resources'
import { FileText, FileSpreadsheet, File, FileImage, Search } from 'lucide-react'
import { DownloadResourceButton } from '@/components/resources/download-button'
import { PageSection } from '@/components/layout/page-section'
import { classifyResourceCategory, RESOURCE_CATEGORY_LABELS, type ResourceCategoryKey } from '@/lib/utils/resource-category'
import type { Metadata } from 'next'
import styles from './resources.module.css'

export const metadata: Metadata = {
  title: '자료실 - 전자칠판 수업자료·학부모 상담 템플릿',
  description: '전자칠판·스마트보드 활용 수업 자료, 학부모 상담 템플릿, 입시 자료를 무료로 다운로드하세요.',
  keywords: ['전자칠판 자료', '스마트보드 수업자료', '학원 상담 템플릿', '입시 자료 다운로드', '수업 설계'],
  openGraph: {
    title: '전칠판 자료실 | 전자칠판 수업 자료 무료 다운로드',
    description: '전자칠판·스마트보드 활용 수업 자료, 학부모 상담 템플릿을 바로 다운로드하세요.',
  },
}

const FILE_TYPE_ICONS = {
  pdf: FileText,
  xlsx: FileSpreadsheet,
  hwp: File,
  docx: FileText,
  pptx: FileImage,
}

const FILE_TYPE_LABELS = {
  pdf: 'PDF',
  xlsx: 'Excel',
  hwp: '한글',
  docx: 'Word',
  pptx: 'PowerPoint',
}

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams?: { category?: string; q?: string }
}) {
  const supabase = await createClient()

  // 현재 사용자 확인
  const { data: { user } } = await supabase.auth.getUser()

  const resources = await getAllResources('bronze', user?.id)
  const selectedCategory = (searchParams?.category || 'all') as 'all' | ResourceCategoryKey
  const query = (searchParams?.q || '').trim()
  const queryLower = query.toLowerCase()

  const resourcesWithCategory = resources.map((resource) => ({
    ...resource,
    derivedCategory: classifyResourceCategory(resource.title, resource.description),
  }))

  const categoryCounts = resourcesWithCategory.reduce<Record<string, number>>((acc, resource) => {
    const key = resource.derivedCategory
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  const filteredByCategory = selectedCategory === 'all'
    ? resourcesWithCategory
    : resourcesWithCategory.filter((resource) => resource.derivedCategory === selectedCategory)

  const filteredResources = queryLower
    ? filteredByCategory.filter((resource) => {
      const haystack = `${resource.title || ''} ${resource.description || ''}`.toLowerCase()
      return haystack.includes(queryLower)
    })
    : filteredByCategory

  const buildCategoryHref = (
    category: 'all' | ResourceCategoryKey,
    options?: { keepQuery?: boolean }
  ) => {
    const params = new URLSearchParams()
    const keepQuery = options?.keepQuery ?? true
    if (category !== 'all') params.set('category', category)
    if (keepQuery && query) params.set('q', query)
    const qs = params.toString()
    return qs ? `/resources?${qs}` : '/resources'
  }

  return (
      <PageSection
        title="📚 자료실"
        subtitle="학원 수업·상담에 활용할 수 있는 입시 자료와 템플릿을 다운로드하세요. 큰 화면에 띄워 보시기 좋게 제작되었습니다."
      >
      {resources.length === 0 ? (
        <div className={styles.empty}>
          <p>아직 등록된 자료가 없습니다.</p>
        </div>
      ) : (
        <>
          <form action="/resources" method="get" className="mb-4">
            {selectedCategory !== 'all' && (
              <input type="hidden" name="category" value={selectedCategory} />
            )}
            <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="자료 제목 또는 설명 검색"
                className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
              />
              <button
                type="submit"
                className="shrink-0 rounded-md bg-nexo-navy px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
              >
                검색
              </button>
              {query && (
                <Link
                  href={buildCategoryHref(selectedCategory, { keepQuery: false })}
                  className="shrink-0 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-400"
                >
                  초기화
                </Link>
              )}
            </div>
          </form>

          <div className="mb-4 flex flex-wrap gap-2">
            <Link
              href={buildCategoryHref('all')}
              className={`px-3 py-1.5 rounded-full text-sm border ${
                selectedCategory === 'all'
                  ? 'bg-nexo-navy text-white border-nexo-navy'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-nexo-navy'
              }`}
            >
              전체 ({resources.length})
            </Link>
            {(Object.keys(RESOURCE_CATEGORY_LABELS) as ResourceCategoryKey[]).map((key) => (
              <Link
                key={key}
                href={buildCategoryHref(key)}
                className={`px-3 py-1.5 rounded-full text-sm border ${
                  selectedCategory === key
                    ? 'bg-nexo-navy text-white border-nexo-navy'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-nexo-navy'
                }`}
              >
                {RESOURCE_CATEGORY_LABELS[key]} ({categoryCounts[key] || 0})
              </Link>
            ))}
          </div>
          {query && (
            <p className="mb-3 text-xs text-slate-500">
              검색어: <span className="font-semibold text-slate-700">{query}</span> · 결과 {filteredResources.length}건
            </p>
          )}
        <div className={styles.resourcesGrid}>
          {filteredResources.length === 0 ? (
            <div className={styles.empty}>
              <p>검색 결과가 없습니다.</p>
            </div>
          ) : filteredResources.map((resource) => {
            const FileIcon = resource.file_type
              ? FILE_TYPE_ICONS[resource.file_type] || File
              : File

            return (
              <div
                key={resource.id}
                className={`${styles.resourceCard} ${
                    ''
                }`}
              >
                <div className={styles.cardBody}>
                  <div className={styles.cardHeader}>
                    <div className={styles.fileType}>
                      <FileIcon className="w-3 h-3" />
                      <span>{resource.file_type ? FILE_TYPE_LABELS[resource.file_type] : '파일'}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 border border-slate-200">
                      {RESOURCE_CATEGORY_LABELS[resource.derivedCategory]}
                    </span>
                  </div>

                  <h2 className={styles.resourceTitle}>{resource.title}</h2>
                  {resource.description && (
                    <p className={styles.resourceDescription}>{resource.description}</p>
                  )}
                  <div className={styles.rowMeta}>
                    <span className={styles.downloads}>
                      {resource.downloads_count.toLocaleString()}회 다운로드
                    </span>
                  </div>
                </div>
                <div className={styles.cardFooter}>
                  {user ? (
                    <DownloadResourceButton
                      resourceId={resource.id}
                      hasDownloaded={resource.hasDownloaded}
                      compact
                      className="min-w-[112px]"
                    />
                  ) : (
                    <Link
                      href="/login?redirect=/resources"
                      className="inline-flex items-center justify-center gap-2 min-w-[112px] h-9 px-3 text-sm font-medium rounded-md bg-nexo-navy text-white hover:opacity-90 transition-opacity"
                    >
                      <FileText className="w-4 h-4" />
                      로그인 후 다운로드
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        </>
      )}
      </PageSection>
  )
}
