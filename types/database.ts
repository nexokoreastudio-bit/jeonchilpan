/**
 * Supabase 데이터베이스 타입 정의 (v2.0)
 * 
 * 커뮤니티 플랫폼용 확장된 스키마
 * 기존 연결된 Supabase 서버와 호환
 * 
 * 자동 생성 명령어 (Supabase CLI 사용 시):
 * npx supabase gen types typescript --project-id icriajfrxwykufhmkfun > types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string // UUID (auth.users 참조)
          email: string | null
          nickname: string | null
          avatar_url: string | null
          role: 'admin' | 'teacher' | 'academy_owner' | 'user' | null
          academy_name: string | null
          referrer_code: string | null
          point: number
          level: 'bronze' | 'silver' | 'gold'
          subscriber_verified: boolean
          purchase_serial_number: string | null
          verified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          nickname?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'teacher' | 'academy_owner' | 'user' | null
          academy_name?: string | null
          referrer_code?: string | null
          point?: number
          level?: 'bronze' | 'silver' | 'gold' | null
          subscriber_verified?: boolean
          purchase_serial_number?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          nickname?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'teacher' | 'academy_owner' | 'user' | null
          academy_name?: string | null
          referrer_code?: string | null
          point?: number
          level?: 'bronze' | 'silver' | 'gold' | null
          subscriber_verified?: boolean
          purchase_serial_number?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      articles: {
        Row: {
          id: number
          title: string
          subtitle: string | null
          content: string | null
          category: 'news' | 'column' | 'update' | 'event' | null
          thumbnail_url: string | null
          author_id: string | null
          published_at: string | null
          is_published: boolean
          views: number
          edition_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          subtitle?: string | null
          content?: string | null
          category?: 'news' | 'column' | 'update' | 'event' | null
          thumbnail_url?: string | null
          author_id?: string | null
          published_at?: string | null
          is_published?: boolean
          views?: number
          edition_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          subtitle?: string | null
          content?: string | null
          category?: 'news' | 'column' | 'update' | 'event' | null
          thumbnail_url?: string | null
          author_id?: string | null
          published_at?: string | null
          is_published?: boolean
          views?: number
          edition_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: number
          board_type: 'free' | 'qna' | 'tip' | 'market' | 'review' | 'news_discussion' | null
          title: string
          content: string
          author_id: string | null
          images: string[] | null
          likes_count: number
          comments_count: number
          rating: number | null
          is_best: boolean
          is_verified_review: boolean
          news_id: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          board_type?: 'free' | 'qna' | 'tip' | 'market' | 'review' | 'news_discussion' | null
          title: string
          content: string
          author_id?: string | null
          images?: string[] | null
          likes_count?: number
          comments_count?: number
          rating?: number | null
          is_best?: boolean
          is_verified_review?: boolean
          news_id?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          board_type?: 'free' | 'qna' | 'tip' | 'market' | 'review' | 'news_discussion' | null
          title?: string
          content?: string
          author_id?: string | null
          images?: string[] | null
          likes_count?: number
          comments_count?: number
          rating?: number | null
          is_best?: boolean
          is_verified_review?: boolean
          news_id?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: number
          post_id: number
          author_id: string | null
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          post_id: number
          author_id?: string | null
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          post_id?: number
          author_id?: string | null
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      likes: {
        Row: {
          id: number
          post_id: number
          user_id: string
          created_at: string
        }
        Insert: {
          id?: number
          post_id: number
          user_id: string
          created_at?: string
        }
        Update: {
          id?: number
          post_id?: number
          user_id?: string
          created_at?: string
        }
      }
      resources: {
        Row: {
          id: number
          title: string
          description: string | null
          file_url: string
          file_type: 'pdf' | 'xlsx' | 'hwp' | 'docx' | 'pptx' | null
          access_level: 'bronze' | 'silver' | 'gold'
          download_cost: number
          downloads_count: number
          thumbnail_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          description?: string | null
          file_url: string
          file_type?: 'pdf' | 'xlsx' | 'hwp' | 'docx' | 'pptx' | null
          access_level?: 'bronze' | 'silver' | 'gold'
          download_cost?: number
          downloads_count?: number
          thumbnail_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          description?: string | null
          file_url?: string
          file_type?: 'pdf' | 'xlsx' | 'hwp' | 'docx' | 'pptx' | null
          access_level?: 'bronze' | 'silver' | 'gold'
          download_cost?: number
          downloads_count?: number
          thumbnail_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      point_logs: {
        Row: {
          id: number
          user_id: string | null
          amount: number
          reason: string | null
          related_id: number | null
          related_type: 'article' | 'post' | 'comment' | 'resource' | 'checkin' | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id?: string | null
          amount: number
          reason?: string | null
          related_id?: number | null
          related_type?: 'article' | 'post' | 'comment' | 'resource' | 'checkin' | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string | null
          amount?: number
          reason?: string | null
          related_id?: number | null
          related_type?: 'article' | 'post' | 'comment' | 'resource' | 'checkin' | null
          created_at?: string
        }
      }
      daily_checkins: {
        Row: {
          id: number
          user_id: string
          checkin_date: string
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          checkin_date: string
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          checkin_date?: string
          created_at?: string
        }
      }
      leads: {
        Row: {
          id: number
          type: 'demo' | 'quote' | 'consultation'
          name: string
          email: string
          phone: string | null
          academy_name: string | null
          region: string | null
          size: string | null
          mount_type: string | null
          quantity: number | null
          message: string | null
          referrer_code: string | null
          status: 'pending' | 'contacted' | 'completed' | 'cancelled'
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          type: 'demo' | 'quote' | 'consultation'
          name: string
          email: string
          phone?: string | null
          academy_name?: string | null
          region?: string | null
          size?: string | null
          mount_type?: string | null
          quantity?: number | null
          message?: string | null
          referrer_code?: string | null
          status?: 'pending' | 'contacted' | 'completed' | 'cancelled'
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          type?: 'demo' | 'quote' | 'consultation'
          name?: string
          email?: string
          phone?: string | null
          academy_name?: string | null
          region?: string | null
          size?: string | null
          mount_type?: string | null
          quantity?: number | null
          message?: string | null
          referrer_code?: string | null
          status?: 'pending' | 'contacted' | 'completed' | 'cancelled'
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      insights: {
        Row: {
          id: number
          url: string
          title: string
          summary: string | null
          content: string | null
          category: '입시' | '정책' | '학습법' | '상담팁' | '기타' | null
          edition_id: string | null
          author_id: string | null
          is_published: boolean
          views: number
          thumbnail_url: string | null
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          url: string
          title: string
          summary?: string | null
          content?: string | null
          category?: '입시' | '정책' | '학습법' | '상담팁' | '기타' | null
          edition_id?: string | null
          author_id?: string | null
          is_published?: boolean
          views?: number
          thumbnail_url?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          url?: string
          title?: string
          summary?: string | null
          content?: string | null
          category?: '입시' | '정책' | '학습법' | '상담팁' | '기타' | null
          edition_id?: string | null
          author_id?: string | null
          is_published?: boolean
          views?: number
          thumbnail_url?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      downloads: {
        Row: {
          id: number
          user_id: string
          resource_id: number
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          resource_id: number
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          resource_id?: number
          created_at?: string
        }
      }
      field_news: {
        Row: {
          id: number
          title: string
          content: string
          location: string | null
          installation_date: string | null
          images: string[] | null
          author_id: string | null
          published_at: string | null
          is_published: boolean
          views: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          content: string
          location?: string | null
          installation_date?: string | null
          images?: string[] | null
          author_id?: string | null
          published_at?: string | null
          is_published?: boolean
          views?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          content?: string
          location?: string | null
          installation_date?: string | null
          images?: string[] | null
          author_id?: string | null
          published_at?: string | null
          is_published?: boolean
          views?: number
          created_at?: string
          updated_at?: string
        }
      }
      crawled_news: {
        Row: {
          id: number
          title: string
          url: string
          source: string
          category: '입시' | '학업' | '취업' | '교육정책' | '기타'
          summary: string | null
          thumbnail_url: string | null
          published_at: string | null
          crawled_at: string
          is_featured: boolean
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          url: string
          source: string
          category?: '입시' | '학업' | '취업' | '교육정책' | '기타'
          summary?: string | null
          thumbnail_url?: string | null
          published_at?: string | null
          crawled_at?: string
          is_featured?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          url?: string
          source?: string
          category?: '입시' | '학업' | '취업' | '교육정책' | '기타'
          summary?: string | null
          thumbnail_url?: string | null
          published_at?: string | null
          crawled_at?: string
          is_featured?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      news_sources: {
        Row: {
          id: number
          name: string
          base_url: string
          rss_url: string | null
          category_filter: string[] | null
          is_active: boolean
          crawl_interval_hours: number
          last_crawled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          base_url: string
          rss_url?: string | null
          category_filter?: string[] | null
          is_active?: boolean
          crawl_interval_hours?: number
          last_crawled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          base_url?: string
          rss_url?: string | null
          category_filter?: string[] | null
          is_active?: boolean
          crawl_interval_hours?: number
          last_crawled_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'teacher' | 'academy_owner' | 'user'
      article_category: 'news' | 'column' | 'update' | 'event'
      board_type: 'free' | 'qna' | 'tip' | 'market'
      user_level: 'bronze' | 'silver' | 'gold'
      file_type: 'pdf' | 'xlsx' | 'hwp' | 'docx' | 'pptx'
    }
  }
}

