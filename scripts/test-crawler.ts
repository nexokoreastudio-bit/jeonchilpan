/**
 * 크롤링 기능 테스트 스크립트
 * 실행 방법: npx tsx scripts/test-crawler.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
import { parseRssFeed, crawlNewsFromHtml, categorizeNews } from '../lib/utils/news-crawler'

// .env.local 파일 로드
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
} else {
  console.warn('⚠️  .env.local 파일을 찾을 수 없습니다.')
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function testCrawler() {
  console.log('🧪 크롤링 기능 테스트 시작\n')

  // 1. 뉴스 소스 확인
  console.log('1️⃣ 뉴스 소스 확인 중...')
  const { data: sources, error: sourcesError } = await supabase
    .from('news_sources')
    .select('*')
    .eq('is_active', true)

  if (sourcesError) {
    console.error('❌ 뉴스 소스 조회 실패:', sourcesError)
    return
  }

  if (!sources || sources.length === 0) {
    console.error('❌ 활성화된 뉴스 소스가 없습니다.')
    console.log('💡 scripts/create-crawled-news-tables.sql 파일을 실행하세요.')
    return
  }

  console.log(`✅ ${sources.length}개의 활성화된 뉴스 소스를 찾았습니다:\n`)
  sources.forEach((source, index) => {
    console.log(`   ${index + 1}. ${source.name}`)
    console.log(`      URL: ${source.base_url}`)
    console.log(`      RSS: ${source.rss_url || '없음'}`)
    console.log('')
  })

  // 2. RSS 피드 테스트
  console.log('2️⃣ RSS 피드 테스트 중...\n')
  for (const source of sources) {
    if (!source.rss_url) {
      console.log(`⏭️  ${source.name}: RSS URL이 없어 건너뜁니다.\n`)
      continue
    }

    console.log(`📡 ${source.name} RSS 피드 테스트: ${source.rss_url}`)
    try {
      const items = await parseRssFeed(source.rss_url, source.name)
      console.log(`   ✅ ${items.length}개의 기사를 찾았습니다.`)
      
      if (items.length > 0) {
        console.log(`   📰 샘플 기사:`)
        items.slice(0, 3).forEach((item, idx) => {
          console.log(`      ${idx + 1}. [${item.category}] ${item.title.substring(0, 50)}...`)
        })
      }
      console.log('')
    } catch (error: any) {
      console.error(`   ❌ 실패: ${error?.message || error}\n`)
    }
  }

  // 3. 카테고리 분류 테스트
  console.log('3️⃣ 카테고리 분류 테스트 중...\n')
  const testTitles = [
    '2024 수능 개편안 발표, 주요 변경사항 공개',
    '대학생 취업률 전년 대비 5% 상승',
    '교육부, 온라인 학습 플랫폼 지원 확대',
    '학원가 입시 상담 수요 증가',
  ]

  testTitles.forEach(title => {
    const category = categorizeNews(title)
    console.log(`   "${title}" → ${category}`)
  })
  console.log('')

  // 4. 데이터베이스 저장 테스트 (선택사항)
  console.log('4️⃣ 데이터베이스 저장 테스트 (건너뜀 - 실제 크롤링은 API를 통해 실행하세요)\n')

  // 5. 기존 크롤링된 뉴스 확인
  console.log('5️⃣ 기존 크롤링된 뉴스 확인 중...')
  const { data: existingNews, error: newsError } = await supabase
    .from('crawled_news')
    .select('id, title, source, category, crawled_at')
    .order('crawled_at', { ascending: false })
    .limit(5)

  if (newsError) {
    console.error('❌ 크롤링된 뉴스 조회 실패:', newsError)
  } else if (existingNews && existingNews.length > 0) {
    console.log(`✅ 최근 크롤링된 뉴스 ${existingNews.length}개:\n`)
    existingNews.forEach((news, idx) => {
      const date = new Date(news.crawled_at).toLocaleString('ko-KR')
      console.log(`   ${idx + 1}. [${news.category}] ${news.title.substring(0, 40)}...`)
      console.log(`      출처: ${news.source} | 크롤링: ${date}`)
    })
  } else {
    console.log('ℹ️  크롤링된 뉴스가 없습니다.')
  }

  console.log('\n✅ 테스트 완료!')
  console.log('\n💡 실제 크롤링을 실행하려면:')
  console.log('   1. 관리자로 로그인')
  console.log('   2. http://localhost:3001/admin/crawled-news 접속')
  console.log('   3. "전체 크롤링 시작" 버튼 클릭')
}

testCrawler()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ 테스트 중 오류 발생:', error)
    process.exit(1)
  })

