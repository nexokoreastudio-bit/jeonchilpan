/**
 * 배치 업로드 스크립트
 *
 * 사용 예시:
 *   npx tsx scripts/upload-resource-batch.ts --batch=batch_1 --dry-run
 *   npx tsx scripts/upload-resource-batch.ts --batch=batch_1
 *   npx tsx scripts/upload-resource-batch.ts --csv=docs/resource-migration/admin_resource_upload_promoted51_phase2_v1.csv
 *
 * 입력 파일:
 * - docs/resource-migration/admin_upload_batch_schedule_80_v1.csv
 * - docs/resource-migration/admin_resource_upload_wave1_balanced_v1.csv
 * - docs/resource-migration/admin_resource_upload_promoted30_v1.csv
 *
 * 환경 변수(.env.local):
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 누락')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

type CsvRow = Record<string, string>

function parseCsv(filePath: string): CsvRow[] {
  const raw = fs.readFileSync(filePath, 'utf8')
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < raw.length; i += 1) {
    const ch = raw[i]

    if (inQuotes) {
      if (ch === '"') {
        if (raw[i + 1] === '"') {
          field += '"'
          i += 1
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
      continue
    }

    if (ch === '"') {
      inQuotes = true
      continue
    }
    if (ch === ',') {
      row.push(field)
      field = ''
      continue
    }
    if (ch === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      continue
    }
    if (ch === '\r') continue

    field += ch
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  const header = rows[0] || []
  return rows.slice(1).map((r) => {
    const obj: CsvRow = {}
    header.forEach((h, i) => {
      obj[h] = r[i] ?? ''
    })
    return obj
  })
}

function getArg(name: string): string | null {
  const key = `--${name}=`
  const found = process.argv.find((a) => a.startsWith(key))
  return found ? found.slice(key.length) : null
}

function hasFlag(flag: string): boolean {
  return process.argv.includes(`--${flag}`)
}

function toContentType(fileType: string): string {
  const ft = fileType.toLowerCase()
  if (ft === 'pdf') return 'application/pdf'
  if (ft === 'xlsx') return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  if (ft === 'hwp') return 'application/x-hwp'
  if (ft === 'docx') return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  if (ft === 'pptx') return 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  return 'application/octet-stream'
}

function extFromPath(p: string): string {
  const ext = path.extname(p).toLowerCase().replace('.', '')
  return ext || 'bin'
}

function safeName(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 120)
}

async function run() {
  const batchName = getArg('batch') || 'batch_1'
  const csvArg = getArg('csv')
  const dryRun = hasFlag('dry-run')

  const docsDir = path.join(process.cwd(), 'docs', 'resource-migration')
  const schedulePath = path.join(docsDir, 'admin_upload_batch_schedule_80_v1.csv')
  const wavePath = path.join(docsDir, 'admin_resource_upload_wave1_balanced_v1.csv')
  const promotedPath = path.join(docsDir, 'admin_resource_upload_promoted30_v1.csv')

  let items: CsvRow[] = []
  let modeLabel = ''

  if (csvArg) {
    const csvPath = path.isAbsolute(csvArg) ? csvArg : path.join(process.cwd(), csvArg)
    if (!fs.existsSync(csvPath)) {
      console.error(`❌ CSV 파일 없음: ${csvPath}`)
      process.exit(1)
    }
    items = parseCsv(csvPath)
    modeLabel = `CSV(${path.basename(csvPath)})`
  } else {
    const schedule = parseCsv(schedulePath).filter((r) => r.batch_no === batchName)
    if (schedule.length === 0) {
      console.error(`❌ ${batchName} 항목이 없습니다.`)
      process.exit(1)
    }

    const wave = parseCsv(wavePath)
    const promoted = parseCsv(promotedPath)
    const metaByPath = new Map<string, CsvRow>()
    for (const r of [...wave, ...promoted]) {
      metaByPath.set(r.candidate_path, r)
    }

    items = schedule.map((s) => {
      const meta = metaByPath.get(s.candidate_path) || {}
      return {
        title: meta.title || s.title || '',
        description: meta.description || '',
        file_type: meta.file_type || s.file_type || extFromPath(s.candidate_path),
        access_level: meta.access_level || 'bronze',
        download_cost: meta.download_cost || '0',
        candidate_path: s.candidate_path,
      }
    })
    modeLabel = batchName
  }

  console.log(`📦 대상: ${modeLabel} (${items.length}건)`)
  console.log(`🧪 모드: ${dryRun ? 'DRY RUN' : 'LIVE UPLOAD'}`)

  let ok = 0
  let skip = 0
  let fail = 0

  for (const item of items) {
    const candidatePath = item.candidate_path
    const title = item.title || ''
    const fileType = (item.file_type || extFromPath(candidatePath)).toLowerCase()
    const description = item.description || ''
    const accessLevel = item.access_level || 'bronze'
    const downloadCost = Number(item.download_cost || '0')

    if (!fs.existsSync(candidatePath)) {
      console.error(`❌ 파일 없음: ${candidatePath}`)
      fail += 1
      continue
    }

    // 중복 체크(동일 title + file_type)
    const { data: existing, error: existingErr } = await supabase
      .from('resources')
      .select('id, title, file_url')
      .eq('title', title)
      .eq('file_type', fileType as 'pdf' | 'xlsx' | 'hwp' | 'docx' | 'pptx')
      .limit(1)

    if (existingErr) {
      console.error(`❌ 중복 확인 실패: ${title} / ${existingErr.message}`)
      fail += 1
      continue
    }

    if (existing && existing.length > 0) {
      console.log(`⏭️  SKIP(중복): ${title} (id=${existing[0].id})`)
      skip += 1
      continue
    }

    const ext = extFromPath(candidatePath)
    const baseName = path.basename(candidatePath, `.${ext}`)
    const storagePath = `resources/${batchName}/${Date.now()}-${safeName(baseName)}.${ext}`
    const contentType = toContentType(fileType)

    if (dryRun) {
      console.log(`🧪 DRY: ${title} -> ${storagePath}`)
      ok += 1
      continue
    }

    const buffer = fs.readFileSync(candidatePath)
    const { error: upErr } = await supabase.storage
      .from('resources')
      .upload(storagePath, buffer, { contentType, upsert: false })

    if (upErr) {
      console.error(`❌ 업로드 실패: ${title} / ${upErr.message}`)
      fail += 1
      continue
    }

    const { data: pub } = supabase.storage.from('resources').getPublicUrl(storagePath)
    const fileUrl = pub.publicUrl

    const { error: insErr } = await supabase
      .from('resources')
      .insert({
        title,
        description,
        file_url: fileUrl,
        file_type: fileType as 'pdf' | 'xlsx' | 'hwp' | 'docx' | 'pptx',
        access_level: accessLevel as 'bronze' | 'silver' | 'gold',
        download_cost: downloadCost,
        downloads_count: 0,
      })

    if (insErr) {
      console.error(`❌ DB 등록 실패: ${title} / ${insErr.message}`)
      fail += 1
      continue
    }

    console.log(`✅ 업로드 완료: ${title}`)
    ok += 1
  }

  console.log(`\n📊 결과: OK=${ok}, SKIP=${skip}, FAIL=${fail}`)
  if (dryRun) {
    console.log('ℹ️  실제 업로드하려면 --dry-run 없이 다시 실행하세요.')
  }
}

run().catch((e) => {
  console.error('치명적 오류:', e)
  process.exit(1)
})
