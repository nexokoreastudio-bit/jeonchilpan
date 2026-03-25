type LeadMetaKey = '신청유형' | '유입페이지' | '지역' | '희망일' | '희망시간' | '캠페인'

const META_KEYS: LeadMetaKey[] = ['신청유형', '유입페이지', '지역', '희망일', '희망시간', '캠페인']

export interface ParsedLeadMetadata {
  requestType: string | null
  sourcePage: string | null
  region: string | null
  preferredDate: string | null
  preferredTime: string | null
  campaign: string | null
  body: string | null
}

function buildMetaMap(message: string | null | undefined): Partial<Record<LeadMetaKey, string>> {
  if (!message) return {}

  const meta: Partial<Record<LeadMetaKey, string>> = {}
  for (const rawLine of message.split('\n')) {
    const line = rawLine.trim()
    const match = line.match(/^\[([^\]]+)\]\s*(.+)$/)
    if (!match) continue

    const key = match[1] as LeadMetaKey
    if (!META_KEYS.includes(key)) continue
    meta[key] = match[2].trim()
  }
  return meta
}

export function parseLeadMetadata(message: string | null | undefined): ParsedLeadMetadata {
  const meta = buildMetaMap(message)
  const body = stripLeadMetaLines(message)

  return {
    requestType: meta['신청유형'] || null,
    sourcePage: meta['유입페이지'] || null,
    region: meta['지역'] || null,
    preferredDate: meta['희망일'] || null,
    preferredTime: meta['희망시간'] || null,
    campaign: meta['캠페인'] || null,
    body,
  }
}

export function stripLeadMetaLines(message: string | null | undefined): string | null {
  if (!message) return null

  const lines = message.split('\n')
  const filtered = lines.filter((rawLine) => {
    const line = rawLine.trim()
    if (!line) return true
    if (line === '[요청 메모]') return false
    return !line.match(/^\[(신청유형|유입페이지|지역|희망일|희망시간|캠페인)\]\s+/)
  })

  const normalized = filtered.join('\n').replace(/\n{3,}/g, '\n\n').trim()
  return normalized || null
}
