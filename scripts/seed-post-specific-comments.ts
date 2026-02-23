/**
 * 게시글별 관련 댓글 시드 (기존 댓글 삭제 후 재생성)
 * - 각 게시글 제목/내용에 맞는 댓글만 추가
 *
 * 실행: npx tsx scripts/seed-post-specific-comments.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

/** 키워드 매칭 → 해당 게시글에 어울리는 댓글 풀 */
const TOPIC_COMMENTS: Array<{ keywords: string[]; comments: string[] }> = [
  {
    keywords: ['전자칠판 도입', '학원 분위기', '넥소 전자칠판'],
    comments: [
      '저도 도입한 지 3개월 됐는데 학생들 반응 정말 좋아요!',
      '투자 부담 있으셨죠. 저도 같은 고민 했는데 지금은 만족합니다.',
      '학부모님들 오픈하우스 때 보여드리니까 호응 좋더라고요.',
      '집중도 확 올라가는 거 느껴지시죠? 저희도 그래요.',
      '추천하시는 것처럼 저희도 잘한 결정이었어요.',
      '인테리어랑 어울려서 분위기 많이 바뀌었죠?',
    ],
  },
  {
    keywords: ['신학기', '준비'],
    comments: [
      '저희도 신학기 준비 한창이에요. 할인 이벤트 좋은 아이디어네요!',
      '벌써 2월이네요. 저희는 학부모 상담 자료 준비 중이에요.',
      '다른 분들 어떻게 하시는지 항상 궁금했어요. 공유 감사합니다.',
      '신규 입학생 맞춤 프로그램 어떻게 하시는지 궁금해요.',
      '저희 학원도 특별 이벤트 준비 중인데 참고할게요!',
      '상담 자료 여기 자료실에서 많이 활용하고 있어요.',
    ],
  },
  {
    keywords: ['수학 진도표', '진도표', '진도 관리'],
    comments: [
      '진도표 템플릿 부탁드려요! 전자칠판에 띄우기 딱 좋겠네요.',
      '월별 단원별 정리 요즘 필수죠. 잘 만들고 계시네요.',
      '자료 공유해주셔서 감사해요. 한번 활용해볼게요!',
      '중1 진도 관리 템플릿 필요했는데 감사합니다.',
      '큰 화면에 띄워서 수업에 쓰면 효과 좋을 것 같아요.',
      '댓글로 요청드립니다. 자료 부탁해요!',
    ],
  },
  {
    keywords: ['학부모 상담', '상담 시', '유의사항'],
    comments: [
      '상담 전 데이터 정리 진짜 중요하죠. 저도 그렇게 하고 있어요.',
      '개선 방안 함께 제시하는 팁 좋네요. 적용해볼게요.',
      '구체적 데이터 보여드리면 신뢰도 확 올라가더라고요.',
      '문제점만 말하면 학부모님 기분 나쁘시잖아요. 균형 중요해요.',
      '저희도 비슷하게 상담 진행하는데 참고가 됐어요.',
      '학생 현황 정리해두는 게 상담 품질에 큰 차이 나요.',
    ],
  },
  {
    keywords: ['온라인', '오프라인', '병행', '플랫폼'],
    comments: [
      '저희도 온라인 병행 검토 중이에요. 플랫폼 추천 부탁해요.',
      '커리큘럼 구성 어떻게 하시는지 궁금합니다. 공유해주실 수 있나요?',
      '요즘 필수 스킬인 것 같아요. 도입 고민 중인데 참고할게요.',
      '하이브리드 수업 많이 하시나요? 비율이 궁금해요.',
      '저희 지역에서는 아직 오프라인 위주인데 준비해볼게요.',
      '플랫폼 비용 부담되시나요? 비교해보고 싶어요.',
    ],
  },
  {
    keywords: ['입시 설명회', 'PPT', '템플릿'],
    comments: [
      '입시 PPT 템플릿 필요했는데 감사해요! 설명회 때 쓰겠습니다.',
      '수시 정시 변동사항 반영해주시면 너무 좋겠어요.',
      '전자칠판에 띄워서 설명하기 딱이겠네요. 부탁드립니다.',
      '학부모님들께 보여드리기 좋은 자료 찾고 있었어요.',
      '2025 입시 변동사항 잘 반영해주시면 참고할게요!',
      '자료실에 올려주시면 많은 분들이 활용하실 거예요.',
    ],
  },
  {
    keywords: ['학생 집중도', '수업 팁', '집중'],
    comments: [
      '시각 자료 활용 정말 효과 좋죠. 저도 계속 쓰고 있어요.',
      '50분 수업에 휴식 넣는 거 저희도 적용 중이에요!',
      '질문 유도 팁 좋네요. 실생활 연계 설명도 도움 됩니다.',
      '분위기 좋아지는 거 체감되시죠? 저희도 그랬어요.',
      '중간 휴식 넣으니 집중도 확 올라가더라고요.',
      '이렇게 체계적으로 정리해주시니 감사합니다.',
    ],
  },
  {
    keywords: ['구독자 인증', '인증 요청', '시리얼'],
    comments: [
      '인증 빨리 진행해주시면 감사하겠습니다.',
      '마이페이지에서 신청했는데 확인 부탁드려요.',
      '구매 직후 인증 요청합니다. 검토 부탁드립니다.',
      '넥소 전자칠판 인증 요청드립니다.',
      '인증 절차 알려주시면 감사하겠습니다.',
      '시리얼 번호 입력했는데 검토 부탁해요.',
    ],
  },
  {
    keywords: ['숙제 관리', '숙제 체크', '제출률'],
    comments: [
      '스티커 보상 시스템 저희도 고민했는데 효과 어떠신가요?',
      '숙제 체크 앱 추천 부탁해요. 난이도 조절이 핵심이죠.',
      '제출률 올리는 방법 항상 고민이에요. 참고할게요.',
      '피드백 제공 어떻게 하시는지 궁금해요.',
      '저희 학원도 비슷한 시스템 도입 검토 중이에요.',
      '학생들 반응 좋으신가요? 적용해보고 싶네요.',
    ],
  },
  {
    keywords: ['영단어', '암기장', '양식'],
    comments: [
      'Day별 단어 암기 양식 부탁해요. A4 20개 좋네요.',
      '출력해서 쓰기 vs 화면에 띄우기 둘 다 활용하면 좋겠어요.',
      '수업에 활용하기 좋은 양식 찾고 있었어요. 감사합니다.',
      '전자칠판에 띄워서 단어 테스트하면 좋을 것 같아요.',
      '자료 공유해주셔서 감사해요. 잘 쓰겠습니다.',
      '20개 단어 양식 딱 적당한 분량이에요.',
    ],
  },
  {
    keywords: ['등록금', '정책', '가격'],
    comments: [
      '등록금 책정 참 어렵죠. 지역 평균 어떻게 조사하셨나요?',
      '신규 학원이라 정책 세우는 중인데 참고가 됐어요.',
      '가격대 다양하잖아요. 기준 어떻게 잡으셨는지 궁금해요.',
      '경험 있으신 분들 조언 정말 필요했어요. 감사합니다.',
      '저희 지역 시세 조사하는 방법 알려주실 수 있나요?',
      '등록금 vs 서비스 밸런스 어떻게 맞추시는지 궁금해요.',
    ],
  },
  {
    keywords: ['화면 안 나올', '전자칠판 화면', '재부팅'],
    comments: [
      '저도 가끔 그런 증상 있어요. 케이블 문제일 때가 많더라고요.',
      'HDMI 케이블 교체해보세요. 저도 그렇게 해결했어요.',
      '재부팅 말고 그레이스 풀 파워 오프 해보시는 것도 방법이에요.',
      '수업 중에 나가면 정말 당황스럽죠. 백업 수단 준비해두세요.',
      '드라이버 업데이트도 한번 확인해보세요.',
      '혹시 케이블 길이 문제일 수도 있어요. 짧은 걸로 테스트해보세요.',
    ],
  },
  {
    keywords: ['수학 기하', '기하 단원', '정리 자료'],
    comments: [
      '중2 기하 단원 자료 부탁해요. 도형별 정리 좋네요.',
      '연습문제 포함이면 복습용으로 딱이겠어요.',
      '전자칠판에 띄워서 설명하면 효과 좋을 것 같아요.',
      '기하 단원 요약 잘 되어있으면 수업 준비 편하죠.',
      '자료 공유해주셔서 감사합니다. 활용할게요!',
      '도형별 정리 자료 찾고 있었어요. 부탁드립니다.',
    ],
  },
  {
    keywords: ['학원 인테리어', '리모델링', '공간 활용'],
    comments: [
      '전자칠판 설치하고 공간 활용 확 좋아지죠. 저희도 그래요.',
      '오픈하우스 때 학부모님들 반응 어떠셨나요?',
      '학생들 만족도 높으시죠? 저희 학원도 리모델링 고민 중이에요.',
      '인테리어 before/after 공유해주시면 참고하고 싶어요.',
      '공간 활용 팁 더 있으시면 알려주세요!',
      '전자칠판이 분위기 바꾸는 데 큰 역할 하더라고요.',
    ],
  },
  {
    keywords: ['SNS', '마케팅', '유치', '인스타', '블로그'],
    comments: [
      'SNS 마케팅 고민 중이에요. 인스타 운영하시는 분 계신가요?',
      '지역 학원이라 온라인 유치 어렵죠. 공감해요.',
      '블로그 vs 인스타 어떤 게 효과 더 좋으신가요?',
      '경험담 들을 수 있으면 정말 도움 될 것 같아요.',
      '지역型 학원 SNS 전략 궁금해요. 공유해주세요!',
      '저희도 온라인 유치 시작하려는데 막막해요.',
    ],
  },
  {
    keywords: ['상담 체크리스트', '체크리스트'],
    comments: [
      '상담 전 준비 체크리스트 정말 필요했어요. 부탁드립니다.',
      '학생 현황, 목표, 상담 포인트 정리 너무 좋네요.',
      '화면에 띄워두고 상담하면 편하겠어요.',
      '출력해서 쓰기 vs 디지털 활용 둘 다 있으면 좋겠어요.',
      '상담 품질 올리는 데 체크리스트 큰 도움 됩니다.',
      '자료 공유해주시면 감사히 쓰겠습니다.',
    ],
  },
  {
    keywords: ['퇴근 후', '연락', '경계', '업무 시간'],
    comments: [
      '공감해요. 경계 설정 어떻게 하시는지 궁금해요.',
      '저희도 공지로 안내했는데 일부는 계속 밤에 연락 오시더라고요.',
      '업무 시간 외 연락 원칙 정해두신 학원 있으신가요?',
      '이 부분 진짜 힘들죠. 좋은 방법 있으면 공유 부탁해요.',
      '전화 vs 카톡 구분해서 안내하시나요?',
      '경계 설정 팁 공유해주시면 감사하겠습니다.',
    ],
  },
  {
    keywords: ['결석', '상담 진행'],
    comments: [
      '저희도 2회 연속이면 연락드리고 있어요. 비슷하네요.',
      '몇 번 결석 시 상담 기준 각 학원마다 다르죠. 궁금했어요.',
      '갑작스러운 결석 대응 방법 공유해주시면 감사해요.',
      '결석 패턴 보면서 조기 개입하는 게 중요하다고 생각해요.',
      '다른 학원들은 어떤 기준으로 하시는지 항상 궁금했어요.',
      '2회 연속이 적당한 것 같아요. 저희도 그렇게 하고 있어요.',
    ],
  },
  {
    keywords: ['월간 진도', '진도 시트', '엑셀'],
    comments: [
      '월간 진도 관리 시트 부탁해요. 교재별 단원 체크 필요해요.',
      '한 달 단위로 정리해두면 관리 편하죠.',
      '학습 현황 한눈에 보는 시트 찾고 있었어요.',
      '엑셀 시트 공유해주시면 감사하겠습니다.',
      '진도 관리가 체계적으로 되면 수업 품질이 올라가요.',
      '자료 부탁드립니다. 활용 잘 할게요!',
    ],
  },
  {
    keywords: [], // 기본 (매칭 안 될 때)
    comments: [
      '좋은 정보 감사합니다. 참고할게요.',
      '공감해요. 저도 비슷한 고민이 있어요.',
      '도움 되었어요. 감사합니다!',
      '다른 분들 의견도 궁금해요.',
      '여기 커뮤니티에서 정말 많은 걸 배우고 있어요.',
      '실제 경험담 들어보니 도움 됩니다.',
    ],
  },
]

