-- Supabase pg_cron을 사용한 매일 자동 크롤링 설정 (간단 버전)
-- Supabase SQL Editor에서 실행하세요

-- ============================================
-- 방법 1: HTTP 확장을 사용하여 API 호출 (권장)
-- ============================================

-- 1. pg_cron 확장 활성화
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. http 확장 활성화 (Supabase에서 제공)
CREATE EXTENSION IF NOT EXISTS http;

-- 3. 크롤링 트리거 함수 생성
CREATE OR REPLACE FUNCTION trigger_daily_crawl()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cron_secret TEXT := 'rVrXQdukfPxyZ27uOXqFMhyOe3PRWyV/v6ryHASpBlg='; -- ⚠️ Netlify CRON_SECRET과 동일한 값으로 변경하세요
  api_url TEXT := 'https://daily-nexo.netlify.app/api/crawl-news';
  response http_response;
BEGIN
  -- HTTP POST 요청 실행
  SELECT * INTO response
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
  
  -- 결과 로깅
  RAISE NOTICE '크롤링 API 호출 완료. Status: %', response.status;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING '크롤링 API 호출 실패: %', SQLERRM;
END;
$$;

-- 4. 매일 자동 실행 스케줄 설정
-- 매일 한국 시간 오전 9시 (UTC 0시)에 실행
SELECT cron.schedule(
  'daily-news-crawl',           -- 작업 이름
  '0 0 * * *',                  -- Cron 표현식: 매일 UTC 0시
  $$SELECT trigger_daily_crawl();$$
);

-- ============================================
-- 확인 및 관리
-- ============================================

-- 실행 중인 스케줄 확인
SELECT 
  jobid,
  schedule,
  command,
  nodename,
  nodeport,
  database,
  username,
  active
FROM cron.job
WHERE jobname = 'daily-news-crawl';

-- 최근 실행 이력 확인
SELECT 
  jobid,
  runid,
  job_pid,
  database,
  username,
  command,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'daily-news-crawl')
ORDER BY start_time DESC
LIMIT 10;

-- ============================================
-- 스케줄 관리
-- ============================================

-- 스케줄 일시 중지
-- SELECT cron.unschedule('daily-news-crawl');

-- 스케줄 재시작 (다른 시간으로)
-- SELECT cron.unschedule('daily-news-crawl');
-- SELECT cron.schedule(
--   'daily-news-crawl',
--   '0 1 * * *',  -- UTC 1시 (한국 시간 10시)
--   $$SELECT trigger_daily_crawl();$$
-- );

-- 스케줄 완전 삭제
-- SELECT cron.unschedule('daily-news-crawl');
-- DROP FUNCTION IF EXISTS trigger_daily_crawl();

