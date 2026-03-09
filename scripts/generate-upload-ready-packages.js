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

function toCsv(rows) {
  const esc = (v) => {
    const s = String(v ?? '')
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`
    }
    return s
  }
  return rows.map((r) => r.map(esc).join(',')).join('\n') + '\n'
}

function readCsv(file) {
  const rows = parseCsv(fs.readFileSync(file, 'utf8'))
  return { header: rows[0], body: rows.slice(1) }
}

function idxMap(header) {
  return Object.fromEntries(header.map((h, i) => [h, i]))
}

function categoryDescription(cat) {
  if (cat === '입시_진학') return '입시/진학 상담에 바로 활용 가능한 참고 자료입니다.'
  if (cat === '정책_공문') return '교육 정책 및 공문 핵심 내용을 정리한 자료입니다.'
  if (cat === '상담_학부모') return '학부모 상담 전후 커뮤니케이션에 활용 가능한 실전 자료입니다.'
  if (cat === '수업_교재') return '수업 설계와 과제 운영에 활용 가능한 교재/학습 자료입니다.'
  if (cat === '학원운영') return '학원 운영과 시스템 개선에 활용 가능한 실무 자료입니다.'
  if (cat === '데이터_분석') return '데이터 기반 의사결정에 활용 가능한 분석 자료입니다.'
  return '현장 운영에 참고할 수 있는 교육 자료입니다.'
}

function inferCategory(title) {
  const t = title.toLowerCase()
  const m = [
    { cat: '입시_진학', patterns: [/입시/, /진학/, /수시/, /정시/, /면접/, /학종/, /대학/, /진로/] },
    { cat: '정책_공문', patterns: [/교육과정/, /학점제/, /교육청/, /고시/, /정책/, /공문/, /안내서/] },
    { cat: '상담_학부모', patterns: [/학부모/, /상담/, /설명회/, /q&a/, /질문/] },
    { cat: '수업_교재', patterns: [/수업/, /교재/, /활동지/, /워크북/, /교사용/, /학생용/, /과목/] },
    { cat: '데이터_분석', patterns: [/분석/, /리포트/, /통계/, /데이터/, /지표/] },
    { cat: '학원운영', patterns: [/운영/, /관리/, /인사/, /매뉴얼/] },
  ]

  for (const c of m) {
    if (c.patterns.some((p) => p.test(t))) return c.cat
  }
  return '수업_교재'
}

function titleCleanup(title) {
  return title
    .replace(/\s+/g, ' ')
    .replace(/from Youtube to NotebookLM Slide/gi, '')
    .replace(/from Youtube to Gamma/gi, '')
    .replace(/from PDF to Gamma/gi, '')
    .replace(/from Webpage to Gamma/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

const base = path.resolve(process.cwd(), 'docs/resource-migration')

const wave = readCsv(path.join(base, 'resource_rollout_wave1_top50_balanced_v1.csv'))
const draft = readCsv(path.join(base, 'admin_resource_upload_draft_supported_v3_reclassified.csv'))
const review = readCsv(path.join(base, 'resource_triage_review_v1.csv'))
const triage = readCsv(path.join(base, 'resource_triage_3stage_v1.csv'))

const waveIdx = idxMap(wave.header)
const draftIdx = idxMap(draft.header)
const reviewIdx = idxMap(review.header)
const triageIdx = idxMap(triage.header)

const draftByPath = new Map(draft.body.map((r) => [r[draftIdx.candidate_path], r]))

const waveOutHeader = ['title', 'description', 'file_type', 'access_level', 'download_cost', 'candidate_path', 'category_hint', 'priority', 'size_mb']
const waveOutBody = []

for (const r of wave.body) {
  const candidatePath = r[waveIdx.candidate_path]
  const matched = draftByPath.get(candidatePath)
  const title = titleCleanup(r[waveIdx.title])
  const category = r[waveIdx.category_hint]
  const fileType = r[waveIdx.file_type]
  const sizeMb = r[waveIdx.size_mb]
  const priority = matched ? matched[draftIdx.priority] : '1'
  waveOutBody.push([
    title,
    categoryDescription(category),
    fileType,
    'bronze',
    '0',
    candidatePath,
    category,
    priority,
    sizeMb,
  ])
}

const waveOutPath = path.join(base, 'admin_resource_upload_wave1_balanced_v1.csv')
fs.writeFileSync(waveOutPath, toCsv([waveOutHeader, ...waveOutBody]), 'utf8')

// Promote top 30 from review queue into upload-ready set
const reviewRows = review.body
  .filter((r) => {
    const fileType = (r[reviewIdx.file_type] || '').toLowerCase()
    const size = Number(r[reviewIdx.size_mb] || 0)
    return ['pdf', 'hwp', 'docx'].includes(fileType) && size <= 25
  })
  .sort((a, b) => Number(a[reviewIdx.size_mb] || 0) - Number(b[reviewIdx.size_mb] || 0))
  .slice(0, 30)

const promoteHeader = ['title', 'description', 'file_type', 'access_level', 'download_cost', 'candidate_path', 'category_hint', 'priority', 'size_mb', 'promotion_note']
const promoteBody = []
for (const r of reviewRows) {
  const title = titleCleanup(r[reviewIdx.title])
  const category = inferCategory(title)
  const fileType = r[reviewIdx.file_type]
  const sizeMb = r[reviewIdx.size_mb]
  const candidatePath = r[reviewIdx.candidate_path]
  promoteBody.push([
    title,
    categoryDescription(category),
    fileType,
    'bronze',
    '0',
    candidatePath,
    category,
    '2',
    sizeMb,
    '검수 항목에서 자동 승격(제목 정제 + 카테고리 재지정)',
  ])
}

const promoteOutPath = path.join(base, 'admin_resource_upload_promoted30_v1.csv')
fs.writeFileSync(promoteOutPath, toCsv([promoteHeader, ...promoteBody]), 'utf8')

// Build triage summary after promotion (for visibility)
const promotedPaths = new Set(promoteBody.map((r) => r[5]))
const summary = { '즉시 게시': 0, '검수 필요': 0, '보류': 0 }
for (const r of triage.body) {
  const stage = r[triageIdx.stage]
  const p = r[triageIdx.candidate_path]
  if (stage === '검수 필요' && promotedPaths.has(p)) {
    summary['즉시 게시'] += 1
  } else if (summary[stage] !== undefined) {
    summary[stage] += 1
  }
}

const summaryPath = path.join(base, 'resource_triage_after_promote30_summary_v1.csv')
const summaryRows = [
  ['stage', 'file_count'],
  ['즉시 게시', String(summary['즉시 게시'])],
  ['검수 필요', String(summary['검수 필요'])],
  ['보류', String(summary['보류'])],
]
fs.writeFileSync(summaryPath, toCsv(summaryRows), 'utf8')

console.log(JSON.stringify({
  wave1_upload_csv: waveOutPath,
  promoted30_upload_csv: promoteOutPath,
  after_promote_summary_csv: summaryPath,
  wave1_count: waveOutBody.length,
  promoted_count: promoteBody.length,
  stage_counts_after_promote30: summary,
}, null, 2))
