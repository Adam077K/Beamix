export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type LlmProvider =
  | 'chatgpt'
  | 'claude'
  | 'perplexity'
  | 'gemini'
  | 'google_ai_overviews'

export type MentionSentiment = 'positive' | 'neutral' | 'negative'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          language: 'en' | 'he'
          timezone: string | null
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          language?: 'en' | 'he'
          timezone?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          language?: 'en' | 'he'
          timezone?: string | null
          onboarding_completed?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      businesses: {
        Row: {
          id: string
          user_id: string
          name: string
          website_url: string | null
          industry: string | null
          location: string | null
          description: string | null
          services: Json
          is_primary: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          website_url?: string | null
          industry?: string | null
          location?: string | null
          description?: string | null
          services?: Json
          is_primary?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          website_url?: string | null
          industry?: string | null
          location?: string | null
          description?: string | null
          services?: Json
          is_primary?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'businesses_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      tracked_queries: {
        Row: {
          id: string
          user_id: string
          business_id: string
          query_text: string
          query_category: string | null
          target_url: string | null
          priority: 'high' | 'medium' | 'low'
          is_active: boolean
          last_scanned_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_id: string
          query_text: string
          query_category?: string | null
          target_url?: string | null
          priority?: 'high' | 'medium' | 'low'
          is_active?: boolean
          last_scanned_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          query_text?: string
          query_category?: string | null
          target_url?: string | null
          priority?: 'high' | 'medium' | 'low'
          is_active?: boolean
          last_scanned_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tracked_queries_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tracked_queries_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          }
        ]
      }
      scan_results: {
        Row: {
          id: string
          query_id: string
          user_id: string
          business_id: string
          scan_type: 'initial' | 'scheduled' | 'manual' | 'free'
          overall_score: number | null
          mention_count: number
          avg_position: number | null
          scanned_at: string
          created_at: string
        }
        Insert: {
          id?: string
          query_id: string
          user_id: string
          business_id: string
          scan_type?: 'initial' | 'scheduled' | 'manual' | 'free'
          overall_score?: number | null
          mention_count?: number
          avg_position?: number | null
          scanned_at?: string
          created_at?: string
        }
        Update: {
          overall_score?: number | null
          mention_count?: number
          avg_position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'scan_results_query_id_fkey'
            columns: ['query_id']
            isOneToOne: false
            referencedRelation: 'tracked_queries'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'scan_results_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'scan_results_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          }
        ]
      }
      scan_result_details: {
        Row: {
          id: string
          scan_result_id: string
          llm_provider: LlmProvider
          is_mentioned: boolean
          mention_position: number | null
          mention_context: string | null
          sentiment: MentionSentiment | null
          competitors_mentioned: Json
          full_response_hash: string | null
          response_summary: string | null
          raw_prompt_used: string | null
          token_usage: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          scan_result_id: string
          llm_provider: LlmProvider
          is_mentioned?: boolean
          mention_position?: number | null
          mention_context?: string | null
          sentiment?: MentionSentiment | null
          competitors_mentioned?: Json
          full_response_hash?: string | null
          response_summary?: string | null
          raw_prompt_used?: string | null
          token_usage?: Json | null
          created_at?: string
        }
        Update: {
          is_mentioned?: boolean
          mention_position?: number | null
          mention_context?: string | null
          sentiment?: MentionSentiment | null
          competitors_mentioned?: Json
        }
        Relationships: [
          {
            foreignKeyName: 'scan_result_details_scan_result_id_fkey'
            columns: ['scan_result_id']
            isOneToOne: false
            referencedRelation: 'scan_results'
            referencedColumns: ['id']
          }
        ]
      }
      recommendations: {
        Row: {
          id: string
          user_id: string
          business_id: string
          query_id: string | null
          recommendation_type:
            | 'content_gap'
            | 'schema_markup'
            | 'faq_addition'
            | 'competitor_insight'
            | 'review_improvement'
            | 'social_strategy'
            | 'technical_optimization'
            | 'keyword_optimization'
          priority: 'critical' | 'high' | 'medium' | 'low'
          title: string
          description: string
          action_items: Json
          expected_impact: 'high' | 'medium' | 'low' | null
          supporting_data: Json
          agent_type: string | null
          credits_cost: number | null
          status: 'new' | 'in_progress' | 'completed' | 'dismissed'
          dismissed_at: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_id: string
          query_id?: string | null
          recommendation_type:
            | 'content_gap'
            | 'schema_markup'
            | 'faq_addition'
            | 'competitor_insight'
            | 'review_improvement'
            | 'social_strategy'
            | 'technical_optimization'
            | 'keyword_optimization'
          priority?: 'critical' | 'high' | 'medium' | 'low'
          title: string
          description: string
          action_items?: Json
          expected_impact?: 'high' | 'medium' | 'low' | null
          supporting_data?: Json
          agent_type?: string | null
          credits_cost?: number | null
          status?: 'new' | 'in_progress' | 'completed' | 'dismissed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: 'new' | 'in_progress' | 'completed' | 'dismissed'
          dismissed_at?: string | null
          completed_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'recommendations_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'recommendations_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'recommendations_query_id_fkey'
            columns: ['query_id']
            isOneToOne: false
            referencedRelation: 'tracked_queries'
            referencedColumns: ['id']
          }
        ]
      }
      agent_executions: {
        Row: {
          id: string
          user_id: string
          business_id: string | null
          agent_type:
            | 'content_writer'
            | 'blog_writer'
            | 'review_analyzer'
            | 'schema_optimizer'
            | 'recommendations'
            | 'social_strategy'
            | 'competitor_research'
            | 'query_researcher'
            | 'initial_analysis'
            | 'free_scan'
          status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
          input_data: Json
          output_data: Json | null
          error_message: string | null
          credits_charged: number
          total_cost_usd: number | null
          llm_calls: Json
          started_at: string | null
          completed_at: string | null
          execution_duration_ms: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_id?: string | null
          agent_type:
            | 'content_writer'
            | 'blog_writer'
            | 'review_analyzer'
            | 'schema_optimizer'
            | 'recommendations'
            | 'social_strategy'
            | 'competitor_research'
            | 'query_researcher'
            | 'initial_analysis'
            | 'free_scan'
          status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
          input_data: Json
          output_data?: Json | null
          error_message?: string | null
          credits_charged?: number
          total_cost_usd?: number | null
          llm_calls?: Json
          started_at?: string | null
          completed_at?: string | null
          execution_duration_ms?: number | null
          created_at?: string
        }
        Update: {
          status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
          output_data?: Json | null
          error_message?: string | null
          credits_charged?: number
          total_cost_usd?: number | null
          llm_calls?: Json
          started_at?: string | null
          completed_at?: string | null
          execution_duration_ms?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'agent_executions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'agent_executions_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          }
        ]
      }
      content_generations: {
        Row: {
          id: string
          execution_id: string
          user_id: string
          business_id: string | null
          content_type:
            | 'blog_post'
            | 'article'
            | 'faq'
            | 'product_description'
            | 'landing_page'
            | 'schema_markup'
            | 'social_post'
            | 'review_response'
          title: string | null
          generated_content: string
          content_format: 'markdown' | 'html' | 'json' | 'json-ld'
          word_count: number | null
          quality_score: number | null
          llm_optimization_score: number | null
          is_favorited: boolean
          user_rating: number | null
          user_feedback: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          execution_id: string
          user_id: string
          business_id?: string | null
          content_type:
            | 'blog_post'
            | 'article'
            | 'faq'
            | 'product_description'
            | 'landing_page'
            | 'schema_markup'
            | 'social_post'
            | 'review_response'
          title?: string | null
          generated_content: string
          content_format?: 'markdown' | 'html' | 'json' | 'json-ld'
          word_count?: number | null
          quality_score?: number | null
          llm_optimization_score?: number | null
          is_favorited?: boolean
          user_rating?: number | null
          user_feedback?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          is_favorited?: boolean
          user_rating?: number | null
          user_feedback?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'content_generations_execution_id_fkey'
            columns: ['execution_id']
            isOneToOne: false
            referencedRelation: 'agent_executions'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'content_generations_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'content_generations_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          }
        ]
      }
      agent_outputs: {
        Row: {
          id: string
          execution_id: string
          user_id: string
          output_type:
            | 'competitor_report'
            | 'query_suggestions'
            | 'review_analysis'
            | 'social_strategy'
            | 'schema_recommendations'
          title: string | null
          structured_data: Json
          summary: string | null
          is_favorited: boolean
          created_at: string
        }
        Insert: {
          id?: string
          execution_id: string
          user_id: string
          output_type:
            | 'competitor_report'
            | 'query_suggestions'
            | 'review_analysis'
            | 'social_strategy'
            | 'schema_recommendations'
          title?: string | null
          structured_data: Json
          summary?: string | null
          is_favorited?: boolean
          created_at?: string
        }
        Update: {
          is_favorited?: boolean
        }
        Relationships: [
          {
            foreignKeyName: 'agent_outputs_execution_id_fkey'
            columns: ['execution_id']
            isOneToOne: false
            referencedRelation: 'agent_executions'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'agent_outputs_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          plan_tier: 'free' | 'starter' | 'pro' | 'enterprise'
          status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete'
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          trial_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan_tier?: 'free' | 'starter' | 'pro' | 'enterprise'
          status?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete'
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          trial_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan_tier?: 'free' | 'starter' | 'pro' | 'enterprise'
          status?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete'
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          trial_end?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'subscriptions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      plans: {
        Row: {
          id: string
          name: string
          monthly_credits: number
          max_queries: number
          max_businesses: number
          max_competitors: number
          llm_providers: Json
          features: Json
          price_monthly_usd: number | null
          price_annual_usd: number | null
          stripe_price_monthly: string | null
          stripe_price_annual: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id: string
          name: string
          monthly_credits: number
          max_queries: number
          max_businesses?: number
          max_competitors?: number
          llm_providers: Json
          features?: Json
          price_monthly_usd?: number | null
          price_annual_usd?: number | null
          stripe_price_monthly?: string | null
          stripe_price_annual?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          name?: string
          monthly_credits?: number
          max_queries?: number
          max_businesses?: number
          max_competitors?: number
          llm_providers?: Json
          features?: Json
          price_monthly_usd?: number | null
          price_annual_usd?: number | null
          stripe_price_monthly?: string | null
          stripe_price_annual?: string | null
          is_active?: boolean
        }
        Relationships: []
      }
      credits: {
        Row: {
          id: string
          user_id: string
          total_credits: number
          monthly_allocation: number
          rollover_credits: number
          bonus_credits: number
          last_reset_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_credits?: number
          monthly_allocation?: number
          rollover_credits?: number
          bonus_credits?: number
          last_reset_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          total_credits?: number
          monthly_allocation?: number
          rollover_credits?: number
          bonus_credits?: number
          last_reset_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'credits_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      credit_transactions: {
        Row: {
          id: string
          user_id: string
          transaction_type:
            | 'debit'
            | 'credit'
            | 'monthly_allocation'
            | 'bonus'
            | 'rollover'
            | 'refund'
          amount: number
          balance_after: number
          related_entity_type: string | null
          related_entity_id: string | null
          description: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          transaction_type:
            | 'debit'
            | 'credit'
            | 'monthly_allocation'
            | 'bonus'
            | 'rollover'
            | 'refund'
          amount: number
          balance_after: number
          related_entity_type?: string | null
          related_entity_id?: string | null
          description?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: never
        Relationships: [
          {
            foreignKeyName: 'credit_transactions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      competitors: {
        Row: {
          id: string
          user_id: string
          business_id: string
          name: string
          domain: string | null
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_id: string
          name: string
          domain?: string | null
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          domain?: string | null
          description?: string | null
          is_active?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'competitors_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'competitors_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          }
        ]
      }
      free_scans: {
        Row: {
          id: string
          scan_token: string
          website_url: string
          business_name: string
          sector: string
          location: string
          ip_address: string | null
          status: 'pending' | 'processing' | 'completed' | 'failed'
          overall_score: number | null
          results_data: Json | null
          converted_user_id: string | null
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          scan_token: string
          website_url: string
          business_name: string
          sector: string
          location: string
          ip_address?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          overall_score?: number | null
          results_data?: Json | null
          converted_user_id?: string | null
          expires_at?: string
          created_at?: string
        }
        Update: {
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          overall_score?: number | null
          results_data?: Json | null
          converted_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'free_scans_converted_user_id_fkey'
            columns: ['converted_user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      notification_preferences: {
        Row: {
          id: string
          user_id: string
          email_scan_complete: boolean
          email_weekly_report: boolean
          email_recommendations: boolean
          email_agent_complete: boolean
          email_billing: boolean
          email_product_updates: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email_scan_complete?: boolean
          email_weekly_report?: boolean
          email_recommendations?: boolean
          email_agent_complete?: boolean
          email_billing?: boolean
          email_product_updates?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          email_scan_complete?: boolean
          email_weekly_report?: boolean
          email_recommendations?: boolean
          email_agent_complete?: boolean
          email_billing?: boolean
          email_product_updates?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'notification_preferences_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      blog_posts: {
        Row: {
          id: string
          slug: string
          title: string
          excerpt: string
          content: string
          cover_image: string | null
          category: string
          tags: string[]
          author_name: string
          author_avatar: string | null
          is_featured: boolean
          is_published: boolean
          published_at: string | null
          reading_time_minutes: number
          seo_title: string | null
          seo_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          excerpt: string
          content: string
          cover_image?: string | null
          category?: string
          tags?: string[]
          author_name?: string
          author_avatar?: string | null
          is_featured?: boolean
          is_published?: boolean
          published_at?: string | null
          reading_time_minutes?: number
          seo_title?: string | null
          seo_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          slug?: string
          title?: string
          excerpt?: string
          content?: string
          cover_image?: string | null
          category?: string
          tags?: string[]
          author_name?: string
          author_avatar?: string | null
          is_featured?: boolean
          is_published?: boolean
          published_at?: string | null
          reading_time_minutes?: number
          seo_title?: string | null
          seo_description?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      deduct_credits: {
        Args: {
          p_user_id: string
          p_amount: number
          p_entity_type: string
          p_entity_id: string
          p_description?: string
        }
        Returns: boolean
      }
      allocate_monthly_credits: {
        Args: {
          p_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      llm_provider: LlmProvider
      mention_sentiment: MentionSentiment
    }
    CompositeTypes: Record<string, never>
  }
}

// Convenience type helpers
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
