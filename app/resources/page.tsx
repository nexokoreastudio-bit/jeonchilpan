import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAllResources } from '@/lib/supabase/resources'
import { FileText, FileSpreadsheet, File, FileImage } from 'lucide-react'
import { DownloadResourceButton } from '@/components/resources/download-button'
import { SafeImage } from '@/components/safe-image'
import { PageSection } from '@/components/layout/page-section'
import styles from './resources.module.css'

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

export default async function ResourcesPage() {
  const supabase = await createClient()

  // 현재 사용자 확인
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const resources = await getAllResources('bronze', user.id)

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
        <div className={styles.resourcesGrid}>
          {resources.map((resource) => {
            const FileIcon = resource.file_type
              ? FILE_TYPE_ICONS[resource.file_type] || File
              : File

            const thumbnailUrl = (resource as any).thumbnail_url

            return (
              <div
                key={resource.id}
                className={`${styles.resourceCard} ${
                    ''
                }`}
              >
                {/* 썸네일 이미지 */}
                <div className={styles.thumbnailContainer}>
                  {thumbnailUrl ? (
                    <SafeImage
                      src={thumbnailUrl}
                      alt={resource.title}
                      className={styles.thumbnail}
                      fill
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                      <FileIcon className="w-12 h-12" />
                    </div>
                  )}
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.cardHeader}>
                    <div className={styles.fileType}>
                      <FileIcon className="w-3 h-3" />
                      <span>{resource.file_type ? FILE_TYPE_LABELS[resource.file_type] : '파일'}</span>
                    </div>
                  </div>

                  <h2 className={styles.resourceTitle}>{resource.title}</h2>
                  {resource.description && (
                    <p className={styles.resourceDescription}>{resource.description}</p>
                  )}

                  <div className={styles.cardFooter}>
                    <div className={styles.resourceMeta}>
                      <span className={styles.downloads}>
                        {resource.downloads_count.toLocaleString()}회 다운로드
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <DownloadResourceButton
                        resourceId={resource.id}
                        hasDownloaded={resource.hasDownloaded}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      </PageSection>
  )
}

