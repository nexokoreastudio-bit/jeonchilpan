/**
 * 전칠판 활용 안내 공지 5건 등록
 * 실행: node scripts/create-usage-notices.js
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error('NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 환경변수가 필요합니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const NOTICES = [
  {
    title: '[공지] 전칠판 사이트 3분 사용 가이드 (자료실·인사이트·뉴스)',
    content: `처음 오신 원장님을 위한 빠른 사용 순서입니다.

1) 자료실: 상담·수업에 바로 쓸 PDF/템플릿 다운로드
2) 인사이트: 학부모 상담 멘트와 이슈 요약 확인
3) 뉴스: 오늘 교육 이슈를 짧게 점검

매일 3분만 확인해도 상담 준비 시간이 크게 줄어듭니다.
실무에서 바로 쓸 수 있는 정보 위주로 운영하겠습니다.`,
  },
  {
    title: '[공지] 자료실 활용법: 상담 전 체크리스트부터 다운로드하세요',
    content: `자료실은 "바로 현장 적용"을 기준으로 운영됩니다.

- 추천 시작 자료: 학부모 상담 체크리스트 / 과목별 상담 템플릿 / 주간 학습 루틴표
- 사용 팁: 원생 상태(성적·습관·목표)별로 1장씩 출력해 상담 전 확인
- 권장 방식: 자료실 다운로드 → 전칠판으로 공유 → 상담 후 카톡 요약 전달

필요한 자료가 없으면 자료공유 게시판에 요청 글을 남겨주세요.`,
  },
  {
    title: '[공지] 인사이트 활용법: 학부모 상담 멘트는 이렇게 준비하세요',
    content: `인사이트는 '설명 자료'가 아니라 '상담 실행 자료'로 보시면 좋습니다.

- 상담 전: 오늘 이슈 1개 선택
- 상담 중: 핵심 요약 2~3문장 전달
- 상담 후: 다음 액션(과제·루틴·점검일) 1개 확정

원장님이 바로 말할 수 있도록 핵심 문장 중심으로 계속 보강하겠습니다.`,
  },
  {
    title: '[공지] 뉴스 활용법: 오늘 상담에 필요한 이슈만 빠르게 확인',
    content: `뉴스 섹션은 분량보다 "상담 적용성"을 우선합니다.

- 전부 읽지 않아도 됩니다.
- 오늘 상담과 관련된 이슈 1개만 골라 확인하세요.
- 인사이트와 함께 보면 학부모 질문 대응이 훨씬 쉬워집니다.

과도한 정보보다, 바로 답변 가능한 정보가 목표입니다.`,
  },
  {
    title: '[공지] 권장 루틴: 매일 아침 8~10분 전칠판 점검 방법',
    content: `운영팀 권장 루틴입니다.

1) 뉴스 2분: 오늘 이슈 확인
2) 인사이트 3분: 상담 멘트/요약 점검
3) 자료실 3분: 오늘 필요한 템플릿 다운로드

이 루틴만 유지해도 상담 준비와 학부모 커뮤니케이션의 일관성이 크게 좋아집니다.
필요한 개선 요청은 자유게시판에 남겨주세요.`,
  },
]

async function getWriter() {
  const { data: adminUsers, error: adminError } = await supabase
    .from('users')
    .select('id, nickname, email, role')
    .eq('role', 'admin')
    .limit(1)

  if (adminError) {
    throw new Error(`관리자 조회 실패: ${adminError.message}`)
  }

  if (adminUsers && adminUsers.length > 0) {
    return adminUsers[0]
  }

  const { data: fallbackUser, error: fallbackError } = await supabase
    .from('users')
    .select('id, nickname, email, role')
    .limit(1)
    .single()

  if (fallbackError || !fallbackUser) {
    throw new Error('작성자 계정을 찾을 수 없습니다.')
  }

  return fallbackUser
}

async function run() {
  const writer = await getWriter()
  console.log(`작성자: ${writer.nickname || writer.email} (${writer.id})`)

  let created = 0
  let skipped = 0

  for (const notice of NOTICES) {
    const { data: exists } = await supabase
      .from('posts')
      .select('id')
      .eq('board_type', 'notice')
      .eq('title', notice.title)
      .limit(1)

    if (exists && exists.length > 0) {
      skipped += 1
      console.log(`- SKIP: ${notice.title}`)
      continue
    }

    const { data: inserted, error: insertError } = await supabase
      .from('posts')
      .insert({
        board_type: 'notice',
        title: notice.title,
        content: notice.content,
        author_id: writer.id,
        images: null,
        likes_count: 0,
        comments_count: 0,
      })
      .select('id, title')
      .single()

    if (insertError) {
      throw new Error(`공지 등록 실패: ${notice.title} / ${insertError.message}`)
    }

    created += 1
    console.log(`- CREATED #${inserted.id}: ${inserted.title}`)
  }

  console.log(`완료: 생성 ${created}건 / 중복 스킵 ${skipped}건`)
}

run().catch((error) => {
  console.error(error.message || error)
  process.exit(1)
})
