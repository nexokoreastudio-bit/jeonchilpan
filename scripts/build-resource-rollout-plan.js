const fs = require('fs')
const path = require('path')

function parseCsvLine(line) {
  const out = []
  let cur = ''
  let q = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (q) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"'
          i++
        } else {
          q = false
        }
      } else {
        cur += ch
      }
      continue
    }
    if (ch === '"') {
      q = true
      continue
    }
    if (ch === ',') {
      out.push(cur)
      cur = ''
      continue
    }
    cur += ch
  }
  out.push(cur)
  return out
}

function readCsv(file) {
  const lines = fs.readFileSync(file, 'utf8').trim().split(/\r?\n/)
  const header = parseCsvLine(lines[0])
  const rows = lines.slice(1).map(parseCsvLine)
  return { header, rows }
}

function esc(v) {
  const s = String(v ?? '')
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`
  return s
}
function writeCsv(file, header, rows) {
  const content = [header.join(','), ...rows.map((r) => r.map(esc).join(','))].join('\n') + '\n'
  fs.writeFileSync(file, content, 'utf8')
}

const base = path.resolve(process.cwd(), 'docs/resource-migration')
const triageFile = path.join(base, 'resource_triage_3stage_v1.csv')
const { header, rows } = readCsv(triageFile)
const idx = Object.fromEntries(header.map((h, i) => [h, i]))

const parsed = rows.map((r) => ({
  stage: r[idx.stage],
  reason: r[idx.stage_reason],
  title: r[idx.title],
  category: r[idx.category_hint],
  fileType: r[idx.file_type],
  sizeMb: Number(r[idx.size_mb] || 0),
  priority: Number(r[idx.priority] || 3),
  candidatePath: r[idx.candidate_path],
}))

const immediate = parsed.filter((r) => r.stage === '즉시 게시')
const review = parsed.filter((r) => r.stage === '검수 필요')
const hold = parsed.filter((r) => r.stage === '보류')

function catRank(cat) {
  const ranks = {
    '상담_학부모': 1,
    '입시_진학': 2,
    '정책_공문': 3,
    '수업_교재': 4,
    '학원운영': 5,
    '데이터_분석': 6,
    '기타': 7,
  }
  return ranks[cat] || 99
}

const immediateSorted = [...immediate].sort((a, b) => {
  if (catRank(a.category) !== catRank(b.category)) return catRank(a.category) - catRank(b.category)
  if (a.priority !== b.priority) return a.priority - b.priority
  return a.sizeMb - b.sizeMb
})

const wave1 = immediateSorted.slice(0, 50)
const wave2 = immediateSorted.slice(50)

writeCsv(
  path.join(base, 'resource_rollout_wave1_top50_v1.csv'),
  ['wave', 'title', 'category_hint', 'file_type', 'size_mb', 'candidate_path'],
  wave1.map((r) => ['wave1', r.title, r.category, r.fileType, r.sizeMb.toFixed(2), r.candidatePath])
)

writeCsv(
  path.join(base, 'resource_rollout_wave2_remaining_v1.csv'),
  ['wave', 'title', 'category_hint', 'file_type', 'size_mb', 'candidate_path'],
  wave2.map((r) => ['wave2', r.title, r.category, r.fileType, r.sizeMb.toFixed(2), r.candidatePath])
)

const reviewWithActions = review.map((r) => {
  let action = '제목/설명 정제 후 게시'
  if (r.fileType === 'pptx') action = 'PDF 변환 + 핵심 슬라이드 미리보기 생성 후 게시'
  if (r.fileType === 'xlsx') action = '시트 구조 확인 + 샘플 시트 PDF 캡처 후 게시'
  if (r.sizeMb > 100) action = '대용량 분할 또는 압축 최적화 후 게시'
  if (r.category === '기타') action = '카테고리 재지정 + 제목 정제 후 게시'
  return [r.title, r.category, r.fileType, r.sizeMb.toFixed(2), action, r.candidatePath]
})

writeCsv(
  path.join(base, 'resource_review_action_queue_v1.csv'),
  ['title', 'category_hint', 'file_type', 'size_mb', 'required_action', 'candidate_path'],
  reviewWithActions
)

const holdRecovery = hold.map((r) => {
  let recover = '주제 재평가 후 별도 아카이브/비공개 보관'
  if (r.reason.includes('연관성이 낮아')) recover = '일반교육/교양 아카이브로 이동, 전칠판 핵심 노출 제외'
  if (r.fileType === 'pptx' && r.sizeMb > 120) recover = '슬라이드 요약본(PDF 10~20p) 추출 후 재검토'
  else if (r.sizeMb > 80) recover = '요약본 제작 또는 분할본 생성 후 재분류'
  return [r.title, r.category, r.fileType, r.sizeMb.toFixed(2), r.reason, recover, r.candidatePath]
})

writeCsv(
  path.join(base, 'resource_hold_recovery_queue_v1.csv'),
  ['title', 'category_hint', 'file_type', 'size_mb', 'hold_reason', 'recovery_action', 'candidate_path'],
  holdRecovery
)

const md = []
md.push('# Resource Full Utilization Plan v1')
md.push('')
md.push(`- 생성일: 2026-03-06`)
md.push(`- 기준 파일: resource_triage_3stage_v1.csv`)
md.push(`- 총 대상: ${parsed.length}건`)
md.push(`- 즉시 게시: ${immediate.length}건 (Wave1 50건 + Wave2 ${wave2.length}건)`)
md.push(`- 검수 필요: ${review.length}건 (정제 후 전량 게시 목표)`)
md.push(`- 보류: ${hold.length}건 (요약/전환 통해 단계적 활용)`)
md.push('')
md.push('## 실행 순서')
md.push('1. Wave1 50건 먼저 업로드하여 자료실 품질 기준 확정')
md.push('2. Wave2 즉시게시 잔여 업로드')
md.push('3. 검수필요 항목을 액션큐 기준으로 처리하여 게시 전환')
md.push('4. 보류 항목은 회복 큐 기준으로 요약본/아카이브 전환하여 전량 활용')
md.push('')
md.push('## 전량 활용 원칙')
md.push('- 원본을 버리지 않고, 게시형/요약형/아카이브형으로 3계층 활용')
md.push('- 핵심 섹션 노출은 게시형 중심, 나머지는 검색형 아카이브로 제공')
md.push('- 보류 항목도 최소 메타데이터(제목, 출처, 설명) 등록으로 검색 가능 상태 유지')

fs.writeFileSync(path.join(base, 'resource_full_utilization_plan_v1.md'), md.join('\n') + '\n', 'utf8')

console.log(JSON.stringify({
  total: parsed.length,
  immediate: immediate.length,
  wave1: wave1.length,
  wave2: wave2.length,
  review: review.length,
  hold: hold.length
}, null, 2))
