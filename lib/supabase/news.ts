/**
 * 크롤링된 뉴스 관련 Supabase 쿼리 함수
 */

import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'

type CrawledNews = Database['public']['Tables']['crawled_news']['Row']

/**
 * 뉴스 ID로 뉴스 정보 가져오기
 */
export async function getNewsById(newsId: number): Promise<CrawledNews | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('crawled_news')
    .select('*')
    .eq('id', newsId)
    .single()

  if (error) {
    console.error('뉴스 조회 실패:', error)
    return null
  }

  return data as CrawledNews
}

