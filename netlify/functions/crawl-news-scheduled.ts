// Netlify Scheduled Function: 매일 자동으로 뉴스 크롤링 실행
// 참고: Netlify Scheduled Functions는 Pro 플랜 이상에서만 사용 가능할 수 있습니다.
// 무료 플랜인 경우 외부 Cron 서비스(cron-job.org 등)를 사용하세요.

exports.handler = async (event: { source?: string }, _context: unknown) => {
  // Netlify Scheduled Functions는 event.source가 'netlify-scheduled'입니다
  if (event.source !== 'netlify-scheduled') {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: 'Unauthorized' }),
    }
  }

  try {
    // 크롤링 API 호출
    const baseUrl = process.env.URL || process.env.DEPLOY_URL || 'https://jeonchilpan.netlify.app'
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key'
    
    const response = await fetch(`${baseUrl}/api/crawl-news`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cronSecret}`,
      },
      body: JSON.stringify({}),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || '크롤링 실패')
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: '크롤링 완료',
        data,
      }),
    }
  } catch (error) {
    console.error('스케줄된 크롤링 실패:', error)
    const message = error instanceof Error ? error.message : '크롤링 중 오류 발생'
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: message }),
    }
  }
}

