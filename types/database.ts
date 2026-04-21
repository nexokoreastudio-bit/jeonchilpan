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
      admin_audit_logs: {
        Row: {
          id: number
          admin_id: string | null
          admin_email: string | null
          action: string
          target_type: string | null
          target_id: string | null
          detail: Json | null
          created_at: string
        }
        Insert: {
          id?: number
          admin_id?: string | null
          admin_email?: string | null
          action: string
          target_type?: string | null
          target_id?: string | null
          detail?: Json | null
          created_at?: string
        }
        Update: {
          id?: number
          admin_id?: string | null
          admin_email?: string | null
          action?: string
          target_type?: string | null
          target_id?: string | null
          detail?: Json | null
          created_at?: string
        }
      }
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
          board_type: 'bamboo' | 'materials' | 'verification' | 'notice' | 'job' | null
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
          is_pinned: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          board_type?: 'bamboo' | 'materials' | 'verification' | 'notice' | 'job' | null
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
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          board_type?: 'bamboo' | 'materials' | 'verification' | 'notice' | 'job' | null
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
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      post_reports: {
        Row: {
          id: number
          post_id: number
          reporter_id: string
          reason: string
          status: 'pending' | 'reviewed' | 'dismissed'
          admin_notes: string | null
          created_at: string
        }
        Insert: {
          post_id: number
          reporter_id: string
          reason: string
          status?: 'pending' | 'reviewed' | 'dismissed'
          admin_notes?: string | null
        }
        Update: {
          status?: 'pending' | 'reviewed' | 'dismissed'
          admin_notes?: string | null
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
          related_type: 'article' | 'post' | 'comment' | 'resource' | 'checkin' | 'marketplace' | 'quiz' | null
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
          type: 'demo' | 'quote' | 'consultation' | 'chatbot_consultation'
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
          status: 'pending' | 'in_consultation' | 'contacted' | 'demo_completed' | 'quote_completed' | 'consultation_completed' | 'completed' | 'cancelled'
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          type: 'demo' | 'quote' | 'consultation' | 'chatbot_consultation'
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
          status?: 'pending' | 'in_consultation' | 'contacted' | 'demo_completed' | 'quote_completed' | 'consultation_completed' | 'completed' | 'cancelled'
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          type?: 'demo' | 'quote' | 'consultation' | 'chatbot_consultation'
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
          status?: 'pending' | 'in_consultation' | 'contacted' | 'demo_completed' | 'quote_completed' | 'consultation_completed' | 'completed' | 'cancelled'
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
      digital_materials: {
        Row: {
          id: number
          author_id: string
          title: string
          description: string | null
          file_url: string
          thumbnail_url: string | null
          subject_category: string | null
          price: number
          downloads_count: number
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          author_id: string
          title: string
          description?: string | null
          file_url: string
          thumbnail_url?: string | null
          subject_category?: string | null
          price?: number
          downloads_count?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          author_id?: string
          title?: string
          description?: string | null
          file_url?: string
          thumbnail_url?: string | null
          subject_category?: string | null
          price?: number
          downloads_count?: number
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      marketplace_purchases: {
        Row: {
          id: number
          buyer_id: string
          material_id: number
          price_paid: number
          created_at: string
        }
        Insert: {
          id?: number
          buyer_id: string
          material_id: number
          price_paid: number
          created_at?: string
        }
        Update: {
          id?: number
          buyer_id?: string
          material_id?: number
          price_paid?: number
          created_at?: string
        }
      }
      quiz_leads: {
        Row: {
          id: number
          quiz_type: string
          result_type: string | null
          result_summary: Json | null
          email: string | null
          name: string | null
          user_id: string | null
          created_at: string
        }
        Insert: {
          id?: number
          quiz_type: string
          result_type?: string | null
          result_summary?: Record<string, unknown> | null
          email?: string | null
          name?: string | null
          user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          quiz_type?: string
          result_type?: string | null
          result_summary?: Record<string, unknown> | null
          email?: string | null
          name?: string | null
          user_id?: string | null
          created_at?: string
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
      seminars: {
        Row: {
          id: number
          title: string
          description: string | null
          format: 'offline' | 'online' | 'vod'
          status: 'recruiting' | 'closed' | 'completed'
          access_type: 'free' | 'point' | 'gold'
          point_cost: number
          thumbnail_url: string | null
          event_date: string | null
          location: string | null
          max_participants: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          description?: string | null
          format: 'offline' | 'online' | 'vod'
          status?: 'recruiting' | 'closed' | 'completed'
          access_type?: 'free' | 'point' | 'gold'
          point_cost?: number
          thumbnail_url?: string | null
          event_date?: string | null
          location?: string | null
          max_participants?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          description?: string | null
          format?: 'offline' | 'online' | 'vod'
          status?: 'recruiting' | 'closed' | 'completed'
          access_type?: 'free' | 'point' | 'gold'
          point_cost?: number
          thumbnail_url?: string | null
          event_date?: string | null
          location?: string | null
          max_participants?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      seminar_applications: {
        Row: {
          id: number
          seminar_id: number
          user_id: string | null
          name: string
          email: string
          phone: string | null
          academy_name: string | null
          message: string | null
          status: 'pending' | 'confirmed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          seminar_id: number
          user_id?: string | null
          name: string
          email: string
          phone?: string | null
          academy_name?: string | null
          message?: string | null
          status?: 'pending' | 'confirmed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          seminar_id?: number
          user_id?: string | null
          name?: string
          email?: string
          phone?: string | null
          academy_name?: string | null
          message?: string | null
          status?: 'pending' | 'confirmed' | 'cancelled'
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
      board_type: 'material_share' | 'regional_network' | 'job_board' | 'free_talk'
      user_level: 'bronze' | 'silver' | 'gold'
      file_type: 'pdf' | 'xlsx' | 'hwp' | 'docx' | 'pptx'
    }
  }
}

