export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agent_job_steps: {
        Row: {
          agent_job_id: string
          completed_at: string | null
          duration_ms: number | null
          id: string
          input_summary: string | null
          model_used: string | null
          output_summary: string | null
          started_at: string | null
          status: string
          step_name: string
          step_order: number
          tokens_used: number | null
        }
        Insert: {
          agent_job_id: string
          completed_at?: string | null
          duration_ms?: number | null
          id?: string
          input_summary?: string | null
          model_used?: string | null
          output_summary?: string | null
          started_at?: string | null
          status?: string
          step_name: string
          step_order: number
          tokens_used?: number | null
        }
        Update: {
          agent_job_id?: string
          completed_at?: string | null
          duration_ms?: number | null
          id?: string
          input_summary?: string | null
          model_used?: string | null
          output_summary?: string | null
          started_at?: string | null
          status?: string
          step_name?: string
          step_order?: number
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_job_steps_agent_job_id_fkey"
            columns: ["agent_job_id"]
            isOneToOne: false
            referencedRelation: "agent_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_jobs: {
        Row: {
          agent_type: Database["public"]["Enums"]["agent_type"]
          business_id: string
          completed_at: string | null
          created_at: string
          credits_cost: number
          error_message: string | null
          id: string
          inngest_run_id: string | null
          input_data: Json | null
          input_params: Json
          llm_calls_count: number
          llm_cost_usd: number | null
          output_data: Json | null
          qa_score: number | null
          runtime_ms: number | null
          scan_id: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["agent_job_status"]
          suggestion_id: string | null
          target_query_ids: string[] | null
          trigger_source: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_type: Database["public"]["Enums"]["agent_type"]
          business_id: string
          completed_at?: string | null
          created_at?: string
          credits_cost?: number
          error_message?: string | null
          id?: string
          inngest_run_id?: string | null
          input_data?: Json | null
          input_params?: Json
          llm_calls_count?: number
          llm_cost_usd?: number | null
          output_data?: Json | null
          qa_score?: number | null
          runtime_ms?: number | null
          scan_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["agent_job_status"]
          suggestion_id?: string | null
          target_query_ids?: string[] | null
          trigger_source?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_type?: Database["public"]["Enums"]["agent_type"]
          business_id?: string
          completed_at?: string | null
          created_at?: string
          credits_cost?: number
          error_message?: string | null
          id?: string
          inngest_run_id?: string | null
          input_data?: Json | null
          input_params?: Json
          llm_calls_count?: number
          llm_cost_usd?: number | null
          output_data?: Json | null
          qa_score?: number | null
          runtime_ms?: number | null
          scan_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["agent_job_status"]
          suggestion_id?: string | null
          target_query_ids?: string[] | null
          trigger_source?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_jobs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_jobs_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_workflows: {
        Row: {
          business_id: string
          cadence: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          last_run_at: string | null
          max_runs_per_month: number | null
          name: string
          next_run_at: string | null
          paused_at: string | null
          runs_this_month: number | null
          steps: Json
          trigger_config: Json
          trigger_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          business_id: string
          cadence?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          max_runs_per_month?: number | null
          name: string
          next_run_at?: string | null
          paused_at?: string | null
          runs_this_month?: number | null
          steps: Json
          trigger_config?: Json
          trigger_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          business_id?: string
          cadence?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          max_runs_per_month?: number | null
          name?: string
          next_run_at?: string | null
          paused_at?: string | null
          runs_this_month?: number | null
          steps?: Json
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_workflows_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_readiness_history: {
        Row: {
          business_id: string
          id: string
          recorded_at: string
          score: number
          score_breakdown: Json
        }
        Insert: {
          business_id: string
          id?: string
          recorded_at?: string
          score: number
          score_breakdown?: Json
        }
        Update: {
          business_id?: string
          id?: string
          recorded_at?: string
          score?: number
          score_breakdown?: Json
        }
        Relationships: [
          {
            foreignKeyName: "ai_readiness_history_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_rules: {
        Row: {
          alert_type: string
          business_id: string
          channels: string[]
          cooldown_hours: number | null
          created_at: string
          id: string
          is_active: boolean | null
          last_triggered_at: string | null
          threshold: Json
          user_id: string
        }
        Insert: {
          alert_type: string
          business_id: string
          channels?: string[]
          cooldown_hours?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          threshold: Json
          user_id: string
        }
        Update: {
          alert_type?: string
          business_id?: string
          channels?: string[]
          cooldown_hours?: number | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_triggered_at?: string | null
          threshold?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_rules_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          rate_limit: number | null
          scopes: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name?: string
          rate_limit?: number | null
          scopes?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          rate_limit?: number | null
          scopes?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      automation_configs: {
        Row: {
          agent_type: string
          business_id: string
          cadence: string
          config: Json | null
          created_at: string
          id: string
          is_active: boolean
          last_run_at: string | null
          max_runs_per_month: number | null
          next_run_at: string | null
          paused_at: string | null
          runs_this_month: number
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_type: string
          business_id: string
          cadence?: string
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          max_runs_per_month?: number | null
          next_run_at?: string | null
          paused_at?: string | null
          runs_this_month?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_type?: string
          business_id?: string
          cadence?: string
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          max_runs_per_month?: number | null
          next_run_at?: string | null
          paused_at?: string | null
          runs_this_month?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_configs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_avatar_url: string | null
          author_id: string | null
          author_name: string
          canonical_url: string | null
          category: string | null
          content: string
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          lang: string
          meta_description: string | null
          og_description: string | null
          og_image_url: string | null
          og_title: string | null
          published_at: string | null
          reading_time_minutes: number | null
          slug: string
          status: Database["public"]["Enums"]["blog_post_status"]
          structured_data: Json | null
          tags: string[] | null
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          author_avatar_url?: string | null
          author_id?: string | null
          author_name?: string
          canonical_url?: string | null
          category?: string | null
          content: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          lang?: string
          meta_description?: string | null
          og_description?: string | null
          og_image_url?: string | null
          og_title?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          slug: string
          status?: Database["public"]["Enums"]["blog_post_status"]
          structured_data?: Json | null
          tags?: string[] | null
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          author_avatar_url?: string | null
          author_id?: string | null
          author_name?: string
          canonical_url?: string | null
          category?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          lang?: string
          meta_description?: string | null
          og_description?: string | null
          og_image_url?: string | null
          og_title?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          slug?: string
          status?: Database["public"]["Enums"]["blog_post_status"]
          structured_data?: Json | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_narratives: {
        Row: {
          brand_positioning: string | null
          business_id: string
          compared_to_previous: Json | null
          created_at: string
          id: string
          key_themes: Json
          misperceptions: Json | null
          narrative_score: number | null
          narrative_summary: string
          scan_id: string
        }
        Insert: {
          brand_positioning?: string | null
          business_id: string
          compared_to_previous?: Json | null
          created_at?: string
          id?: string
          key_themes: Json
          misperceptions?: Json | null
          narrative_score?: number | null
          narrative_summary: string
          scan_id: string
        }
        Update: {
          brand_positioning?: string | null
          business_id?: string
          compared_to_previous?: Json | null
          created_at?: string
          id?: string
          key_themes?: Json
          misperceptions?: Json | null
          narrative_score?: number | null
          narrative_summary?: string
          scan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_narratives_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_narratives_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          competitors_auto_detected: string[] | null
          created_at: string
          description: string | null
          id: string
          industry: string
          is_primary: boolean
          language: string
          last_manual_scan_at: string | null
          last_scanned_at: string | null
          location: string
          logo_url: string | null
          name: string
          next_scan_at: string | null
          services: string[] | null
          updated_at: string
          user_id: string
          website_url: string
          ymyl_category: boolean
        }
        Insert: {
          competitors_auto_detected?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          industry: string
          is_primary?: boolean
          language?: string
          last_manual_scan_at?: string | null
          last_scanned_at?: string | null
          location: string
          logo_url?: string | null
          name: string
          next_scan_at?: string | null
          services?: string[] | null
          updated_at?: string
          user_id: string
          website_url: string
          ymyl_category?: boolean
        }
        Update: {
          competitors_auto_detected?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string
          is_primary?: boolean
          language?: string
          last_manual_scan_at?: string | null
          last_scanned_at?: string | null
          location?: string
          logo_url?: string | null
          name?: string
          next_scan_at?: string | null
          services?: string[] | null
          updated_at?: string
          user_id?: string
          website_url?: string
          ymyl_category?: boolean
        }
        Relationships: []
      }
      citation_sources: {
        Row: {
          business_id: string
          created_at: string
          engines: string[]
          first_seen_at: string
          id: string
          is_own_domain: boolean
          last_seen_at: string
          mention_count: number
          sentiment_avg: number | null
          source_domain: string
          source_title: string | null
          source_url: string
        }
        Insert: {
          business_id: string
          created_at?: string
          engines?: string[]
          first_seen_at?: string
          id?: string
          is_own_domain?: boolean
          last_seen_at?: string
          mention_count?: number
          sentiment_avg?: number | null
          source_domain: string
          source_title?: string | null
          source_url: string
        }
        Update: {
          business_id?: string
          created_at?: string
          engines?: string[]
          first_seen_at?: string
          id?: string
          is_own_domain?: boolean
          last_seen_at?: string
          mention_count?: number
          sentiment_avg?: number | null
          source_domain?: string
          source_title?: string | null
          source_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "citation_sources_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor_content_snapshots: {
        Row: {
          competitor_id: string
          created_at: string
          detected_at: string
          id: string
          is_new: boolean
          snapshot_type: string
          summary: string | null
          title: string | null
          url: string | null
        }
        Insert: {
          competitor_id: string
          created_at?: string
          detected_at?: string
          id?: string
          is_new?: boolean
          snapshot_type: string
          summary?: string | null
          title?: string | null
          url?: string | null
        }
        Update: {
          competitor_id?: string
          created_at?: string
          detected_at?: string
          id?: string
          is_new?: boolean
          snapshot_type?: string
          summary?: string | null
          title?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competitor_content_snapshots_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "competitors"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor_scans: {
        Row: {
          business_id: string
          competitor_id: string
          created_at: string
          engine: string
          id: string
          is_mentioned: boolean
          mention_context: string | null
          rank_position: number | null
          scan_id: string
          sentiment_score: number | null
        }
        Insert: {
          business_id: string
          competitor_id: string
          created_at?: string
          engine: string
          id?: string
          is_mentioned?: boolean
          mention_context?: string | null
          rank_position?: number | null
          scan_id: string
          sentiment_score?: number | null
        }
        Update: {
          business_id?: string
          competitor_id?: string
          created_at?: string
          engine?: string
          id?: string
          is_mentioned?: boolean
          mention_context?: string | null
          rank_position?: number | null
          scan_id?: string
          sentiment_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "competitor_scans_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitor_scans_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "competitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitor_scans_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor_share_of_voice: {
        Row: {
          business_id: string
          competitor_id: string | null
          created_at: string
          id: string
          mention_count: number
          voice_share_pct: number
          week_start: string
        }
        Insert: {
          business_id: string
          competitor_id?: string | null
          created_at?: string
          id?: string
          mention_count?: number
          voice_share_pct: number
          week_start: string
        }
        Update: {
          business_id?: string
          competitor_id?: string | null
          created_at?: string
          id?: string
          mention_count?: number
          voice_share_pct?: number
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "competitor_share_of_voice_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitor_share_of_voice_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "competitors"
            referencedColumns: ["id"]
          },
        ]
      }
      competitors: {
        Row: {
          business_id: string
          created_at: string
          domain: string | null
          first_seen_score: number | null
          id: string
          is_active: boolean
          latest_score: number | null
          name: string
          source: string
          updated_at: string
          user_id: string
          website_url: string
        }
        Insert: {
          business_id: string
          created_at?: string
          domain?: string | null
          first_seen_score?: number | null
          id?: string
          is_active?: boolean
          latest_score?: number | null
          name: string
          source?: string
          updated_at?: string
          user_id: string
          website_url: string
        }
        Update: {
          business_id?: string
          created_at?: string
          domain?: string | null
          first_seen_score?: number | null
          id?: string
          is_active?: boolean
          latest_score?: number | null
          name?: string
          source?: string
          updated_at?: string
          user_id?: string
          website_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "competitors_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      content_items: {
        Row: {
          agent_job_id: string
          agent_type: Database["public"]["Enums"]["agent_type"]
          archived_at: string | null
          business_id: string
          content: string
          content_body: string | null
          content_format: Database["public"]["Enums"]["content_format"]
          content_type: string | null
          created_at: string
          estimated_impact: string | null
          evidence: Json | null
          id: string
          is_favorited: boolean
          language: string | null
          meta_description: string | null
          metadata: Json
          original_content: string | null
          published_at: string | null
          published_url: string | null
          published_verified_at: string | null
          quality_score: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["content_item_status"]
          suggestion_id: string | null
          tags: string[] | null
          target_queries: string[] | null
          title: string
          trigger_reason: string | null
          updated_at: string
          user_edited_content: string | null
          user_feedback: string | null
          user_id: string
          user_rating: number | null
          voice_profile_id: string | null
          word_count: number | null
          workflow_run_id: string | null
        }
        Insert: {
          agent_job_id: string
          agent_type: Database["public"]["Enums"]["agent_type"]
          archived_at?: string | null
          business_id: string
          content: string
          content_body?: string | null
          content_format?: Database["public"]["Enums"]["content_format"]
          content_type?: string | null
          created_at?: string
          estimated_impact?: string | null
          evidence?: Json | null
          id?: string
          is_favorited?: boolean
          language?: string | null
          meta_description?: string | null
          metadata?: Json
          original_content?: string | null
          published_at?: string | null
          published_url?: string | null
          published_verified_at?: string | null
          quality_score?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["content_item_status"]
          suggestion_id?: string | null
          tags?: string[] | null
          target_queries?: string[] | null
          title: string
          trigger_reason?: string | null
          updated_at?: string
          user_edited_content?: string | null
          user_feedback?: string | null
          user_id: string
          user_rating?: number | null
          voice_profile_id?: string | null
          word_count?: number | null
          workflow_run_id?: string | null
        }
        Update: {
          agent_job_id?: string
          agent_type?: Database["public"]["Enums"]["agent_type"]
          archived_at?: string | null
          business_id?: string
          content?: string
          content_body?: string | null
          content_format?: Database["public"]["Enums"]["content_format"]
          content_type?: string | null
          created_at?: string
          estimated_impact?: string | null
          evidence?: Json | null
          id?: string
          is_favorited?: boolean
          language?: string | null
          meta_description?: string | null
          metadata?: Json
          original_content?: string | null
          published_at?: string | null
          published_url?: string | null
          published_verified_at?: string | null
          quality_score?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["content_item_status"]
          suggestion_id?: string | null
          tags?: string[] | null
          target_queries?: string[] | null
          title?: string
          trigger_reason?: string | null
          updated_at?: string
          user_edited_content?: string | null
          user_feedback?: string | null
          user_id?: string
          user_rating?: number | null
          voice_profile_id?: string | null
          word_count?: number | null
          workflow_run_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_items_agent_job_id_fkey"
            columns: ["agent_job_id"]
            isOneToOne: false
            referencedRelation: "agent_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_items_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      content_performance: {
        Row: {
          avg_position_after: number | null
          avg_position_before: number | null
          business_id: string
          content_item_id: string
          created_at: string
          engines_mentioning: string[] | null
          id: string
          measurement_date: string
          mention_count_after: number | null
          mention_count_before: number | null
          scan_id: string
          score_delta: number | null
          visibility_score_after: number | null
          visibility_score_before: number | null
        }
        Insert: {
          avg_position_after?: number | null
          avg_position_before?: number | null
          business_id: string
          content_item_id: string
          created_at?: string
          engines_mentioning?: string[] | null
          id?: string
          measurement_date: string
          mention_count_after?: number | null
          mention_count_before?: number | null
          scan_id: string
          score_delta?: number | null
          visibility_score_after?: number | null
          visibility_score_before?: number | null
        }
        Update: {
          avg_position_after?: number | null
          avg_position_before?: number | null
          business_id?: string
          content_item_id?: string
          created_at?: string
          engines_mentioning?: string[] | null
          id?: string
          measurement_date?: string
          mention_count_after?: number | null
          mention_count_before?: number | null
          scan_id?: string
          score_delta?: number | null
          visibility_score_after?: number | null
          visibility_score_before?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "content_performance_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_performance_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_performance_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      content_versions: {
        Row: {
          change_summary: string | null
          content_body: string
          content_item_id: string
          created_at: string
          edited_by: string
          id: string
          version_number: number
        }
        Insert: {
          change_summary?: string | null
          content_body: string
          content_item_id: string
          created_at?: string
          edited_by?: string
          id?: string
          version_number: number
        }
        Update: {
          change_summary?: string | null
          content_body?: string
          content_item_id?: string
          created_at?: string
          edited_by?: string
          id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "content_versions_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      content_voice_profiles: {
        Row: {
          business_id: string
          created_at: string
          example_excerpts: string[]
          id: string
          is_default: boolean | null
          name: string
          training_sources: Json
          updated_at: string
          user_id: string
          vocabulary_patterns: Json | null
          voice_description: string
        }
        Insert: {
          business_id: string
          created_at?: string
          example_excerpts?: string[]
          id?: string
          is_default?: boolean | null
          name: string
          training_sources?: Json
          updated_at?: string
          user_id: string
          vocabulary_patterns?: Json | null
          voice_description: string
        }
        Update: {
          business_id?: string
          created_at?: string
          example_excerpts?: string[]
          id?: string
          is_default?: boolean | null
          name?: string
          training_sources?: Json
          updated_at?: string
          user_id?: string
          vocabulary_patterns?: Json | null
          voice_description?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_voice_profiles_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      crawler_detections: {
        Row: {
          business_id: string
          crawler_name: string
          created_at: string
          detected_at: string
          id: string
          page_url: string | null
          user_agent: string | null
        }
        Insert: {
          business_id: string
          crawler_name: string
          created_at?: string
          detected_at: string
          id?: string
          page_url?: string | null
          user_agent?: string | null
        }
        Update: {
          business_id?: string
          crawler_name?: string
          created_at?: string
          detected_at?: string
          id?: string
          page_url?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crawler_detections_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_pools: {
        Row: {
          base_allocation: number
          created_at: string
          held_amount: number | null
          id: string
          period_end: string
          period_start: string
          pool_type: Database["public"]["Enums"]["credit_pool_type"]
          rollover_amount: number
          topup_amount: number
          updated_at: string
          used_amount: number
          user_id: string
        }
        Insert: {
          base_allocation?: number
          created_at?: string
          held_amount?: number | null
          id?: string
          period_end: string
          period_start: string
          pool_type: Database["public"]["Enums"]["credit_pool_type"]
          rollover_amount?: number
          topup_amount?: number
          updated_at?: string
          used_amount?: number
          user_id: string
        }
        Update: {
          base_allocation?: number
          created_at?: string
          held_amount?: number | null
          id?: string
          period_end?: string
          period_start?: string
          pool_type?: Database["public"]["Enums"]["credit_pool_type"]
          rollover_amount?: number
          topup_amount?: number
          updated_at?: string
          used_amount?: number
          user_id?: string
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          agent_job_id: string | null
          amount: number
          balance_after: number
          created_at: string
          description: string | null
          id: string
          pool_id: string
          pool_type: Database["public"]["Enums"]["credit_pool_type"]
          transaction_type: Database["public"]["Enums"]["credit_transaction_type"]
          user_id: string
        }
        Insert: {
          agent_job_id?: string | null
          amount: number
          balance_after: number
          created_at?: string
          description?: string | null
          id?: string
          pool_id: string
          pool_type: Database["public"]["Enums"]["credit_pool_type"]
          transaction_type: Database["public"]["Enums"]["credit_transaction_type"]
          user_id: string
        }
        Update: {
          agent_job_id?: string | null
          amount?: number
          balance_after?: number
          created_at?: string
          description?: string | null
          id?: string
          pool_id?: string
          pool_type?: Database["public"]["Enums"]["credit_pool_type"]
          transaction_type?: Database["public"]["Enums"]["credit_transaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "credit_pools"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_cap_usage: {
        Row: {
          agent_type: Database["public"]["Enums"]["agent_type"]
          count: number
          updated_at: string | null
          usage_date: string
          user_id: string
        }
        Insert: {
          agent_type: Database["public"]["Enums"]["agent_type"]
          count?: number
          updated_at?: string | null
          usage_date?: string
          user_id: string
        }
        Update: {
          agent_type?: Database["public"]["Enums"]["agent_type"]
          count?: number
          updated_at?: string | null
          usage_date?: string
          user_id?: string
        }
        Relationships: []
      }
      email_log: {
        Row: {
          business_id: string | null
          email_type: string
          error: string | null
          id: string
          metadata: Json | null
          recipient_email: string
          resend_id: string | null
          sent_at: string
          status: string
          subject: string | null
          user_id: string
        }
        Insert: {
          business_id?: string | null
          email_type: string
          error?: string | null
          id?: string
          metadata?: Json | null
          recipient_email: string
          resend_id?: string | null
          sent_at?: string
          status?: string
          subject?: string | null
          user_id: string
        }
        Update: {
          business_id?: string | null
          email_type?: string
          error?: string | null
          id?: string
          metadata?: Json | null
          recipient_email?: string
          resend_id?: string | null
          sent_at?: string
          status?: string
          subject?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_log_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      free_scans: {
        Row: {
          business_name: string
          competitor_urls: string[] | null
          completed_at: string | null
          converted_to_scan_id: string | null
          converted_user_id: string | null
          created_at: string
          email: string | null
          expires_at: string
          id: string
          industry: string
          ip_address: unknown
          language: string | null
          location: string
          mock_engines: string[] | null
          overall_score: number | null
          results_data: Json | null
          scan_id: string | null
          status: Database["public"]["Enums"]["scan_status"]
          trial_started: boolean
          updated_at: string
          website_url: string
        }
        Insert: {
          business_name: string
          competitor_urls?: string[] | null
          completed_at?: string | null
          converted_to_scan_id?: string | null
          converted_user_id?: string | null
          created_at?: string
          email?: string | null
          expires_at?: string
          id?: string
          industry: string
          ip_address?: unknown
          language?: string | null
          location: string
          mock_engines?: string[] | null
          overall_score?: number | null
          results_data?: Json | null
          scan_id?: string | null
          status?: Database["public"]["Enums"]["scan_status"]
          trial_started?: boolean
          updated_at?: string
          website_url: string
        }
        Update: {
          business_name?: string
          competitor_urls?: string[] | null
          completed_at?: string | null
          converted_to_scan_id?: string | null
          converted_user_id?: string | null
          created_at?: string
          email?: string | null
          expires_at?: string
          id?: string
          industry?: string
          ip_address?: unknown
          language?: string | null
          location?: string
          mock_engines?: string[] | null
          overall_score?: number | null
          results_data?: Json | null
          scan_id?: string | null
          status?: Database["public"]["Enums"]["scan_status"]
          trial_started?: boolean
          updated_at?: string
          website_url?: string
        }
        Relationships: []
      }
      ga4_metrics: {
        Row: {
          ai_referral_sessions: number
          business_id: string
          created_at: string
          date: string
          id: string
          organic_sessions: number
          sessions: number
        }
        Insert: {
          ai_referral_sessions?: number
          business_id: string
          created_at?: string
          date: string
          id?: string
          organic_sessions?: number
          sessions?: number
        }
        Update: {
          ai_referral_sessions?: number
          business_id?: string
          created_at?: string
          date?: string
          id?: string
          organic_sessions?: number
          sessions?: number
        }
        Relationships: [
          {
            foreignKeyName: "ga4_metrics_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      gsc_data: {
        Row: {
          business_id: string
          clicks: number
          created_at: string
          date: string
          id: string
          impressions: number
          position: number | null
          query: string
        }
        Insert: {
          business_id: string
          clicks?: number
          created_at?: string
          date: string
          id?: string
          impressions?: number
          position?: number | null
          query: string
        }
        Update: {
          business_id?: string
          clicks?: number
          created_at?: string
          date?: string
          id?: string
          impressions?: number
          position?: number | null
          query?: string
        }
        Relationships: [
          {
            foreignKeyName: "gsc_data_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      inbox_item_edits: {
        Row: {
          accepted: boolean | null
          ai_response: string | null
          content_item_id: string
          created_at: string
          edit_type: string
          id: string
          selected_text: string | null
          user_id: string
          user_prompt: string | null
        }
        Insert: {
          accepted?: boolean | null
          ai_response?: string | null
          content_item_id: string
          created_at?: string
          edit_type?: string
          id?: string
          selected_text?: string | null
          user_id: string
          user_prompt?: string | null
        }
        Update: {
          accepted?: boolean | null
          ai_response?: string | null
          content_item_id?: string
          created_at?: string
          edit_type?: string
          id?: string
          selected_text?: string | null
          user_id?: string
          user_prompt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inbox_item_edits_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          business_id: string
          config: Json | null
          created_at: string
          credentials: Json
          id: string
          last_error: string | null
          last_sync_at: string | null
          provider: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          business_id: string
          config?: Json | null
          created_at?: string
          credentials: Json
          id?: string
          last_error?: string | null
          last_sync_at?: string | null
          provider: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          business_id?: string
          config?: Json | null
          created_at?: string
          credentials?: Json
          id?: string
          last_error?: string | null
          last_sync_at?: string | null
          provider?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "integrations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          agent_completion: boolean
          competitor_alerts: boolean
          created_at: string
          daily_digest: boolean
          email_digest: string | null
          email_enabled: boolean | null
          id: string
          inapp_enabled: boolean | null
          integration_launch_notify: boolean
          marketing_tips: boolean
          product_updates: boolean
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          ranking_change_alerts: boolean
          scan_complete_emails: boolean
          slack_enabled: boolean | null
          slack_webhook_url: string | null
          updated_at: string
          user_id: string
          weekly_digest: boolean
        }
        Insert: {
          agent_completion?: boolean
          competitor_alerts?: boolean
          created_at?: string
          daily_digest?: boolean
          email_digest?: string | null
          email_enabled?: boolean | null
          id?: string
          inapp_enabled?: boolean | null
          integration_launch_notify?: boolean
          marketing_tips?: boolean
          product_updates?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          ranking_change_alerts?: boolean
          scan_complete_emails?: boolean
          slack_enabled?: boolean | null
          slack_webhook_url?: string | null
          updated_at?: string
          user_id: string
          weekly_digest?: boolean
        }
        Update: {
          agent_completion?: boolean
          competitor_alerts?: boolean
          created_at?: string
          daily_digest?: boolean
          email_digest?: string | null
          email_enabled?: boolean | null
          id?: string
          inapp_enabled?: boolean | null
          integration_launch_notify?: boolean
          marketing_tips?: boolean
          product_updates?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          ranking_change_alerts?: boolean
          scan_complete_emails?: boolean
          slack_enabled?: boolean | null
          slack_webhook_url?: string | null
          updated_at?: string
          user_id?: string
          weekly_digest?: boolean
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          body: string
          created_at: string
          id: string
          is_read: boolean
          read_at: string | null
          severity: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          body: string
          created_at?: string
          id?: string
          is_read?: boolean
          read_at?: string | null
          severity?: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean
          read_at?: string | null
          severity?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      page_locks: {
        Row: {
          agent_job_id: string
          agent_type: string
          business_id: string
          expires_at: string
          id: string
          locked_at: string
          page_url: string
        }
        Insert: {
          agent_job_id: string
          agent_type: string
          business_id: string
          expires_at?: string
          id?: string
          locked_at?: string
          page_url: string
        }
        Update: {
          agent_job_id?: string
          agent_type?: string
          business_id?: string
          expires_at?: string
          id?: string
          locked_at?: string
          page_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_locks_agent_job_id_fkey"
            columns: ["agent_job_id"]
            isOneToOne: false
            referencedRelation: "agent_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "page_locks_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_reports: {
        Row: {
          actions_measured: Json | null
          agent_job_id: string | null
          business_id: string
          created_at: string
          engine_deltas: Json | null
          id: string
          query_deltas: Json | null
          report_period_end: string
          report_period_start: string
          scan_after_id: string | null
          scan_before_id: string | null
          score_after: number | null
          score_before: number | null
          score_delta: number | null
          summary_text: string | null
          user_id: string
        }
        Insert: {
          actions_measured?: Json | null
          agent_job_id?: string | null
          business_id: string
          created_at?: string
          engine_deltas?: Json | null
          id?: string
          query_deltas?: Json | null
          report_period_end: string
          report_period_start: string
          scan_after_id?: string | null
          scan_before_id?: string | null
          score_after?: number | null
          score_before?: number | null
          score_delta?: number | null
          summary_text?: string | null
          user_id: string
        }
        Update: {
          actions_measured?: Json | null
          agent_job_id?: string | null
          business_id?: string
          created_at?: string
          engine_deltas?: Json | null
          id?: string
          query_deltas?: Json | null
          report_period_end?: string
          report_period_start?: string
          scan_after_id?: string | null
          scan_before_id?: string | null
          score_after?: number | null
          score_before?: number | null
          score_delta?: number | null
          summary_text?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_reports_agent_job_id_fkey"
            columns: ["agent_job_id"]
            isOneToOne: false
            referencedRelation: "agent_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_reports_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_reports_scan_after_id_fkey"
            columns: ["scan_after_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_reports_scan_before_id_fkey"
            columns: ["scan_before_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      personas: {
        Row: {
          business_id: string
          created_at: string
          description: string | null
          id: string
          journey_stage: string | null
          name: string
          prompt_modifiers: string[] | null
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          description?: string | null
          id?: string
          journey_stage?: string | null
          name: string
          prompt_modifiers?: string[] | null
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          description?: string | null
          id?: string
          journey_stage?: string | null
          name?: string
          prompt_modifiers?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "personas_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          agent_uses_per_month: number
          businesses_limit: number
          competitors_limit: number
          created_at: string
          engines: string[] | null
          engines_count: number
          features: Json | null
          history_weeks: number
          id: string
          is_active: boolean
          max_businesses: number | null
          max_competitors: number | null
          max_tracked_queries: number | null
          monthly_agent_uses: number | null
          name: string
          paddle_product_id: string | null
          price_annual_usd: number | null
          price_monthly_usd: number | null
          scan_credits_per_month: number
          scan_frequency_days: number | null
          scan_frequency_hours: number
          tier: string | null
          tracked_queries_limit: number
        }
        Insert: {
          agent_uses_per_month?: number
          businesses_limit?: number
          competitors_limit?: number
          created_at?: string
          engines?: string[] | null
          engines_count?: number
          features?: Json | null
          history_weeks?: number
          id: string
          is_active?: boolean
          max_businesses?: number | null
          max_competitors?: number | null
          max_tracked_queries?: number | null
          monthly_agent_uses?: number | null
          name: string
          paddle_product_id?: string | null
          price_annual_usd?: number | null
          price_monthly_usd?: number | null
          scan_credits_per_month?: number
          scan_frequency_days?: number | null
          scan_frequency_hours?: number
          tier?: string | null
          tracked_queries_limit?: number
        }
        Update: {
          agent_uses_per_month?: number
          businesses_limit?: number
          competitors_limit?: number
          created_at?: string
          engines?: string[] | null
          engines_count?: number
          features?: Json | null
          history_weeks?: number
          id?: string
          is_active?: boolean
          max_businesses?: number | null
          max_competitors?: number | null
          max_tracked_queries?: number | null
          monthly_agent_uses?: number | null
          name?: string
          paddle_product_id?: string | null
          price_annual_usd?: number | null
          price_monthly_usd?: number | null
          scan_credits_per_month?: number
          scan_frequency_days?: number | null
          scan_frequency_hours?: number
          tier?: string | null
          tracked_queries_limit?: number
        }
        Relationships: []
      }
      prompt_library: {
        Row: {
          category: string
          created_at: string
          estimated_volume: number | null
          id: string
          industry: string
          language: string
          last_volume_update: string | null
          location_template: boolean | null
          prompt_text: string
          sample_size: number | null
          trending_direction: string | null
        }
        Insert: {
          category: string
          created_at?: string
          estimated_volume?: number | null
          id?: string
          industry: string
          language?: string
          last_volume_update?: string | null
          location_template?: boolean | null
          prompt_text: string
          sample_size?: number | null
          trending_direction?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          estimated_volume?: number | null
          id?: string
          industry?: string
          language?: string
          last_volume_update?: string | null
          location_template?: boolean | null
          prompt_text?: string
          sample_size?: number | null
          trending_direction?: string | null
        }
        Relationships: []
      }
      prompt_volumes: {
        Row: {
          avg_position: number | null
          competitor_density: number | null
          created_at: string
          engine_coverage: Json | null
          id: string
          measurement_period: string
          mention_rate: number | null
          prompt_library_id: string
          scan_count: number
        }
        Insert: {
          avg_position?: number | null
          competitor_density?: number | null
          created_at?: string
          engine_coverage?: Json | null
          id?: string
          measurement_period: string
          mention_rate?: number | null
          prompt_library_id: string
          scan_count?: number
        }
        Update: {
          avg_position?: number | null
          competitor_density?: number | null
          created_at?: string
          engine_coverage?: Json | null
          id?: string
          measurement_period?: string
          mention_rate?: number | null
          prompt_library_id?: string
          scan_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "prompt_volumes_prompt_library_id_fkey"
            columns: ["prompt_library_id"]
            isOneToOne: false
            referencedRelation: "prompt_library"
            referencedColumns: ["id"]
          },
        ]
      }
      query_clusters: {
        Row: {
          business_id: string
          cluster_intent: string | null
          cluster_name: string
          created_at: string
          id: string
          priority_score: number | null
          query_ids: string[]
          query_run_id: string
          ymyl_flag: boolean
        }
        Insert: {
          business_id: string
          cluster_intent?: string | null
          cluster_name: string
          created_at?: string
          id?: string
          priority_score?: number | null
          query_ids?: string[]
          query_run_id: string
          ymyl_flag?: boolean
        }
        Update: {
          business_id?: string
          cluster_intent?: string | null
          cluster_name?: string
          created_at?: string
          id?: string
          priority_score?: number | null
          query_ids?: string[]
          query_run_id?: string
          ymyl_flag?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "query_clusters_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "query_clusters_query_run_id_fkey"
            columns: ["query_run_id"]
            isOneToOne: false
            referencedRelation: "query_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      query_positions: {
        Row: {
          brands_mentioned: Json | null
          business_id: string
          created_at: string
          engine: string
          id: string
          is_mentioned: boolean
          rank_position: number | null
          scan_id: string
          snippet: string | null
          tracked_query_id: string
        }
        Insert: {
          brands_mentioned?: Json | null
          business_id: string
          created_at?: string
          engine: string
          id?: string
          is_mentioned?: boolean
          rank_position?: number | null
          scan_id: string
          snippet?: string | null
          tracked_query_id: string
        }
        Update: {
          brands_mentioned?: Json | null
          business_id?: string
          created_at?: string
          engine?: string
          id?: string
          is_mentioned?: boolean
          rank_position?: number | null
          scan_id?: string
          snippet?: string | null
          tracked_query_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "query_positions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "query_positions_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "query_positions_tracked_query_id_fkey"
            columns: ["tracked_query_id"]
            isOneToOne: false
            referencedRelation: "tracked_queries"
            referencedColumns: ["id"]
          },
        ]
      }
      query_runs: {
        Row: {
          agent_job_id: string | null
          business_id: string
          created_at: string
          id: string
          query_count: number
          run_metadata: Json | null
          user_id: string
        }
        Insert: {
          agent_job_id?: string | null
          business_id: string
          created_at?: string
          id?: string
          query_count?: number
          run_metadata?: Json | null
          user_id: string
        }
        Update: {
          agent_job_id?: string | null
          business_id?: string
          created_at?: string
          id?: string
          query_count?: number
          run_metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "query_runs_agent_job_id_fkey"
            columns: ["agent_job_id"]
            isOneToOne: false
            referencedRelation: "agent_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "query_runs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendations: {
        Row: {
          action_items: Json
          affects_engines: string[] | null
          agent_job_id: string | null
          business_id: string
          completed_at: string | null
          created_at: string
          credits_cost: number | null
          description: string
          dismissed_at: string | null
          effort: string | null
          evidence: string | null
          id: string
          impact: string | null
          is_free_preview: boolean
          priority: Database["public"]["Enums"]["recommendation_priority"]
          recommendation_type: string | null
          scan_id: string | null
          status: Database["public"]["Enums"]["recommendation_status"]
          suggested_agent: Database["public"]["Enums"]["agent_type"] | null
          supporting_data: Json | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_items?: Json
          affects_engines?: string[] | null
          agent_job_id?: string | null
          business_id: string
          completed_at?: string | null
          created_at?: string
          credits_cost?: number | null
          description: string
          dismissed_at?: string | null
          effort?: string | null
          evidence?: string | null
          id?: string
          impact?: string | null
          is_free_preview?: boolean
          priority?: Database["public"]["Enums"]["recommendation_priority"]
          recommendation_type?: string | null
          scan_id?: string | null
          status?: Database["public"]["Enums"]["recommendation_status"]
          suggested_agent?: Database["public"]["Enums"]["agent_type"] | null
          supporting_data?: Json | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_items?: Json
          affects_engines?: string[] | null
          agent_job_id?: string | null
          business_id?: string
          completed_at?: string | null
          created_at?: string
          credits_cost?: number | null
          description?: string
          dismissed_at?: string | null
          effort?: string | null
          evidence?: string | null
          id?: string
          impact?: string | null
          is_free_preview?: boolean
          priority?: Database["public"]["Enums"]["recommendation_priority"]
          recommendation_type?: string | null
          scan_id?: string | null
          status?: Database["public"]["Enums"]["recommendation_status"]
          suggested_agent?: Database["public"]["Enums"]["agent_type"] | null
          supporting_data?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_agent_job_id_fkey"
            columns: ["agent_job_id"]
            isOneToOne: false
            referencedRelation: "agent_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendations_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      scan_engine_results: {
        Row: {
          brands_mentioned: Json | null
          business_id: string
          citations: Json | null
          cited_by_name: boolean | null
          cited_urls: Json | null
          competitors_mentioned: string[] | null
          confidence: number | null
          confidence_score: number | null
          created_at: string
          engine: string
          id: string
          is_cited: boolean
          is_mentioned: boolean
          latency_ms: number | null
          mention_context: string | null
          mention_count: number
          prompt_category: string | null
          prompt_library_id: string | null
          prompt_text: string | null
          queries_checked: number
          queries_mentioned: number
          query_type: string | null
          rank_position: number | null
          raw_response_hash: string | null
          response_excerpt: string | null
          scan_id: string
          sentiment: string | null
          sentiment_score: number | null
          tokens_used: number | null
        }
        Insert: {
          brands_mentioned?: Json | null
          business_id: string
          citations?: Json | null
          cited_by_name?: boolean | null
          cited_urls?: Json | null
          competitors_mentioned?: string[] | null
          confidence?: number | null
          confidence_score?: number | null
          created_at?: string
          engine: string
          id?: string
          is_cited?: boolean
          is_mentioned?: boolean
          latency_ms?: number | null
          mention_context?: string | null
          mention_count?: number
          prompt_category?: string | null
          prompt_library_id?: string | null
          prompt_text?: string | null
          queries_checked?: number
          queries_mentioned?: number
          query_type?: string | null
          rank_position?: number | null
          raw_response_hash?: string | null
          response_excerpt?: string | null
          scan_id: string
          sentiment?: string | null
          sentiment_score?: number | null
          tokens_used?: number | null
        }
        Update: {
          brands_mentioned?: Json | null
          business_id?: string
          citations?: Json | null
          cited_by_name?: boolean | null
          cited_urls?: Json | null
          competitors_mentioned?: string[] | null
          confidence?: number | null
          confidence_score?: number | null
          created_at?: string
          engine?: string
          id?: string
          is_cited?: boolean
          is_mentioned?: boolean
          latency_ms?: number | null
          mention_context?: string | null
          mention_count?: number
          prompt_category?: string | null
          prompt_library_id?: string | null
          prompt_text?: string | null
          queries_checked?: number
          queries_mentioned?: number
          query_type?: string | null
          rank_position?: number | null
          raw_response_hash?: string | null
          response_excerpt?: string | null
          scan_id?: string
          sentiment?: string | null
          sentiment_score?: number | null
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scan_engine_results_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scan_engine_results_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      scan_mentions: {
        Row: {
          created_at: string
          engine: string
          id: string
          mention_context: string | null
          mention_position: number | null
          mention_type: string | null
          query_id: string | null
          scan_id: string
        }
        Insert: {
          created_at?: string
          engine: string
          id?: string
          mention_context?: string | null
          mention_position?: number | null
          mention_type?: string | null
          query_id?: string | null
          scan_id: string
        }
        Update: {
          created_at?: string
          engine?: string
          id?: string
          mention_context?: string | null
          mention_position?: number | null
          mention_type?: string | null
          query_id?: string | null
          scan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scan_mentions_query_id_fkey"
            columns: ["query_id"]
            isOneToOne: false
            referencedRelation: "scan_queries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scan_mentions_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      scan_queries: {
        Row: {
          business_id: string
          created_at: string
          engines_used: string[]
          id: string
          is_tracked: boolean
          query_text: string
          query_type: string
          scan_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          engines_used?: string[]
          id?: string
          is_tracked?: boolean
          query_text: string
          query_type: string
          scan_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          engines_used?: string[]
          id?: string
          is_tracked?: boolean
          query_text?: string
          query_type?: string
          scan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scan_queries_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scan_queries_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      scans: {
        Row: {
          business_id: string
          completed_at: string | null
          created_at: string
          engines_queried: string[] | null
          engines_scanned: string[]
          error_message: string | null
          free_scan_id: string | null
          id: string
          mentions_count: number
          mock_engines: string[] | null
          overall_score: number | null
          projected_rank: number | null
          prompts_used: number | null
          queries_count: number
          rank_position: number | null
          results_summary: Json | null
          scan_type: string
          started_at: string | null
          status: Database["public"]["Enums"]["scan_status"]
          total_businesses_in_category: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          business_id: string
          completed_at?: string | null
          created_at?: string
          engines_queried?: string[] | null
          engines_scanned?: string[]
          error_message?: string | null
          free_scan_id?: string | null
          id?: string
          mentions_count?: number
          mock_engines?: string[] | null
          overall_score?: number | null
          projected_rank?: number | null
          prompts_used?: number | null
          queries_count?: number
          rank_position?: number | null
          results_summary?: Json | null
          scan_type?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["scan_status"]
          total_businesses_in_category?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          business_id?: string
          completed_at?: string | null
          created_at?: string
          engines_queried?: string[] | null
          engines_scanned?: string[]
          error_message?: string | null
          free_scan_id?: string | null
          id?: string
          mentions_count?: number
          mock_engines?: string[] | null
          overall_score?: number | null
          projected_rank?: number | null
          prompts_used?: number | null
          queries_count?: number
          rank_position?: number | null
          results_summary?: Json | null
          scan_type?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["scan_status"]
          total_businesses_in_category?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scans_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scans_free_scan_id_fkey"
            columns: ["free_scan_id"]
            isOneToOne: false
            referencedRelation: "free_scans"
            referencedColumns: ["id"]
          },
        ]
      }
      submission_packages: {
        Row: {
          agent_job_id: string | null
          agent_type: string
          business_id: string
          content_item_id: string | null
          created_at: string
          id: string
          instructions: string
          platform_name: string
          platform_url: string | null
          status: string
          submission_type: string
          submitted_at: string | null
          template_content: string | null
          user_id: string
          verification_scan_id: string | null
          verified_at: string | null
        }
        Insert: {
          agent_job_id?: string | null
          agent_type: string
          business_id: string
          content_item_id?: string | null
          created_at?: string
          id?: string
          instructions: string
          platform_name: string
          platform_url?: string | null
          status?: string
          submission_type: string
          submitted_at?: string | null
          template_content?: string | null
          user_id: string
          verification_scan_id?: string | null
          verified_at?: string | null
        }
        Update: {
          agent_job_id?: string | null
          agent_type?: string
          business_id?: string
          content_item_id?: string | null
          created_at?: string
          id?: string
          instructions?: string
          platform_name?: string
          platform_url?: string | null
          status?: string
          submission_type?: string
          submitted_at?: string | null
          template_content?: string | null
          user_id?: string
          verification_scan_id?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submission_packages_agent_job_id_fkey"
            columns: ["agent_job_id"]
            isOneToOne: false
            referencedRelation: "agent_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submission_packages_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submission_packages_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submission_packages_verification_scan_id_fkey"
            columns: ["verification_scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          autonomous_cap_pct: number
          billing_interval: string | null
          cancel_at: string | null
          cancel_at_period_end: boolean
          cancelled_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          paddle_customer_id: string | null
          paddle_subscription_id: string | null
          plan_id: string | null
          plan_tier: Database["public"]["Enums"]["plan_tier"] | null
          status: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at: string | null
          trial_started_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          autonomous_cap_pct?: number
          billing_interval?: string | null
          cancel_at?: string | null
          cancel_at_period_end?: boolean
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          paddle_customer_id?: string | null
          paddle_subscription_id?: string | null
          plan_id?: string | null
          plan_tier?: Database["public"]["Enums"]["plan_tier"] | null
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string | null
          trial_started_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          autonomous_cap_pct?: number
          billing_interval?: string | null
          cancel_at?: string | null
          cancel_at_period_end?: boolean
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          paddle_customer_id?: string | null
          paddle_subscription_id?: string | null
          plan_id?: string | null
          plan_tier?: Database["public"]["Enums"]["plan_tier"] | null
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string | null
          trial_started_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      suggestions: {
        Row: {
          accepted_at: string | null
          agent_type: string
          business_id: string
          created_at: string
          description: string
          estimated_runs: number
          evidence: Json | null
          expires_at: string | null
          id: string
          impact: string
          scan_id: string | null
          status: string
          target_query_ids: string[] | null
          target_url: string | null
          title: string
          trigger_rule: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          agent_type: string
          business_id: string
          created_at?: string
          description: string
          estimated_runs?: number
          evidence?: Json | null
          expires_at?: string | null
          id?: string
          impact?: string
          scan_id?: string | null
          status?: string
          target_query_ids?: string[] | null
          target_url?: string | null
          title: string
          trigger_rule?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          agent_type?: string
          business_id?: string
          created_at?: string
          description?: string
          estimated_runs?: number
          evidence?: Json | null
          expires_at?: string | null
          id?: string
          impact?: string
          scan_id?: string | null
          status?: string
          target_query_ids?: string[] | null
          target_url?: string | null
          title?: string
          trigger_rule?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suggestions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suggestions_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      topic_ledger: {
        Row: {
          agent_type: string
          business_id: string
          content_item_id: string | null
          created_at: string
          expires_at: string
          id: string
          topic_hash: string
          topic_title: string
        }
        Insert: {
          agent_type: string
          business_id: string
          content_item_id?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          topic_hash: string
          topic_title: string
        }
        Update: {
          agent_type?: string
          business_id?: string
          content_item_id?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          topic_hash?: string
          topic_title?: string
        }
        Relationships: [
          {
            foreignKeyName: "topic_ledger_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topic_ledger_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      tracked_queries: {
        Row: {
          added_source: string
          business_id: string
          competitor_presence: Json | null
          created_at: string
          engines_visible: string[] | null
          id: string
          is_active: boolean
          last_scanned_at: string | null
          opportunity_score: number | null
          priority: string
          query_category: string | null
          query_run_id: string | null
          query_text: string
          target_url: string | null
          user_id: string
        }
        Insert: {
          added_source?: string
          business_id: string
          competitor_presence?: Json | null
          created_at?: string
          engines_visible?: string[] | null
          id?: string
          is_active?: boolean
          last_scanned_at?: string | null
          opportunity_score?: number | null
          priority?: string
          query_category?: string | null
          query_run_id?: string | null
          query_text: string
          target_url?: string | null
          user_id: string
        }
        Update: {
          added_source?: string
          business_id?: string
          competitor_presence?: Json | null
          created_at?: string
          engines_visible?: string[] | null
          id?: string
          is_active?: boolean
          last_scanned_at?: string | null
          opportunity_score?: number | null
          priority?: string
          query_category?: string | null
          query_run_id?: string | null
          query_text?: string
          target_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracked_queries_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      url_probes: {
        Row: {
          archive_item_id: string | null
          attempts: number
          created_at: string | null
          id: string
          next_probe_at: string | null
          probe_at: string | null
          result: Json | null
          status: string
          url: string
          user_id: string
        }
        Insert: {
          archive_item_id?: string | null
          attempts?: number
          created_at?: string | null
          id?: string
          next_probe_at?: string | null
          probe_at?: string | null
          result?: Json | null
          status?: string
          url: string
          user_id: string
        }
        Update: {
          archive_item_id?: string | null
          attempts?: number
          created_at?: string | null
          id?: string
          next_probe_at?: string | null
          probe_at?: string | null
          result?: Json | null
          status?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          automation_paused_at: string | null
          avatar_url: string | null
          content_lang: string
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          interface_lang: string
          is_admin: boolean
          is_preview: boolean
          locale: string | null
          onboarding_completed_at: string | null
          onboarding_scan_id: string | null
          onboarding_step: number
          timezone: string
          updated_at: string
        }
        Insert: {
          automation_paused_at?: string | null
          avatar_url?: string | null
          content_lang?: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          interface_lang?: string
          is_admin?: boolean
          is_preview?: boolean
          locale?: string | null
          onboarding_completed_at?: string | null
          onboarding_scan_id?: string | null
          onboarding_step?: number
          timezone?: string
          updated_at?: string
        }
        Update: {
          automation_paused_at?: string | null
          avatar_url?: string | null
          content_lang?: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          interface_lang?: string
          is_admin?: boolean
          is_preview?: boolean
          locale?: string | null
          onboarding_completed_at?: string | null
          onboarding_scan_id?: string | null
          onboarding_step?: number
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_onboarding_scan_id_fkey"
            columns: ["onboarding_scan_id"]
            isOneToOne: false
            referencedRelation: "free_scans"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_runs: {
        Row: {
          agent_job_ids: string[] | null
          completed_at: string | null
          credits_used: number | null
          id: string
          results_summary: Json | null
          started_at: string
          status: string
          steps_completed: number | null
          steps_total: number
          trigger_event: Json
          user_id: string
          workflow_id: string
        }
        Insert: {
          agent_job_ids?: string[] | null
          completed_at?: string | null
          credits_used?: number | null
          id?: string
          results_summary?: Json | null
          started_at?: string
          status?: string
          steps_completed?: number | null
          steps_total: number
          trigger_event: Json
          user_id: string
          workflow_id: string
        }
        Update: {
          agent_job_ids?: string[] | null
          completed_at?: string | null
          credits_used?: number | null
          id?: string
          results_summary?: Json | null
          started_at?: string
          status?: string
          steps_completed?: number | null
          steps_total?: number
          trigger_event?: Json
          user_id?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_runs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "agent_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      acquire_page_lock: {
        Args: {
          p_agent_job_id: string
          p_agent_type: string
          p_business_id: string
          p_page_url: string
        }
        Returns: Json
      }
      allocate_monthly_credits: {
        Args: {
          p_period_end?: string
          p_period_start?: string
          p_plan_id: string
          p_user_id: string
        }
        Returns: Json
      }
      check_topic_duplicate: {
        Args: { p_business_id: string; p_topic_hash: string }
        Returns: boolean
      }
      clean_expired_locks: { Args: never; Returns: number }
      clean_expired_topics: { Args: never; Returns: number }
      confirm_credits: { Args: { p_job_id: string }; Returns: Json }
      deduct_credits: {
        Args: {
          p_agent_job_id?: string
          p_amount: number
          p_description?: string
          p_pool_type: Database["public"]["Enums"]["credit_pool_type"]
          p_user_id: string
        }
        Returns: boolean
      }
      expire_old_suggestions: { Args: never; Returns: number }
      get_due_automations: {
        Args: { p_limit?: number }
        Returns: {
          agent_type: string
          business_id: string
          cadence: string
          config: Json
          id: string
          user_id: string
        }[]
      }
      get_home_summary: {
        Args: { p_business_id: string; p_user_id: string }
        Returns: Json
      }
      get_inbox_items: {
        Args: {
          p_limit?: number
          p_offset?: number
          p_status?: string
          p_user_id: string
        }
        Returns: {
          agent_type: string
          created_at: string
          estimated_impact: string
          evidence: Json
          id: string
          status: string
          target_queries: string[]
          title: string
          trigger_reason: string
          updated_at: string
        }[]
      }
      get_query_trend: {
        Args: {
          p_business_id: string
          p_days?: number
          p_engine?: string
          p_tracked_query_id: string
        }
        Returns: {
          brands_mentioned: Json
          created_at: string
          engine: string
          is_mentioned: boolean
          rank_position: number
          scan_id: string
        }[]
      }
      hold_credits: {
        Args: { p_amount: number; p_job_id: string; p_user_id: string }
        Returns: Json
      }
      release_credits: { Args: { p_job_id: string }; Returns: Json }
      release_page_lock: {
        Args: { p_agent_job_id: string }
        Returns: undefined
      }
    }
    Enums: {
      agent_job_status:
        | "pending"
        | "running"
        | "completed"
        | "failed"
        | "cancelled"
      agent_type:
        | "content_writer"
        | "blog_writer"
        | "faq_agent"
        | "schema_optimizer"
        | "review_analyzer"
        | "social_strategy"
        | "competitor_intelligence"
        | "recommendations"
        | "citation_builder"
        | "llms_txt"
        | "ai_readiness"
        | "content_voice_trainer"
        | "content_pattern_analyzer"
        | "content_refresh"
        | "brand_narrative_analyst"
        | "query_mapper"
        | "content_optimizer"
        | "freshness_agent"
        | "faq_builder"
        | "schema_generator"
        | "offsite_presence_builder"
        | "review_presence_planner"
        | "entity_builder"
        | "authority_blog_strategist"
        | "performance_tracker"
        | "reddit_presence_planner"
        | "video_seo_agent"
      blog_post_status: "draft" | "scheduled" | "published" | "archived"
      content_format:
        | "markdown"
        | "html"
        | "json_ld"
        | "plain_text"
        | "structured_report"
      content_item_status:
        | "draft"
        | "ready"
        | "published"
        | "archived"
        | "in_review"
        | "approved"
        | "rejected"
      credit_pool_type:
        | "agent"
        | "scan"
        | "report"
        | "monthly"
        | "topup"
        | "trial"
      credit_transaction_type:
        | "allocation"
        | "usage"
        | "topup"
        | "rollover"
        | "refund"
        | "adjustment"
        | "hold"
        | "confirm"
        | "release"
        | "expire"
        | "system_grant"
      plan_tier: "starter" | "pro" | "business" | "discover" | "build" | "scale"
      recommendation_priority: "high" | "medium" | "low"
      recommendation_status:
        | "pending"
        | "in_progress"
        | "done"
        | "dismissed"
        | "new"
        | "completed"
      scan_status: "pending" | "processing" | "completed" | "failed" | "expired"
      subscription_status:
        | "trialing"
        | "active"
        | "past_due"
        | "cancelled"
        | "expired"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      agent_job_status: [
        "pending",
        "running",
        "completed",
        "failed",
        "cancelled",
      ],
      agent_type: [
        "content_writer",
        "blog_writer",
        "faq_agent",
        "schema_optimizer",
        "review_analyzer",
        "social_strategy",
        "competitor_intelligence",
        "recommendations",
        "citation_builder",
        "llms_txt",
        "ai_readiness",
        "content_voice_trainer",
        "content_pattern_analyzer",
        "content_refresh",
        "brand_narrative_analyst",
        "query_mapper",
        "content_optimizer",
        "freshness_agent",
        "faq_builder",
        "schema_generator",
        "offsite_presence_builder",
        "review_presence_planner",
        "entity_builder",
        "authority_blog_strategist",
        "performance_tracker",
        "reddit_presence_planner",
        "video_seo_agent",
      ],
      blog_post_status: ["draft", "scheduled", "published", "archived"],
      content_format: [
        "markdown",
        "html",
        "json_ld",
        "plain_text",
        "structured_report",
      ],
      content_item_status: [
        "draft",
        "ready",
        "published",
        "archived",
        "in_review",
        "approved",
        "rejected",
      ],
      credit_pool_type: [
        "agent",
        "scan",
        "report",
        "monthly",
        "topup",
        "trial",
      ],
      credit_transaction_type: [
        "allocation",
        "usage",
        "topup",
        "rollover",
        "refund",
        "adjustment",
        "hold",
        "confirm",
        "release",
        "expire",
        "system_grant",
      ],
      plan_tier: ["starter", "pro", "business", "discover", "build", "scale"],
      recommendation_priority: ["high", "medium", "low"],
      recommendation_status: [
        "pending",
        "in_progress",
        "done",
        "dismissed",
        "new",
        "completed",
      ],
      scan_status: ["pending", "processing", "completed", "failed", "expired"],
      subscription_status: [
        "trialing",
        "active",
        "past_due",
        "cancelled",
        "expired",
      ],
    },
  },
} as const

