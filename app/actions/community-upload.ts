'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp']
const DOCUMENT_EXTENSIONS = ['pdf', 'pptx', 'docx', 'xlsx', 'hwp']
const ALLOWED_EXTENSIONS = [...IMAGE_EXTENSIONS, ...DOCUMENT_EXTENSIONS]

const CONTENT_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  pdf: 'application/pdf',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  hwp: 'application/x-hwp',
}

const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_DOCUMENT_SIZE = 20 * 1024 * 1024 // 20MB

/**
 * 공유자료실 게시글용 파일 업로드 (인증된 사용자)
 * 이미지: jpg, png, gif, webp | 문서: pdf, pptx, docx, xlsx, hwp
 */
export async function uploadCommunityMaterial(
  fileData: {
    arrayBuffer: number[]
    fileName: string
  }
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    const ext = fileData.fileName.split('.').pop()?.toLowerCase()
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      return {
        success: false,
        error: `지원 형식: 이미지(${IMAGE_EXTENSIONS.join(', ')}), 문서(${DOCUMENT_EXTENSIONS.join(', ')})`,
      }
    }

    const buffer = Buffer.from(fileData.arrayBuffer)
    const maxSize = IMAGE_EXTENSIONS.includes(ext) ? MAX_IMAGE_SIZE : MAX_DOCUMENT_SIZE
    if (buffer.length > maxSize) {
      const maxMB = maxSize / (1024 * 1024)
      return {
        success: false,
        error: `파일 크기는 ${maxMB}MB 이하여야 합니다.`,
      }
    }

    const timestamp = Date.now()
    const randomStr = randomBytes(8).toString('hex')
    const sanitizedName = fileData.fileName
      .replace(/[^a-zA-Z0-9가-힣._-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    const storagePath = `materials/${user.id}/${timestamp}-${randomStr}-${sanitizedName}`

    const adminSupabase = await createAdminClient()
    const contentType = CONTENT_TYPES[ext] || 'application/octet-stream'

    const { error: uploadError } = await adminSupabase.storage
      .from('community-materials')
      .upload(storagePath, buffer, {
        contentType,
        upsert: false,
      })

    if (uploadError) {
      if (uploadError.message?.includes('Bucket not found')) {
        return {
          success: false,
          error: '파일 저장소가 준비되지 않았습니다. 관리자에게 문의하세요.',
        }
      }
      console.error('공유자료실 업로드 실패:', uploadError)
      return {
        success: false,
        error: uploadError.message || '파일 업로드에 실패했습니다.',
      }
    }

    const { data: urlData } = adminSupabase.storage
      .from('community-materials')
      .getPublicUrl(storagePath)

    return {
      success: true,
      url: urlData?.publicUrl || '',
    }
  } catch (error: any) {
    console.error('공유자료실 업로드 오류:', error)
    return {
      success: false,
      error: error?.message || '파일 업로드 중 오류가 발생했습니다.',
    }
  }
}
