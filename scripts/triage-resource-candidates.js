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

    if (ch === '\r') {
      continue
    }

    field += ch
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows
}

function escapeField(value) {
  const str = String(value ?? '')
  if (str.includes('"') || str.includes(',') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function toCsv(rows) {
  return rows.map((r) => r.map(escapeField).join(',')).join('\n') + '\n'
}

function containsAny(text, patterns) {
  return patterns.some((p) => p.test(text))
}

const inputPath = path.resolve(
  process.cwd(),
  'docs/resource-migration/admin_resource_upload_draft_supported_v3_reclassified.csv'
)
const outputPath = path.resolve(
  process.cwd(),
  'docs/resource-migration/resource_triage_3stage_v1.csv'
)
const summaryPath = path.resolve(
  process.cwd(),
  'docs/resource-migration/resource_triage_3stage_summary_v1.csv'
)

const raw = fs.readFileSync(inputPath, 'utf8')
const rows = parseCsv(raw)
const header = rows[0]
const body = rows.slice(1).filter((r) => r.length >= header.length)

const idx = {
  title: header.indexOf('title'),
  fileType: header.indexOf('file_type'),
  candidatePath: header.indexOf('candidate_path'),
  category: header.indexOf('category_hint'),
  priority: header.indexOf('priority'),
  size: header.indexOf('size_mb'),
}

const suspiciousPatterns = [
  /소행성/i,
  /태양/i,
  /중력파/i,
  /류구/i,
  /phaethon/i,
  /gemini/i,
  /storybook/i,
  /케이스모킬러/i,
  /편광/i,
]

const workingCategories = new Set([
  '입시_진학',
  '정책_공문',
  '상담_학부모',
  '수업_교재',
  '학원운영',
  '데이터_분석',
])

const immediateExt = new Set(['pdf', 'hwp', 'docx'])
const reviewExt = new Set(['pdf', 'hwp', 'docx', 'pptx', 'xlsx'])

function classify(r) {
  const title = (r[idx.title] || '').trim()
  const fileType = (r[idx.fileType] || '').trim().toLowerCase()
  const category = (r[idx.category] || '').trim()
  const sizeMb = Number(r[idx.size] || 0)
  const priority = Number(r[idx.priority] || 3)
  const text = `${title} ${r[idx.candidatePath] || ''}`

  const suspicious = containsAny(text, suspiciousPatterns)
  const isWorkingCategory = workingCategories.has(category)

  if (!reviewExt.has(fileType)) {
    return ['보류', '지원 확장자 외 파일']
  }

  if (suspicious) {
    return ['보류', '전칠판 자료실 목적과 연관성이 낮아 보이는 주제']
  }

  if (priority === 1 && isWorkingCategory && immediateExt.has(fileType) && sizeMb <= 40) {
    return ['즉시 게시', '우선순위 상위 + 핵심 카테고리 + 문서형 + 용량 적정']
  }

  if (isWorkingCategory && immediateExt.has(fileType) && sizeMb <= 80) {
    return ['즉시 게시', '핵심 카테고리 + 문서형으로 즉시 활용 가능']
  }

  if (isWorkingCategory && reviewExt.has(fileType) && sizeMb <= 150) {
    return ['검수 필요', '핵심 카테고리이나 슬라이드/시트 또는 대용량으로 1차 검수 필요']
  }

  if (category === '기타' && immediateExt.has(fileType) && sizeMb <= 40) {
    return ['검수 필요', '기타 카테고리 문서형으로 제목/설명 정제 후 게시 가능']
  }

  return ['보류', '카테고리 적합도 또는 용량/형식 기준 미충족']
}

const outHeader = [
  'stage',
  'stage_reason',
  'title',
  'category_hint',
  'file_type',
  'size_mb',
  'priority',
  'candidate_path',
]

const stageOrder = { '즉시 게시': 1, '검수 필요': 2, '보류': 3 }

const classified = body.map((r) => {
  const [stage, reason] = classify(r)
  return {
    stage,
    reason,
    title: r[idx.title] || '',
    category: r[idx.category] || '',
    fileType: r[idx.fileType] || '',
    sizeMb: Number(r[idx.size] || 0),
    priority: Number(r[idx.priority] || 3),
    candidatePath: r[idx.candidatePath] || '',
  }
})

classified.sort((a, b) => {
  if (stageOrder[a.stage] !== stageOrder[b.stage]) return stageOrder[a.stage] - stageOrder[b.stage]
  if (a.priority !== b.priority) return a.priority - b.priority
  if (a.category !== b.category) return a.category.localeCompare(b.category, 'ko')
  return b.sizeMb - a.sizeMb
})

const outRows = [outHeader]
for (const c of classified) {
  outRows.push([
    c.stage,
    c.reason,
    c.title,
    c.category,
    c.fileType,
    c.sizeMb.toFixed(2),
    String(c.priority),
    c.candidatePath,
  ])
}

fs.writeFileSync(outputPath, toCsv(outRows), 'utf8')

const summaryMap = new Map()
for (const c of classified) {
  const key = `${c.stage}|||${c.category || '미분류'}`
  if (!summaryMap.has(key)) {
    summaryMap.set(key, { stage: c.stage, category: c.category || '미분류', count: 0, totalSize: 0 })
  }
  const v = summaryMap.get(key)
  v.count += 1
  v.totalSize += c.sizeMb
}

const summaryRows = [['stage', 'category_hint', 'file_count', 'total_size_mb']]
for (const item of [...summaryMap.values()].sort((a, b) => {
  if (stageOrder[a.stage] !== stageOrder[b.stage]) return stageOrder[a.stage] - stageOrder[b.stage]
  return b.count - a.count
})) {
  summaryRows.push([item.stage, item.category, String(item.count), item.totalSize.toFixed(2)])
}
fs.writeFileSync(summaryPath, toCsv(summaryRows), 'utf8')

const stageCounts = classified.reduce((acc, c) => {
  acc[c.stage] = (acc[c.stage] || 0) + 1
  return acc
}, {})

console.log('입력:', inputPath)
console.log('출력:', outputPath)
console.log('요약:', summaryPath)
console.log('단계별 건수:', stageCounts)
