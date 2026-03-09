/**
 * 현재 resources 데이터를 제목/설명 기반으로 자동 분류해 CSV 리포트 생성
 *
 * 실행:
 *   node scripts/export-resource-category-report.js
 */

require('dotenv').config({ path: '.env.local' })
const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

function classifyResourceCategory(title, description) {
  const text = `${title || ''} ${description || ''}`.toLowerCase()
  const rules = [
    ['입시/진학', [/입시/, /진학/, /수시/, /정시/, /면접/, /학종/, /대입/, /대학/, /진로/]],
    ['정책/공문', [/교육과정/, /학점제/, /교육청/, /정책/, /공문/, /안내서/, /고시/]],
    ['상담/학부모', [/학부모/, /상담/, /설명회/, /q&a/, /질문/, /체크리스트/]],
    ['수업/교재', [/수업/, /교재/, /활동지/, /워크북/, /교사용/, /학생용/, /과목/, /논술/, /독서/]],
    ['데이터/분석', [/분석/, /리포트/, /통계/, /데이터/, /지표/, /db/, /databook/]],
    ['학원운영', [/운영/, /관리/, /인사/, /매뉴얼/, /업무/, /마케팅/]],
  ]
  for (const [category, pats] of rules) {
    if (pats.some((p) => p.test(text))) return category
  }
  return '기타/아카이브'
}

function esc(v) {
  const s = String(v ?? '')
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`
  return s
}

async function main() {
  const { data, error } = await supabase
    .from('resources')
    .select('id,title,description,file_type,downloads_count,created_at')
    .order('id', { ascending: true })

  if (error) {
    console.error('리소스 조회 실패:', error.message)
    process.exit(1)
  }

  const rows = data || []
  const categorized = rows.map((r) => ({
    id: r.id,
    title: r.title,
    category: classifyResourceCategory(r.title, r.description),
    file_type: r.file_type || '',
    downloads_count: r.downloads_count || 0,
    created_at: r.created_at || '',
  }))

  const summaryMap = new Map()
  for (const r of categorized) {
    summaryMap.set(r.category, (summaryMap.get(r.category) || 0) + 1)
  }

  const docsDir = path.join(process.cwd(), 'docs', 'resource-migration')
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true })

  const detailHeader = ['id', 'title', 'derived_category', 'file_type', 'downloads_count', 'created_at']
  const detailRows = [
    detailHeader,
    ...categorized.map((r) => [
      String(r.id),
      r.title,
      r.category,
      r.file_type,
      String(r.downloads_count),
      r.created_at,
    ]),
  ]
  fs.writeFileSync(
    path.join(docsDir, 'resource_category_report_live_v1.csv'),
    detailRows.map((r) => r.map(esc).join(',')).join('\n') + '\n',
    'utf8'
  )

  const summaryRows = [
    ['category', 'count'],
    ...Array.from(summaryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => [k, String(v)]),
  ]
  fs.writeFileSync(
    path.join(docsDir, 'resource_category_summary_live_v1.csv'),
    summaryRows.map((r) => r.map(esc).join(',')).join('\n') + '\n',
    'utf8'
  )

  console.log(JSON.stringify({
    total: categorized.length,
    summary: Object.fromEntries(summaryMap.entries()),
    detailFile: 'docs/resource-migration/resource_category_report_live_v1.csv',
    summaryFile: 'docs/resource-migration/resource_category_summary_live_v1.csv',
  }, null, 2))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

