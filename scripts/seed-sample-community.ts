/**
 * 샘플 커뮤니티 활성화 시드
 * - 10명 가입자 생성 (auth.users + public.users)
 * - 20개 공개 커뮤니티 게시글 (전칠판)
 * - 15개 시연/견적 문의 (실시간 현황용)
 *
 * 실행: npx tsx scripts/seed-sample-community.ts
 * 환경변수: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (.env.local)
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, '..', '.env.local') })
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceKey) {
  console.error('NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 필요')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// 10명 샘플 가입자 (닉네임, 학원명)
const SAMPLE_USERS = [
  { nickname: '김원장', academy: '서울숲 수학학원', email: 'sample1@nexodaily.kr' },
  { nickname: '이학장', academy: '강남 영어학원', email: 'sample2@nexodaily.kr' },
  { nickname: '박쌤', academy: '분당 과학학원', email: 'sample3@nexodaily.kr' },
  { nickname: '최원장님', academy: '잠실 입시학원', email: 'sample4@nexodaily.kr' },
  { nickname: '정수진', academy: '홍대 국어학원', email: 'sample5@nexodaily.kr' },
  { nickname: '한민수', academy: '수원 코딩학원', email: 'sample6@nexodaily.kr' },
  { nickname: '오학장', academy: '인천 논술학원', email: 'sample7@nexodaily.kr' },
  { nickname: '윤정호', academy: '부산 영어학원', email: 'sample8@nexodaily.kr' },
  { nickname: '임서연', academy: '대전 수학학원', email: 'sample9@nexodaily.kr' },
  { nickname: '신동현', academy: '광주 과학학원', email: 'sample10@nexodaily.kr' },
]

// 20개 샘플 게시글 (board_type, title, content) - notice는 관리자 전용이므로 제외
const SAMPLE_POSTS = [
  { board_type: 'bamboo' as const, title: '넥소 전자칠판 도입 후 학원 분위기가 확 바뀌었어요', content: '안녕하세요. 작년 말 넥소 전자칠판 도입한 학원장입니다. 처음엔 투자 부담이 있었는데 지금은 정말 잘한 결정이에요. 학생들 집중도가 확실히 좋아졌고 학부모님 만족도도 올라갔어요. 추천합니다!' },
  { board_type: 'bamboo' as const, title: '신학기 준비 어떻게 하고 계신가요?', content: '벌써 2월이네요. 곧 신학기인데 준비하시는 분들 많으시죠? 저희 학원은 신규 입학생 특별 할인 이벤트 준비 중이에요. 다른 학원장님들 좋은 아이디어 공유해 주세요.' },
  { board_type: 'materials' as const, title: '중1 수학 진도표 템플릿 공유합니다', content: '중학교 1학년 수학 진도 관리용 템플릿 만들어 봤어요. 월별 단원별로 정리해 두었고 큰 화면에 띄워서 수업에 활용하기 좋아요. 필요하신 분은 댓글로 요청 주세요.' },
  { board_type: 'bamboo' as const, title: '학부모 상담 시 유의사항 몇 가지', content: '상담 전 학생 학습 현황 정리해 두시고, 구체적 데이터 보여드리면 신뢰도 올라갑니다. 문제점만 말씀하지 마시고 개선 방안도 함께 제시하시는 게 좋아요.' },
  { board_type: 'bamboo' as const, title: '온라인·오프라인 병행 운영 고민', content: '요즘 온라인 병행 학원 많더라구요. 저희도 도입 검토 중인데 플랫폼 추천 있으신가요? 커리큘럼 구성도 어떻게 하시는지 궁금해요.' },
  { board_type: 'materials' as const, title: '입시 설명회 PPT 템플릿 나눔', content: '학부모 설명회용 입시 정보 PPT 템플릿 만들었어요. 2025 수시 정시 변동사항 반영해 뒀고 전자칠판에 띄워서 설명하기 딱 좋습니다. 자료실에도 올려 둘게요.' },
  { board_type: 'bamboo' as const, title: '학생 집중도 높이는 수업 팁', content: '시각 자료 활용, 중간중간 질문 유도, 50분이면 2~3분 휴식 넣기. 실생활 연계 설명. 이렇게 해보니 분위기가 훨씬 좋아졌어요.' },
  { board_type: 'verification' as const, title: '구독자 인증 요청합니다', content: '넥소 전자칠판 구매 후 시리얼로 인증 요청드립니다. 마이페이지에서 신청했어요. 검토 부탁드립니다.' },
  { board_type: 'bamboo' as const, title: '숙제 관리 어떻게 하시나요?', content: '숙제 체크 앱 써보신 분 계신가요? 난이도 조절과 피드백 제공이 핵심인 것 같아요. 저희는 스티커 보상 시스템 도입했는데 제출률이 많이 올랐어요.' },
  { board_type: 'materials' as const, title: '영단어 암기장 양식 공유', content: 'Day별 단어 암기용 양식입니다. A4 한 장에 20개 단어 넣을 수 있게 했어요. 출력해서 쓰셔도 되고 화면에 띄워서 수업에 활용하셔도 돼요.' },
  { board_type: 'bamboo' as const, title: '학원 등록금 정책 조언 부탁', content: '신규 학원 운영하게 됐는데 등록금 어떻게 정하시는지 궁금해요. 지역 평균 조사했는데 가격대가 다양하더라구요. 경험 있으신 분 조언 부탁드립니다.' },
  { board_type: 'bamboo' as const, title: '전자칠판 화면 안 나올 때', content: '가끔 화면이 안 나올 때가 있어요. 케이블 확인했는데도요. 재부팅하면 되긴 하는데 수업 중엔 시간이 아까워서요. 더 간단한 해결법 아시는 분?' },
  { board_type: 'materials' as const, title: '수학 기하 단원 정리 자료', content: '중2 기하 단원 요약 정리해 뒀어요. 도형별로 정리했고 연습문제도 포함했습니다. 전자칠판에 띄워서 복습용으로 쓰기 좋아요.' },
  { board_type: 'bamboo' as const, title: '학원 인테리어 후기', content: '올해 초 리모델링했는데 전자칠판 설치하고 나니까 공간 활용이 훨씬 좋아졌어요. 학생들도 만족해 하고 학부모님들도 오픈 house 때 좋아하시더라구요.' },
  { board_type: 'bamboo' as const, title: '신규 학생 유치 방법', content: 'SNS 마케팅 하시는 분 계신가요? 인스타나 블로그 운영하시는 학원장님들 경험담 들을 수 있을까요? 지역 학원이라 온라인 유치가 어렵네요.' },
  { board_type: 'materials' as const, title: '학부모 상담 체크리스트', content: '상담 전 준비할 항목들 정리한 체크리스트예요. 학생 현황, 목표, 상담 포인트 등. 출력해서 쓰시거나 화면에 띄워 두시면 좋아요.' },
  { board_type: 'bamboo' as const, title: '퇴근 후에도 연락 오는 학부모님', content: '경계 설정 어떻게 하시는지... 업무 시간 외 연락에 대한 원칙 정해 두신 학원 있으신가요? 저희는 공지로 안내했는데 일부는 아직도 밤에 문자 오시더라구요.' },
  { board_type: 'verification' as const, title: '시리얼 인증 요청드립니다', content: '구매 직후 인증 요청합니다. 넥소 75인치 모델이에요. 확인 부탁드려요.' },
  { board_type: 'bamboo' as const, title: '갑작스러운 결석 대응', content: '몇 번 결석하면 상담 진행하시나요? 저희는 2회 연속이면 연락드리는데요. 다른 학원 분들은 어떤 기준으로 하시는지 궁금해요.' },
  { board_type: 'materials' as const, title: '월간 진도 관리 시트', content: '한 달 단위 진도 관리 엑셀 시트 공유해요. 교재별 단원 체크하고 학습 현황 한눈에 볼 수 있어요. 필요하시면 말씀 주세요.' },
]

// 15개 시연/견적 문의
const SAMPLE_LEADS = [
  { type: 'demo' as const, name: '김영수', email: 'kimys@academy.kr', academy: '서울숲 수학학원', region: '서울', message: '75인치 시연 문의합니다.' },
  { type: 'quote' as const, name: '이지훈', email: 'leejh@study.kr', academy: '강남 영어학원', size: '75', quantity: 2, message: '교실 2개 견적 요청해요.' },
  { type: 'demo' as const, name: '박미래', email: 'parkmr@edu.kr', academy: '분당 과학학원', region: '경기', message: '쇼룸 방문 예약 가능한가요?' },
  { type: 'quote' as const, name: '최동욱', email: 'chodw@learn.kr', academy: '잠실 입시학원', quantity: 3, message: '3대 동시 구매 견적 부탁합니다.' },
  { type: 'demo' as const, name: '정수빈', email: 'jungsb@academy.kr', academy: '홍대 국어학원', region: '서울', message: '주말 시연 가능할까요?' },
  { type: 'quote' as const, name: '한준호', email: 'hanjh@coding.kr', academy: '수원 코딩학원', size: '86', quantity: 1, message: '대형 강의실용 견적 요청드립니다.' },
  { type: 'demo' as const, name: '오세영', email: 'oosey@essay.kr', academy: '인천 논술학원', region: '인천', message: '논술 수업에 적합한 모델 시연 보고 싶어요.' },
  { type: 'quote' as const, name: '윤서현', email: 'yoonsh@english.kr', academy: '부산 영어학원', quantity: 1, message: '소형 교실 1대 견적 부탁드려요.' },
  { type: 'demo' as const, name: '임도현', email: 'limdh@math.kr', academy: '대전 수학학원', region: '대전', message: '검단 쇼룸 방문 예약하고 싶습니다.' },
  { type: 'quote' as const, name: '신유나', email: 'shinyn@science.kr', academy: '광주 과학학원', size: '75', quantity: 2, message: '2개 교실 동시 설치 견적 요청합니다.' },
  { type: 'demo' as const, name: '조민재', email: 'jomj@academy.kr', academy: '대구 입시학원', region: '대구', message: '전자칠판 시연 신청합니다.' },
  { type: 'quote' as const, name: '강지은', email: 'kangje@study.kr', academy: '울산 수학학원', quantity: 1, message: '1대 구매 견적 부탁드려요.' },
  { type: 'demo' as const, name: '황성민', email: 'hwangs@edu.kr', academy: '세종 영어학원', region: '세종', message: '주중 오전 시연 가능한지 문의드려요.' },
  { type: 'quote' as const, name: '서동현', email: 'seodh@learn.kr', academy: '창원 과학학원', size: '86', quantity: 4, message: '4개 교실 전체 설치 견적 요청합니다.' },
  { type: 'demo' as const, name: '배수정', email: 'baesj@academy.kr', academy: '전주 국어학원', region: '전북', message: '시연 예약 부탁드립니다.' },
]

const SAMPLE_PASSWORD = 'SampleUser123!'

async function main() {
  console.log('=== NEXO Daily 샘플 시드 시작 ===\n')

  // 1. 기존 샘플 사용자 확인 (중복 방지)
  const { data: existingUsers } = await supabase.from('users').select('id, email').like('email', 'sample%@nexodaily.kr')
  if (existingUsers && existingUsers.length > 0) {
    console.log(`기존 샘플 사용자 ${existingUsers.length}명 발견. 해당 계정으로 게시글/리드만 생성합니다.\n`)
  }

  let userIds: string[] = []
  if (existingUsers && existingUsers.length >= 10) {
    userIds = existingUsers.slice(0, 10).map(u => u.id)
  } else {
    // 2. 10명 auth 사용자 생성
    console.log('1. 샘플 사용자 10명 생성 중...')
    for (let i = 0; i < SAMPLE_USERS.length; i++) {
      const u = SAMPLE_USERS[i]
      const { data: authUser, error } = await supabase.auth.admin.createUser({
        email: u.email,
        password: SAMPLE_PASSWORD,
        email_confirm: true,
        user_metadata: {
          nickname: u.nickname,
          academy_name: u.academy,
          name: u.nickname
        }
      })
      if (error) {
        // 이미 존재하면 기존 사용자 사용
        if (error.message?.includes('already been registered')) {
          const { data: existing } = await supabase.from('users').select('id').eq('email', u.email).single()
          if (existing) userIds.push(existing.id)
        }
        console.log(`  [${i + 1}] ${u.nickname}: ${error.message}`)
      } else if (authUser?.user) {
        userIds.push(authUser.user.id)
        // public.users는 트리거로 생성됨. 닉네임/학원명 업데이트
        await supabase.from('users').update({ nickname: u.nickname, academy_name: u.academy }).eq('id', authUser.user.id)
        console.log(`  ✓ [${i + 1}] ${u.nickname} (${u.academy})`)
      }
      await sleep(200)
    }
    console.log(`\n생성된 사용자: ${userIds.length}명\n`)
  }

  if (userIds.length === 0) {
    console.error('사용할 사용자가 없습니다. 기존 사용자로 진행할까요?')
    const { data: anyUser } = await supabase.from('users').select('id').limit(1).single()
    if (anyUser) {
      userIds = [anyUser.id]
      console.log('기존 사용자 1명으로 대체합니다.')
    } else {
      process.exit(1)
    }
  }

  // 3. 20개 게시글 생성 (일부는 최근일자로 - NEW 배지용)
  console.log('2. 공개 커뮤니티 게시글 20개 생성 중...')
  const now = new Date()
  for (let i = 0; i < SAMPLE_POSTS.length; i++) {
    const post = SAMPLE_POSTS[i]
    const authorId = userIds[i % userIds.length]
    // 처음 8개는 이번 주(최근 7일), 나머지는 2주~1달 전
    const daysAgo = i < 8 ? Math.floor(Math.random() * 5) : 10 + Math.floor(Math.random() * 20)
    const createdAt = new Date(now)
    createdAt.setDate(createdAt.getDate() - daysAgo)

    const { error } = await supabase.from('posts').insert({
      board_type: post.board_type,
      title: post.title,
      content: post.content,
      author_id: authorId,
      likes_count: Math.floor(Math.random() * 15),
      comments_count: Math.floor(Math.random() * 8),
      created_at: createdAt.toISOString(),
      updated_at: createdAt.toISOString()
    })
    if (error) {
      console.log(`  ✗ [${i + 1}] ${post.title}: ${error.message}`)
    } else {
      console.log(`  ✓ [${i + 1}] [${post.board_type}] ${post.title}`)
    }
    await sleep(150)
  }
  console.log('')

  // 4. 15개 시연/견적 리드 생성 (최근일자로)
  console.log('3. 시연/견적 문의 15개 생성 중...')
  for (let i = 0; i < SAMPLE_LEADS.length; i++) {
    const lead = SAMPLE_LEADS[i]
    const daysAgo = Math.floor(Math.random() * 7) // 최근 7일
    const createdAt = new Date(now)
    createdAt.setDate(createdAt.getDate() - daysAgo)

    const { error } = await supabase.from('leads').insert({
      type: lead.type,
      name: lead.name,
      email: lead.email,
      academy_name: lead.academy,
      region: (lead as any).region,
      size: (lead as any).size,
      quantity: (lead as any).quantity,
      message: lead.message,
      status: 'pending',
      created_at: createdAt.toISOString(),
      updated_at: createdAt.toISOString()
    })
    if (error) {
      console.log(`  ✗ [${i + 1}] ${lead.type} ${lead.name}: ${error.message}`)
    } else {
      console.log(`  ✓ [${i + 1}] [${lead.type}] ${lead.name} - ${lead.academy}`)
    }
    await sleep(100)
  }

  console.log('\n=== 시드 완료 ===')
  console.log('- 공개 커뮤니티: /community')
  console.log('- 실시간 현황: 메인페이지 실시간 현황 섹션')
  console.log('- 샘플 사용자 비밀번호: ' + SAMPLE_PASSWORD)
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
