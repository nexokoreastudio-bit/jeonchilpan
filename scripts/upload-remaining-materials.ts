/**
 * 공유자료실 나머지 PDF 3건 업로드
 * 실행: npx tsx scripts/upload-remaining-materials.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const BASE_DIR = '/Volumes/Untitled/업로드 후'

// macOS NFD 호환: 디렉터리에서 실제 파일명으로 경로 구성
function findFile(partial: string): string | null {
  if (!fs.existsSync(BASE_DIR)) {
    console.error(`BASE_DIR 없음: ${BASE_DIR}`)
    return null
  }
  const files = fs.readdirSync(BASE_DIR)
  const pdfs = files.filter((f) => f.endsWith('.pdf') && !f.startsWith('._'))
  const match = pdfs.find((f) => {
    const fn = f.normalize('NFC')
    const pn = partial.normalize('NFC')
    return fn.includes(pn) || pn.split(/\s+/).filter(Boolean).every((w) => fn.includes(w))
  })
  return match ? path.join(BASE_DIR, match) : null
}

const REMAINING = [
  {
    filePattern: '2025 진로',
    title: '2025 진로학습설계 과목 선택 이력책 (울산광역시교육청)',
    content: `2025학년도 진로학습설계 과목 선택 이력책입니다.

울산광역시교육청 발간 자료로, 중·고등학생 진로 지도 및 과목 선택 상담 시 참고하실 수 있습니다.`,
  },
  {
    filePattern: '별의별 교육연구소',
    title: '2026년 학교는 이렇게 바꿉니다 - 교육부 주요 정책 총정리',
    content: `2026년 교육부 주요 정책을 총정리한 자료입니다.

별의별 교육연구소가 정리한 내용으로, 학원 운영 및 학부모 상담 시 참고 자료로 활용하실 수 있습니다.`,
  },
  {
    filePattern: '260206_174141',
    title: '2027 수능특강 영어',
    content: `2027학년도 수능특강 영어 자료입니다.

수능 영어 대비 및 수업 자료로 활용하실 수 있습니다.
전자칠판에 띄워서 수업에 활용하시기 좋습니다.`,
  },
]

function storageKeySafe(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9.-]/g, '')
    .replace(/\.pdf$/i, '')
    .slice(0, 50) || 'file'
}

async function upload() {
  const { data: admin } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'admin')
    .limit(1)
    .single()

  if (!admin) {
    console.error('❌ 관리자 계정 없음')
    process.exit(1)
  }

  console.log('📌 나머지 3건 업로드 시작\n')
  if (!fs.existsSync(BASE_DIR)) {
    console.error(`❌ 폴더 없음: ${BASE_DIR}`)
    process.exit(1)
  }

  for (const item of REMAINING) {
    const filePath = findFile(item.filePattern)
    if (!filePath) {
      console.error(`📄 ${item.filePattern} - ❌ 파일 없음\n`)
      continue
    }
    const fileName = path.basename(filePath)
    console.log(`📄 ${fileName}`)

    const buffer = fs.readFileSync(filePath)
    const ts = Date.now()
    const rand = Math.random().toString(36).substring(2, 10)
    const storagePath = `materials/admin/${ts}-${rand}-${storageKeySafe(fileName)}.pdf`

    const { error: upErr } = await supabase.storage
      .from('community-materials')
      .upload(storagePath, buffer, { contentType: 'application/pdf', upsert: false })

    if (upErr) {
      console.error(`   ❌ ${upErr.message}\n`)
      continue
    }

    const { data: urlData } = supabase.storage.from('community-materials').getPublicUrl(storagePath)

    const { error: postErr } = await supabase.from('posts').insert({
      board_type: 'materials',
      title: item.title,
      content: item.content,
      author_id: admin.id,
      images: [urlData.publicUrl],
      likes_count: 0,
      comments_count: 0,
    })

    if (postErr) {
      console.error(`   ❌ 게시글 등록 실패: ${postErr.message}\n`)
      continue
    }

    console.log(`   ✅ ${item.title}\n`)
  }

  console.log('🎉 완료. /community?board=materials 에서 확인하세요.')
}

upload()
