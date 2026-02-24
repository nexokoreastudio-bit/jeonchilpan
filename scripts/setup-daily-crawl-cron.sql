-- Supabase pg_cron을 사용한 매일 자동 크롤링 설정
-- Supabase SQL Editor에서 실행하세요

-- ============================================
-- 1. pg_cron 확장 활성화 (이미 활성화되어 있을 수 있음)
-- ============================================
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================
-- 2. 크롤링을 실행할 PostgreSQL 함수 생성
-- ============================================
-- 이 함수는 HTTP 요청을 통해 크롤링 API를 호출합니다
CREATE OR REPLACE FUNCTION trigger_daily_crawl()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cron_secret TEXT;
  api_url TEXT;
  response_status INT;
  response_body TEXT;
BEGIN
  -- 환경 변수에서 CRON_SECRET 가져오기 (또는 직접 설정)
  -- Supabase에서는 환경 변수를 직접 사용할 수 없으므로
  -- 여기에 직접 시크릿 키를 입력하거나, 별도 테이블에 저장
  cron_secret := 'your-cron-secret-key-here'; -- Netlify 환경 변수와 동일한 값으로 변경
  
  -- API URL 설정
  api_url := 'https://jeonchilpan.netlify.app/api/crawl-news';
  
  -- HTTP 요청 실행
  SELECT status, content INTO response_status, response_body
  FROM http((
    'POST',
    api_url,
    ARRAY[
      http_header('Content-Type', 'application/json'),
      http_header('Authorization', 'Bearer ' || cron_secret)
    ],
    'application/json',
    '{}'
  )::http_request);
  
  -- 결과 로깅 (선택사항)
  RAISE NOTICE 'Crawl API 호출 완료. Status: %, Response: %', response_status, response_body;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '크롤링 API 호출 실패: %', SQLERRM;
END;
$$;

-- ============================================
-- 3. 매일 자동 실행 스케줄 설정
-- ============================================
-- 매일 한국 시간 오전 9시 (UTC 0시)에 실행
-- Cron 표현식: 분 시 일 월 요일
SELECT cron.schedule(
  'daily-news-crawl',           -- 작업 이름
  '0 0 * * *',                  -- 매일 UTC 0시 (한국 시간 9시)
  $$SELECT trigger_daily_crawl();$$
);

-- ============================================
-- 4. 스케줄 확인
-- ============================================
-- 실행 중인 스케줄 확인
SELECT * FROM cron.job;

-- 스케줄 실행 이력 확인
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 10;

-- ============================================
-- 5. 스케줄 관리 명령어
-- ============================================

-- 스케줄 일시 중지
-- SELECT cron.unschedule('daily-news-crawl');

-- 스케줄 재시작
-- SELECT cron.schedule(
--   'daily-news-crawl',
--   '0 0 * * *',
--   $$SELECT trigger_daily_crawl();$$
-- );

-- 스케줄 삭제
-- SELECT cron.unschedule('daily-news-crawl');

