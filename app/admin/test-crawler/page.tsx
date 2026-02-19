'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface TestResult {
  source: string
  rssUrl: string | null
  status: 'success' | 'error' | 'pending'
  count: number
  error?: string
  items?: Array<{ title: string; category: string }>
}

export default function TestCrawlerPage() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])
  const [sources, setSources] = useState<any[]>([])

  const fetchSources = async () => {
    try {
      const response = await fetch('/api/crawl-news?limit=1')
      const data = await response.json()
      
      // 뉴스 소스는 별도로 가져와야 하지만, 여기서는 간단히 테스트
      return []
    } catch (error) {
      console.error('소스 가져오기 실패:', error)
      return []
    }
  }

  const testRssFeed = async (rssUrl: string, sourceName: string): Promise<TestResult> => {
    try {
      const response = await fetch(`/api/test-rss?url=${encodeURIComponent(rssUrl)}&source=${encodeURIComponent(sourceName)}`)
      const data = await response.json()
      
      if (data.success) {
        return {
          source: sourceName,
          rssUrl,
          status: 'success',
          count: data.count || 0,
          items: data.items || [],
        }
      } else {
        return {
          source: sourceName,
          rssUrl,
          status: 'error',
          count: 0,
          error: data.error || '알 수 없는 오류',
        }
      }
    } catch (error: any) {
      return {
        source: sourceName,
        rssUrl,
        status: 'error',
        count: 0,
        error: error?.message || '네트워크 오류',
      }
    }
  }

  const handleTest = async () => {
    setTesting(true)
    setResults([])

    // 테스트할 RSS URL 목록
    const testSources = [
      { name: '조선일보', url: 'https://www.chosun.com/site/data/rss/education.xml' },
      { name: '연합뉴스', url: 'https://www.yna.co.kr/rss/society/education.xml' },
      { name: '중앙일보', url: 'https://rss.joongang.co.kr/education.xml' },
      { name: '동아일보', url: 'https://www.donga.com/rss/news/education.xml' },
    ]

    const testResults: TestResult[] = []

    for (const source of testSources) {
      const result: TestResult = {
        source: source.name,
        rssUrl: source.url,
        status: 'pending',
        count: 0,
      }
      testResults.push(result)
      setResults([...testResults])

      const testResult = await testRssFeed(source.url, source.name)
      testResults[testResults.length - 1] = testResult
      setResults([...testResults])
    }

    setTesting(false)
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">크롤링 기능 테스트</h1>
        <p className="text-gray-600">RSS 피드 크롤링 기능을 테스트합니다.</p>
      </div>

      <div className="mb-6">
        <Button
          onClick={handleTest}
          disabled={testing}
          className="bg-nexo-navy hover:bg-nexo-navy/90"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${testing ? 'animate-spin' : ''}`} />
          {testing ? '테스트 중...' : '크롤링 테스트 시작'}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-4">테스트 결과</h2>
          {results.map((result, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {result.status === 'pending' && (
                    <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
                  )}
                  {result.status === 'success' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {result.status === 'error' && (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <h3 className="text-lg font-bold">{result.source}</h3>
                </div>
                {result.status === 'success' && (
                  <Badge className="bg-green-100 text-green-800">
                    {result.count}개 기사
                  </Badge>
                )}
                {result.status === 'error' && (
                  <Badge className="bg-red-100 text-red-800">
                    실패
                  </Badge>
                )}
              </div>

              {result.rssUrl && (
                <p className="text-sm text-gray-600 mb-2">
                  RSS URL: <code className="bg-gray-100 px-2 py-1 rounded">{result.rssUrl}</code>
                </p>
              )}

              {result.status === 'error' && result.error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    {result.error}
                  </p>
                </div>
              )}

              {result.status === 'success' && result.items && result.items.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold mb-2">샘플 기사:</p>
                  <ul className="space-y-2">
                    {result.items.slice(0, 3).map((item, idx) => (
                      <li key={idx} className="text-sm text-gray-700">
                        <Badge variant="outline" className="mr-2 text-xs">
                          {item.category}
                        </Badge>
                        {item.title.substring(0, 60)}...
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-bold text-blue-900 mb-2">💡 테스트 안내</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>이 페이지는 RSS 피드 크롤링 기능을 테스트합니다.</li>
          <li>각 신문사의 RSS 피드에 접근하여 교육 관련 기사를 찾습니다.</li>
          <li>실제 크롤링을 실행하려면 <code className="bg-blue-100 px-1 rounded">/admin/crawled-news</code> 페이지를 사용하세요.</li>
        </ul>
      </div>
    </div>
  )
}