function getCommentsForPost(title: string, content: string, count: number): string[] {
  const text = `${title} ${content}`.toLowerCase()
  const pools: string[] = []

  for (const topic of TOPIC_COMMENTS) {
    if (topic.keywords.length === 0) continue
    const matched = topic.keywords.some((k) => text.includes(k.toLowerCase()))
    if (matched) pools.push(...topic.comments)
  }

  const pool = pools.length > 0 ? pools : TOPIC_COMMENTS.find((t) => t.keywords.length === 0)!.comments
  const result: string[] = []
  const used = new Set<number>()
  for (let i = 0; i < count; i++) {
    let idx = Math.floor(Math.random() * pool.length)
    let attempts = 0
    while (used.has(idx) && attempts < pool.length) {
      idx = (idx + 1) % pool.length
      attempts++
    }
    used.add(idx)
    result.push(pool[idx])
  }
  return result
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function main() {
  console.log('=== 게시글별 관련 댓글 시드 ===\n')

  const { data: users } = await supabase.from('users').select('id, email').limit(50)
  const userIds = (users || [])
    .filter((u) => u.email !== 'nexo.korea.studio@gmail.com')
    .map((u) => u.id)
  if (userIds.length === 0) {
    console.error('사용자가 없습니다.')
    process.exit(1)
  }

  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, content, comments_count')
    .gt('comments_count', 0)
    .order('created_at', { ascending: false })

  if (error || !posts?.length) {
    console.log('댓글이 필요한 게시물이 없습니다.')
    return
  }

  let totalDeleted = 0
  let totalAdded = 0

  for (const post of posts) {
    // 1. 기존 댓글 삭제
    const { data: deleted } = await supabase
      .from('comments')
      .delete()
      .eq('post_id', post.id)
      .select('id')
    const deletedCount = deleted?.length ?? 0
    totalDeleted += deletedCount

    if (deletedCount > 0) {
      console.log(`[${post.id}] ${post.title.slice(0, 35)}... — 기존 댓글 ${deletedCount}개 삭제`)
    }

    // 2. 게시글에 맞는 댓글 새로 추가
    const commentsToAdd = getCommentsForPost(post.title, post.content || '', post.comments_count)
    const now = new Date()

    for (let i = 0; i < commentsToAdd.length; i++) {
      const authorId = userIds[i % userIds.length]
      const createdAt = new Date(now)
      createdAt.setHours(createdAt.getHours() - (commentsToAdd.length - i) * 2)

      const { error: insErr } = await supabase.from('comments').insert({
        post_id: post.id,
        author_id: authorId,
        content: commentsToAdd[i],
        created_at: createdAt.toISOString(),
        updated_at: createdAt.toISOString(),
      })

      if (insErr) {
        console.log(`    ✗ 댓글 ${i + 1}: ${insErr.message}`)
      } else {
        totalAdded++
      }
      await sleep(80)
    }

    console.log(`    → ${commentsToAdd.length}개 관련 댓글 추가`)
  }

  console.log(`\n=== 완료: 삭제 ${totalDeleted}개, 추가 ${totalAdded}개 ===`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
