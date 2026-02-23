/**
 * 공유자료실에 PDF 자료 업로드 및 게시글 등록
 * - 관리자 계정으로 작성
 * - 다운로드 가능하도록 community-materials 버킷에 업로드
 *
 * 실행: npx tsx scripts/upload-materials-pdfs.ts
 * 환경변수: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (.env.local)
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceKey) {
  console.error('NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 필요')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const BASE_DIR = '/Volumes/Untitled/업로드 후'

const MATERIALS = [
  {
    filePath: path.join(BASE_DIR, '2026 서울대학교 대입정책포럼 자료집(배포용).pdf'),
    title: '2026 서울대학교 대입정책포럼 자료집',
    content: `2026학년도 서울대학교 대입정책포럼 자료집입니다.

주요 내용:
- 대학 입시 정책 관련 최신 정보
- 서울대학교 입학 정책 포럼 발표 자료

전자칠판에 띄워 보시거나 출력하여 학부모 상담 시 활용하시면 좋습니다.`,
  },
  {
    filePath: path.join(BASE_DIR, '2027 수능특강 영어 2_260206_174141.pdf'),
    title: '2027 수능특강 영어',
    content: `2027학년도 수능특강 영어 자료입니다.

수능 영어 대비 및 수업 자료로 활용하실 수 있습니다.
전자칠판에 띄워서 수업에 활용하시기 좋습니다.`,
  },
  {
    filePath: path.join(BASE_DIR, '의대_학생부_종합분석_가이드라인(학생참고용).pdf'),
    title: '의대 학생부 종합분석 가이드라인 (학생 참고용)',
    content: `의과대학 학생부 종합전형 분석 가이드라인입니다.

학생 및 학부모님께 의대 입시 전략을 안내하실 때 참고하실 수 있는 자료입니다.`,
  },
  {
    filePath: path.join(BASE_DIR, '2026년 학교는 이렇게 바꿉니다_교육부 주요 정책 총정리_by 별의별 교육연구소_from Youtube to Lilys_20260208.pdf'),
    title: '2026년 학교는 이렇게 바꿉니다 - 교육부 주요 정책 총정리',
    content: `2026년 교육부 주요 정책을 총정리한 자료입니다.

별의별 교육연구소가 정리한 내용으로, 학원 운영 및 학부모 상담 시 참고 자료로 활용하실 수 있습니다.`,
  },
  {
    filePath: path.join(BASE_DIR, '2025 진로학습설계 과목 선택 이력책_울산광역시교육청.pdf'),
    title: '2025 진로학습설계 과목 선택 이력책 (울산광역시교육청)',
    content: `2025학년도 진로학습설계 과목 선택 이력책입니다.

울산광역시교육청 발간 자료로, 중·고등학생 진로 지도 및 과목 선택 상담 시 참고하실 수 있습니다.`,
  },
]

/** Supabase Storage 키용 - 영문/숫자/하이픈만 허용 */
function storageKeySafe(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9.-]/g, '')
    .replace(/\.pdf$/i, '')
    .slice(0, 50) || 'file'
}

async function uploadAndCreate() {
  // 1. 관리자 사용자 조회
  const { data: adminUsers, error: adminError } = await supabase
    .from('users')
    .select('id, nickname, email')
    .eq('role', 'admin')
    .limit(1)

  if (adminError || !adminUsers?.length) {
    console.error('❌ 관리자 계정을 찾을 수 없습니다. users 테이블에서 role=admin 확인하세요.')
    process.exit(1)
  }

  const admin = adminUsers[0]
  console.log(`📌 작성자: ${admin.nickname || admin.email} (${admin.id})\n`)

  for (const item of MATERIALS) {
    const fileName = path.basename(item.filePath)
    console.log(`📄 처리 중: ${fileName}`)

    if (!fs.existsSync(item.filePath)) {
      console.error(`   ❌ 파일 없음: ${item.filePath}\n`)
      continue
    }

    const buffer = fs.readFileSync(item.filePath)
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 10)
    const safeName = storageKeySafe(fileName)
    const storagePath = `materials/admin/${timestamp}-${randomStr}-${safeName}.pdf`

    // Storage 업로드
    const { error: uploadError } = await supabase.storage
      .from('community-materials')
      .upload(storagePath, buffer, {
        contentType: 'application/pdf',
        upsert: false,
      })

    if (uploadError) {
      if (uploadError.message?.includes('Bucket not found')) {
        console.error('   ❌ community-materials 버킷이 없습니다. npm run create:community-materials-bucket 실행 후 다시 시도하세요.\n')
        process.exit(1)
      }
      console.error(`   ❌ 업로드 실패: ${uploadError.message}\n`)
      continue
    }

    const { data: urlData } = supabase.storage
      .from('community-materials')
      .getPublicUrl(storagePath)

    const fileUrl = urlData.publicUrl

    // 게시글 등록
    const { error: postError } = await supabase
      .from('posts')
      .insert({
        board_type: 'materials',
        title: item.title,
        content: item.content,
        author_id: admin.id,
        images: [fileUrl],
        likes_count: 0,
        comments_count: 0,
      })

    if (postError) {
      console.error(`   ❌ 게시글 등록 실패: ${postError.message}\n`)
      continue
    }

    console.log(`   ✅ 완료: ${item.title}\n`)
  }

  console.log('🎉 공유자료실 등록이 완료되었습니다.')
  console.log('   /community?board=materials 에서 확인하세요.')
}

uploadAndCreate()
