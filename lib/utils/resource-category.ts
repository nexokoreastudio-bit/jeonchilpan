export type ResourceCategoryKey =
  | 'admission'
  | 'policy'
  | 'parent'
  | 'teaching'
  | 'analytics'
  | 'operations'
  | 'archive'

export const RESOURCE_CATEGORY_LABELS: Record<ResourceCategoryKey, string> = {
  admission: '입시/진학',
  policy: '정책/공문',
  parent: '상담/학부모',
  teaching: '수업/교재',
  analytics: '데이터/분석',
  operations: '학원운영',
  archive: '기타/아카이브',
}

const CATEGORY_RULES: Array<{
  key: ResourceCategoryKey
  patterns: RegExp[]
}> = [
  {
    key: 'admission',
    patterns: [/입시/i, /진학/i, /수시/i, /정시/i, /면접/i, /학종/i, /대입/i, /대학/i, /진로/i],
  },
  {
    key: 'policy',
    patterns: [/교육과정/i, /학점제/i, /교육청/i, /정책/i, /공문/i, /안내서/i, /고시/i],
  },
  {
    key: 'parent',
    patterns: [/학부모/i, /상담/i, /설명회/i, /q&a/i, /질문/i, /체크리스트/i],
  },
  {
    key: 'teaching',
    patterns: [/수업/i, /교재/i, /활동지/i, /워크북/i, /교사용/i, /학생용/i, /과목/i, /논술/i, /독서/i],
  },
  {
    key: 'analytics',
    patterns: [/분석/i, /리포트/i, /통계/i, /데이터/i, /지표/i, /db/i, /databook/i],
  },
  {
    key: 'operations',
    patterns: [/운영/i, /관리/i, /인사/i, /매뉴얼/i, /업무/i, /마케팅/i],
  },
]

export function classifyResourceCategory(
  title: string,
  description?: string | null
): ResourceCategoryKey {
  const text = `${title || ''} ${description || ''}`.toLowerCase()

  for (const rule of CATEGORY_RULES) {
    if (rule.patterns.some((p) => p.test(text))) {
      return rule.key
    }
  }

  return 'archive'
}

