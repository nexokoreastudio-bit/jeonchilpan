'use client'

import { useState } from 'react'
import { Download, Check } from 'lucide-react'
import { downloadResource } from '@/app/actions/resources'
import { Button } from '@/components/ui/button'

interface DownloadResourceButtonProps {
  resourceId: number
  hasDownloaded: boolean
}

/**
 * 자료 다운로드 버튼 (초현실: 전부 무료)
 */
export function DownloadResourceButton({
  resourceId,
  hasDownloaded,
}: DownloadResourceButtonProps) {
  const [loading, setLoading] = useState(false)
  const [downloaded, setDownloaded] = useState(hasDownloaded)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async () => {
    if (downloaded) {
      const result = await downloadResource(resourceId)
      if (result.success && result.fileUrl) {
        window.open(result.fileUrl, '_blank')
      }
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await downloadResource(resourceId)

      if (result.success && result.fileUrl) {
        setDownloaded(true)
        window.open(result.fileUrl, '_blank')
        setTimeout(() => window.location.reload(), 800)
      } else {
        setError(result.error || '다운로드에 실패했습니다.')
      }
    } catch (err: any) {
      setError(err.message || '다운로드 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      {error && (
        <div className="mb-2 p-2 bg-red-50 text-red-600 text-sm rounded border border-red-200">
          {error}
        </div>
      )}
      <Button
        onClick={handleDownload}
        disabled={loading}
        className={`w-full ${
          downloaded ? 'bg-green-600 hover:bg-green-700' : 'bg-nexo-navy hover:bg-nexo-cyan'
        }`}
      >
        {loading ? (
          <>로딩 중...</>
        ) : downloaded ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            다시 다운로드
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            다운로드
          </>
        )}
      </Button>
    </div>
  )
}
