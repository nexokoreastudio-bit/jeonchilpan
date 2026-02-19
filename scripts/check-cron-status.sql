-- Supabase pg_cron 스케줄 상태 확인 스크립트
-- Supabase SQL Editor에서 실행하세요

-- ============================================
-- 1. 실행 중인 스케줄 확인
-- ============================================
SELECT 
  jobid,
  jobname,
  schedule,
  command,
  nodename,
  nodeport,
  database,
  username,
  active,
  jobid::text as job_id_text
FROM cron.job
WHERE jobname = 'daily-news-crawl';

-- ============================================
-- 2. 최근 실행 이력 확인 (최근 10개)
-- ============================================
SELECT 
  runid,
  jobid,
  job_pid,
  database,
  username,
  command,
  status,
  return_message,
  start_time,
  end_time,
  CASE 
    WHEN end_time IS NOT NULL THEN 
      EXTRACT(EPOCH FROM (end_time - start_time))::numeric(10,2) || ' 초'
    ELSE 
      '실행 중...'
  END as duration
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'daily-news-crawl' LIMIT 1)
ORDER BY start_time DESC
LIMIT 10;

-- ============================================
-- 3. 함수 존재 확인
-- ============================================
SELECT 
  proname as function_name,
  pg_get_functiondef(oid) as function_definition
FROM pg_proc
WHERE proname = 'trigger_daily_crawl';

-- ============================================
-- 4. 확장 활성화 확인
-- ============================================
SELECT 
  extname as extension_name,
  extversion as version
FROM pg_extension
WHERE extname IN ('pg_cron', 'http');

-- ============================================
-- 5. 수동 테스트 실행 (선택사항)
-- ============================================
-- 아래 주석을 해제하여 수동으로 크롤링을 실행할 수 있습니다
-- SELECT trigger_daily_crawl();

