-- ============================================
-- Daily-Nexo 초기 DB 설정 - 01: 기본 테이블
-- 새 Supabase 프로젝트에서 1회 실행
-- ============================================

-- 1. 사용자 프로필 (구독자 인증 컬럼 포함)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  nickname TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('admin', 'teacher', 'academy_owner', 'user')) DEFAULT 'user',
  academy_name TEXT,
  referrer_code TEXT,
  point INTEGER DEFAULT 0,
  level TEXT CHECK (level IN ('bronze', 'silver', 'gold')) DEFAULT 'bronze',
  subscriber_verified BOOLEAN DEFAULT FALSE,
  purchase_serial_number TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  subscriber_verification_request BOOLEAN DEFAULT FALSE,
  verification_requested_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- 2. 크롤링된 뉴스 (posts.news_id FK용으로 먼저 생성)
CREATE TABLE IF NOT EXISTS public.crawled_news (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL,
  category TEXT CHECK (category IN ('입시', '학업', '취업', '교육정책', '기타')) DEFAULT '기타',
  summary TEXT,
  thumbnail_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  crawled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_featured BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crawled_news_category ON public.crawled_news(category, crawled_at DESC);
CREATE INDEX IF NOT EXISTS idx_crawled_news_featured ON public.crawled_news(is_featured, crawled_at DESC);

-- 3. 뉴스 소스
CREATE TABLE IF NOT EXISTS public.news_sources (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  base_url TEXT NOT NULL,
  rss_url TEXT,
  category_filter TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  crawl_interval_hours INTEGER DEFAULT 24,
  last_crawled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 아티클 (발행호)
CREATE TABLE IF NOT EXISTS public.articles (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT,
  category TEXT CHECK (category IN ('news', 'column', 'update', 'event')),
  thumbnail_url TEXT,
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  is_published BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  edition_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_articles_published ON public.articles(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_edition_id ON public.articles(edition_id);

-- 5. 커뮤니티 게시글 (Daily-Nexo board_type + review는 /reviews 전용)
CREATE TABLE IF NOT EXISTS public.posts (
  id SERIAL PRIMARY KEY,
  board_type TEXT CHECK (board_type IN ('material_share', 'regional_network', 'job_board', 'free_talk', 'review')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  images TEXT[],
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  rating INTEGER CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  is_best BOOLEAN DEFAULT FALSE,
  is_verified_review BOOLEAN DEFAULT FALSE,
  news_id INTEGER REFERENCES public.crawled_news(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_board_type ON public.posts(board_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_news_id ON public.posts(news_id);

-- 6. 댓글
CREATE TABLE IF NOT EXISTS public.comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON public.comments(post_id);

-- 7. 좋아요
CREATE TABLE IF NOT EXISTS public.likes (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_likes_post ON public.likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user ON public.likes(user_id);

-- 8. 자료실
CREATE TABLE IF NOT EXISTS public.resources (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT CHECK (file_type IN ('pdf', 'xlsx', 'hwp', 'docx', 'pptx')),
  access_level TEXT CHECK (access_level IN ('bronze', 'silver', 'gold')) DEFAULT 'bronze',
  download_cost INTEGER DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resources_access_level ON public.resources(access_level);

-- 9. 포인트 로그 (related_type 포함)
CREATE TABLE IF NOT EXISTS public.point_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT,
  related_id INTEGER,
  related_type TEXT CHECK (related_type IN ('article', 'post', 'comment', 'resource', 'checkin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_point_logs_user ON public.point_logs(user_id, created_at DESC);

-- 10. 다운로드 이력
CREATE TABLE IF NOT EXISTS public.downloads (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  resource_id INTEGER REFERENCES public.resources(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_downloads_user ON public.downloads(user_id);

-- ============================================
-- RLS 활성화 및 정책
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crawled_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;

-- users
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view all profiles" ON public.users FOR SELECT USING (true);

-- crawled_news
DROP POLICY IF EXISTS "Crawled news are viewable by everyone" ON public.crawled_news;
DROP POLICY IF EXISTS "Admins can manage crawled news" ON public.crawled_news;
CREATE POLICY "Crawled news are viewable by everyone" ON public.crawled_news FOR SELECT USING (true);
CREATE POLICY "Admins can manage crawled news" ON public.crawled_news FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- news_sources
DROP POLICY IF EXISTS "News sources are viewable by everyone" ON public.news_sources;
DROP POLICY IF EXISTS "Admins can manage news sources" ON public.news_sources;
CREATE POLICY "News sources are viewable by everyone" ON public.news_sources FOR SELECT USING (true);
CREATE POLICY "Admins can manage news sources" ON public.news_sources FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- articles
DROP POLICY IF EXISTS "Published articles are viewable by everyone" ON public.articles;
DROP POLICY IF EXISTS "Admins can manage all articles" ON public.articles;
CREATE POLICY "Published articles are viewable by everyone" ON public.articles FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Admins can manage all articles" ON public.articles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- posts
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can delete posts" ON public.posts;
CREATE POLICY "Posts are viewable by everyone" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON public.posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own posts" ON public.posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own posts" ON public.posts FOR DELETE USING (auth.uid() = author_id);
CREATE POLICY "Admins can delete posts" ON public.posts FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- comments
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;
DROP POLICY IF EXISTS "Admins can delete comments" ON public.comments;
CREATE POLICY "Comments are viewable by everyone" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON public.comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own comments" ON public.comments FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE USING (auth.uid() = author_id);
CREATE POLICY "Admins can delete comments" ON public.comments FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- likes
DROP POLICY IF EXISTS "Likes are viewable by everyone" ON public.likes;
DROP POLICY IF EXISTS "Authenticated users can insert likes" ON public.likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON public.likes;
CREATE POLICY "Likes are viewable by everyone" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert likes" ON public.likes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- resources
DROP POLICY IF EXISTS "Resources are viewable by everyone" ON public.resources;
CREATE POLICY "Resources are viewable by everyone" ON public.resources FOR SELECT USING (true);

-- point_logs
DROP POLICY IF EXISTS "Users can view own point logs" ON public.point_logs;
CREATE POLICY "Users can view own point logs" ON public.point_logs FOR SELECT USING (auth.uid() = user_id);

-- downloads
DROP POLICY IF EXISTS "Users can view own downloads" ON public.downloads;
CREATE POLICY "Users can view own downloads" ON public.downloads FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- 트리거 및 함수
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, nickname, role, academy_name, referrer_code)
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nickname', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::TEXT, 'user'),
    COALESCE(NEW.raw_user_meta_data->>'academy_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'referrer_code', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 게시글 작성 시 포인트
CREATE OR REPLACE FUNCTION public.add_points_for_post()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.point_logs (user_id, amount, reason, related_id, related_type)
  VALUES (NEW.author_id, 20, 'write_post', NEW.id, 'post');
  UPDATE public.users SET point = point + 20 WHERE id = NEW.author_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_post_created ON public.posts;
CREATE TRIGGER on_post_created
  AFTER INSERT ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.add_points_for_post();

-- 댓글 작성 시 포인트 + 댓글 수 업데이트
CREATE OR REPLACE FUNCTION public.handle_comment_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.point_logs (user_id, amount, reason, related_id, related_type)
  VALUES (NEW.author_id, 5, 'write_comment', NEW.post_id, 'comment');
  UPDATE public.users SET point = point + 5 WHERE id = NEW.author_id;
  UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_comment_created ON public.comments;
CREATE TRIGGER on_comment_created
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_comment_created();

CREATE OR REPLACE FUNCTION public.handle_comment_deleted()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_comment_deleted ON public.comments;
CREATE TRIGGER on_comment_deleted
  AFTER DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_comment_deleted();

-- 좋아요 토글
CREATE OR REPLACE FUNCTION public.handle_like_toggle()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_like_insert ON public.likes;
CREATE TRIGGER on_like_insert AFTER INSERT ON public.likes FOR EACH ROW EXECUTE FUNCTION public.handle_like_toggle();
DROP TRIGGER IF EXISTS on_like_delete ON public.likes;
CREATE TRIGGER on_like_delete AFTER DELETE ON public.likes FOR EACH ROW EXECUTE FUNCTION public.handle_like_toggle();

-- 레벨 업데이트
CREATE OR REPLACE FUNCTION public.update_user_level()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users SET level = CASE
    WHEN NEW.point >= 1000 THEN 'gold'
    WHEN NEW.point >= 500 THEN 'silver'
    ELSE 'bronze'
  END WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_point_updated ON public.users;
CREATE TRIGGER on_user_point_updated
  AFTER UPDATE OF point ON public.users
  FOR EACH ROW WHEN (OLD.point IS DISTINCT FROM NEW.point)
  EXECUTE FUNCTION public.update_user_level();
