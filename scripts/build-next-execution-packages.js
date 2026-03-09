const fs = require('fs')
const path = require('path')

function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
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

  return rows
}

function readCsv(file) {
  const rows = parseCsv(fs.readFileSync(file, 'utf8'))
  return { header: rows[0], body: rows.slice(1) }
}

function writeCsv(file, rows) {
  const esc = (v) => {
    const s = String(v ?? '')
    if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`
    return s
  }
  fs.writeFileSync(file, rows.map((r) => r.map(esc).join(',')).join('\n') + '\n', 'utf8')
}

function idxMap(header) {
  return Object.fromEntries(header.map((h, i) => [h, i]))
}

function inferCategory(title) {
  const t = (title || '').toLowerCase()
  const rules = [
    ['입시_진학', [/입시/, /진학/, /수시/, /정시/, /면접/, /학종/, /대입/, /대학/, /진로/]],
    ['정책_공문', [/교육과정/, /학점제/, /교육청/, /정책/, /공문/, /안내서/]],
    ['상담_학부모', [/학부모/, /상담/, /설명회/, /q&a/, /질문/]],
    ['수업_교재', [/수업/, /교재/, /활동지/, /워크북/, /교사용/, /학생용/, /과목/]],
    ['데이터_분석', [/분석/, /리포트/, /통계/, /데이터/, /지표/]],
    ['학원운영', [/운영/, /관리/, /인사/, /매뉴얼/]],
  ]

  for (const [cat, pats] of rules) {
    if (pats.some((p) => p.test(t))) return cat
  }
  return '수업_교재'
}

function descriptionFor(cat) {
  if (cat === '입시_진학') return '입시/진학 상담에 바로 활용 가능한 참고 자료입니다.'
  if (cat === '정책_공문') return '교육 정책 및 공문 핵심 내용을 정리한 자료입니다.'
  if (cat === '상담_학부모') return '학부모 상담 전후 커뮤니케이션에 활용 가능한 실전 자료입니다.'
  if (cat === '수업_교재') return '수업 설계와 과제 운영에 활용 가능한 교재/학습 자료입니다.'
  if (cat === '데이터_분석') return '데이터 기반 의사결정에 활용 가능한 분석 자료입니다.'
  if (cat === '학원운영') return '학원 운영과 시스템 개선에 활용 가능한 실무 자료입니다.'
  return '현장 운영에 참고할 수 있는 교육 자료입니다.'
}

function cleanupTitle(title) {
  return (title || '')
    .replace(/from Youtube to NotebookLM Slide/gi, '')
    .replace(/from Youtube to Gamma/gi, '')
    .replace(/from PDF to Gamma/gi, '')
    .replace(/from Webpage to Gamma/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

const base = path.resolve(process.cwd(), 'docs/resource-migration')

const wave1 = readCsv(path.join(base, 'admin_resource_upload_wave1_balanced_v1.csv'))
const prom30 = readCsv(path.join(base, 'admin_resource_upload_promoted30_v1.csv'))
const review = readCsv(path.join(base, 'resource_triage_review_v1.csv'))
const hold = readCsv(path.join(base, 'resource_triage_hold_v1.csv'))

const wave1Idx = idxMap(wave1.header)
const prom30Idx = idxMap(prom30.header)
const reviewIdx = idxMap(review.header)
const holdIdx = idxMap(hold.header)

// 1) Build upload batch schedule for 80 items (50+30)
const eighty = []
for (const r of wave1.body) {
  eighty.push({
    source: 'wave1',
    title: r[wave1Idx.title],
    category: r[wave1Idx.category_hint],
    fileType: r[wave1Idx.file_type],
    sizeMb: Number(r[wave1Idx.size_mb] || 0),
    path: r[wave1Idx.candidate_path],
  })
}
for (const r of prom30.body) {
  eighty.push({
    source: 'promoted30',
    title: r[prom30Idx.title],
    category: r[prom30Idx.category_hint],
    fileType: r[prom30Idx.file_type],
    sizeMb: Number(r[prom30Idx.size_mb] || 0),
    path: r[prom30Idx.candidate_path],
  })
}

// Keep category diversity within each batch by round-robin category buckets
const catBuckets = new Map()
for (const item of eighty.sort((a, b) => a.sizeMb - b.sizeMb)) {
  if (!catBuckets.has(item.category)) catBuckets.set(item.category, [])
  catBuckets.get(item.category).push(item)
}

const batches = [[], [], [], []]
let assigned = 0
while (assigned < eighty.length) {
  for (let b = 0; b < batches.length && assigned < eighty.length; b += 1) {
    for (const [cat, bucket] of catBuckets.entries()) {
      if (bucket.length === 0) continue
      batches[b].push(bucket.shift())
      assigned += 1
      if (batches[b].length >= 20) break
      if (assigned >= eighty.length) break
    }
  }
}

const batchRows = [['batch_no', 'order_in_batch', 'source', 'title', 'category_hint', 'file_type', 'size_mb', 'candidate_path']]
for (let b = 0; b < batches.length; b += 1) {
  batches[b].forEach((item, i) => {
    batchRows.push([
      `batch_${b + 1}`,
      String(i + 1),
      item.source,
      item.title,
      item.category,
      item.fileType,
      item.sizeMb.toFixed(2),
      item.path,
    ])
  })
}
writeCsv(path.join(base, 'admin_upload_batch_schedule_80_v1.csv'), batchRows)

// 2) Promote remaining 51 from review (excluding already promoted30)
const promotedPaths = new Set(prom30.body.map((r) => r[prom30Idx.candidate_path]))
const remainingReview = review.body
  .filter((r) => !promotedPaths.has(r[reviewIdx.candidate_path]))

const promote51Rows = [[
  'title', 'description', 'file_type', 'access_level', 'download_cost',
  'candidate_path', 'category_hint', 'priority', 'size_mb', 'promotion_note'
]]

for (const r of remainingReview) {
  const title = cleanupTitle(r[reviewIdx.title])
  const category = inferCategory(title)
  promote51Rows.push([
    title,
    descriptionFor(category),
    r[reviewIdx.file_type],
    'bronze',
    '0',
    r[reviewIdx.candidate_path],
    category,
    '2',
    r[reviewIdx.size_mb],
    '검수 잔여분 2차 승격 패키지',
  ])
}

writeCsv(path.join(base, 'admin_resource_upload_promoted51_phase2_v1.csv'), promote51Rows)

// 3) Hold template package (archive/summary)
const holdTemplateRows = [[
  'title', 'candidate_path', 'proposed_mode', 'summary_3lines', 'tag1', 'tag2', 'tag3', 'owner', 'due_date', 'status', 'notes'
]]

for (const r of hold.body) {
  holdTemplateRows.push([
    r[holdIdx.title],
    r[holdIdx.candidate_path],
    'archive_only',
    '',
    '',
    '',
    '',
    'nexo',
    '',
    'todo',
    r[holdIdx.stage_reason],
  ])
}
writeCsv(path.join(base, 'hold_archive_summary_template_v1.csv'), holdTemplateRows)

const holdMd = [
  '# Hold Item Conversion Template v1',
  '',
  '## 목적',
  '- 보류 항목도 아카이브형/요약형으로 전환해 전량 활용하기 위함',
  '',
  '## 처리 규칙',
  '1. `proposed_mode=archive_only`: 원문 보관 + 검색 노출',
  '2. `proposed_mode=summary_publish`: 3줄 요약 작성 후 자료실 게시',
  '3. `proposed_mode=convert_then_publish`: PPT/XLSX를 PDF 요약본으로 변환 후 게시',
  '',
  '## 필수 입력',
  '- summary_3lines: 사용자에게 보이는 3줄 요약',
  '- tag1~3: 검색 태그 (예: 입시, 학부모, 정책)',
  '- due_date: 처리 예정일 (YYYY-MM-DD)',
  '- status: todo/in_progress/done',
]
fs.writeFileSync(path.join(base, 'hold_archive_summary_template_v1.md'), holdMd.join('\n') + '\n', 'utf8')

// Summaries
const summaryRows = [['item', 'count']]
summaryRows.push(['upload_batch_total', String(eighty.length)])
summaryRows.push(['batch_1', String(batches[0].length)])
summaryRows.push(['batch_2', String(batches[1].length)])
summaryRows.push(['batch_3', String(batches[2].length)])
summaryRows.push(['batch_4', String(batches[3].length)])
summaryRows.push(['promoted_phase2', String(remainingReview.length)])
summaryRows.push(['hold_template_rows', String(hold.body.length)])
writeCsv(path.join(base, 'execution_package_summary_v1.csv'), summaryRows)

console.log(JSON.stringify({
  batches: batches.map((b) => b.length),
  promoted_phase2: remainingReview.length,
  hold_items: hold.body.length,
}, null, 2))
