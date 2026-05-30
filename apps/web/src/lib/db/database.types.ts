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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      agent_costs: {
        Row: {
          completion_tokens: number
          cost_usd: number
          created_at: string
          id: string
          job_id: string
          model: string
          prompt_tokens: number
          provider: string
          stage: Database["public"]["Enums"]["pipeline_stage"]
          user_id: string
        }
        Insert: {
          completion_tokens?: number
          cost_usd?: number
          created_at?: string
          id?: string
          job_id: string
          model: string
          prompt_tokens?: number
          provider: string
          stage: Database["public"]["Enums"]["pipeline_stage"]
          user_id: string
        }
        Update: {
          completion_tokens?: number
          cost_usd?: number
          created_at?: string
          id?: string
          job_id?: string
          model?: string
          prompt_tokens?: number
          provider?: string
          stage?: Database["public"]["Enums"]["pipeline_stage"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_costs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "agent_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_job_outputs: {
        Row: {
          content_format: string
          created_at: string
          estimated_impact: string | null
          geo_signals: Json | null
          id: string
          job_id: string
          primary_content: string
          summary_text: string | null
          target_queries: string[] | null
          ymyl_flagged: boolean
        }
        Insert: {
          content_format?: string
          created_at?: string
          estimated_impact?: string | null
          geo_signals?: Json | null
          id?: string
          job_id: string
          primary_content: string
          summary_text?: string | null
          target_queries?: string[] | null
          ymyl_flagged?: boolean
        }
        Update: {
          content_format?: string
          created_at?: string
          estimated_impact?: string | null
          geo_signals?: Json | null
          id?: string
          job_id?: string
          primary_content?: string
          summary_text?: string | null
          target_queries?: string[] | null
          ymyl_flagged?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "agent_job_outputs_job_id_fkey"
            columns: ["job_id"]
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
          credit_cost: number
          custom_instructions: string | null
          error_message: string | null
          id: string
          inngest_run_id: string | null
          plan_tier: Database["public"]["Enums"]["plan_tier"]
          scan_id: string | null
          stage: Database["public"]["Enums"]["pipeline_stage"] | null
          started_at: string | null
          status: Database["public"]["Enums"]["agent_job_status"]
          target_content: string | null
          target_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_type: Database["public"]["Enums"]["agent_type"]
          business_id: string
          completed_at?: string | null
          created_at?: string
          credit_cost?: number
          custom_instructions?: string | null
          error_message?: string | null
          id?: string
          inngest_run_id?: string | null
          plan_tier: Database["public"]["Enums"]["plan_tier"]
          scan_id?: string | null
          stage?: Database["public"]["Enums"]["pipeline_stage"] | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["agent_job_status"]
          target_content?: string | null
          target_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_type?: Database["public"]["Enums"]["agent_type"]
          business_id?: string
          completed_at?: string | null
          created_at?: string
          credit_cost?: number
          custom_instructions?: string | null
          error_message?: string | null
          id?: string
          inngest_run_id?: string | null
          plan_tier?: Database["public"]["Enums"]["plan_tier"]
          scan_id?: string | null
          stage?: Database["public"]["Enums"]["pipeline_stage"] | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["agent_job_status"]
          target_content?: string | null
          target_url?: string | null
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
      archive_items: {
        Row: {
          agent_type: Database["public"]["Enums"]["agent_type"] | null
          archived_at: string
          business_id: string
          content_item_id: string | null
          created_at: string
          id: string
          inbox_item_id: string | null
          job_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          agent_type?: Database["public"]["Enums"]["agent_type"] | null
          archived_at?: string
          business_id: string
          content_item_id?: string | null
          created_at?: string
          id?: string
          inbox_item_id?: string | null
          job_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          agent_type?: Database["public"]["Enums"]["agent_type"] | null
          archived_at?: string
          business_id?: string
          content_item_id?: string | null
          created_at?: string
          id?: string
          inbox_item_id?: string | null
          job_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "archive_items_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "archive_items_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "archive_items_inbox_item_id_fkey"
            columns: ["inbox_item_id"]
            isOneToOne: false
            referencedRelation: "inbox_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "archive_items_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "agent_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          actor_id: string | null
          actor_type: string
          created_at: string
          event_type: string
          id: string
          payload: Json
          prev_hash: string | null
          target_id: string | null
          target_table: string | null
        }
        Insert: {
          actor_id?: string | null
          actor_type: string
          created_at?: string
          event_type: string
          id?: string
          payload?: Json
          prev_hash?: string | null
          target_id?: string | null
          target_table?: string | null
        }
        Update: {
          actor_id?: string | null
          actor_type?: string
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json
          prev_hash?: string | null
          target_id?: string | null
          target_table?: string | null
        }
        Relationships: []
      }
      automation_schedules: {
        Row: {
          agent_type: Database["public"]["Enums"]["agent_type"]
          business_id: string
          created_at: string
          cron_expression: string | null
          id: string
          is_active: boolean
          last_run_at: string | null
          next_run_at: string | null
          run_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_type: Database["public"]["Enums"]["agent_type"]
          business_id: string
          created_at?: string
          cron_expression?: string | null
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          next_run_at?: string | null
          run_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_type?: Database["public"]["Enums"]["agent_type"]
          business_id?: string
          created_at?: string
          cron_expression?: string | null
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          next_run_at?: string | null
          run_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_schedules_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          created_at: string
          description: string | null
          id: string
          industry: string | null
          language: string
          location: string | null
          name: string
          services: string[]
          updated_at: string
          user_id: string
          website_url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          language?: string
          location?: string | null
          name: string
          services?: string[]
          updated_at?: string
          user_id: string
          website_url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          language?: string
          location?: string | null
          name?: string
          services?: string[]
          updated_at?: string
          user_id?: string
          website_url?: string
        }
        Relationships: []
      }
      citation_signals: {
        Row: {
          business_id: string
          cited_url: string
          detected_at: string
          engine: string
          id: string
          query_text: string
        }
        Insert: {
          business_id: string
          cited_url: string
          detected_at?: string
          engine: string
          id?: string
          query_text: string
        }
        Update: {
          business_id?: string
          cited_url?: string
          detected_at?: string
          engine?: string
          id?: string
          query_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "citation_signals_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor_results: {
        Row: {
          business_id: string
          citations: string[] | null
          competitor_id: string
          created_at: string
          engine: string
          id: string
          is_mentioned: boolean
          rank_position: number | null
          scan_id: string | null
          sentiment: string | null
        }
        Insert: {
          business_id: string
          citations?: string[] | null
          competitor_id: string
          created_at?: string
          engine: string
          id?: string
          is_mentioned?: boolean
          rank_position?: number | null
          scan_id?: string | null
          sentiment?: string | null
        }
        Update: {
          business_id?: string
          citations?: string[] | null
          competitor_id?: string
          created_at?: string
          engine?: string
          id?: string
          is_mentioned?: boolean
          rank_position?: number | null
          scan_id?: string | null
          sentiment?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competitor_results_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitor_results_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "competitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitor_results_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      competitors: {
        Row: {
          business_id: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
          website_url: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          website_url: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
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
          agent_type: Database["public"]["Enums"]["agent_type"] | null
          business_id: string
          content_format: string
          created_at: string
          geo_signals: Json | null
          id: string
          job_id: string | null
          primary_content: string
          summary_text: string | null
          target_queries: string[] | null
          updated_at: string
          user_id: string
          ymyl_flagged: boolean
        }
        Insert: {
          agent_type?: Database["public"]["Enums"]["agent_type"] | null
          business_id: string
          content_format?: string
          created_at?: string
          geo_signals?: Json | null
          id?: string
          job_id?: string | null
          primary_content: string
          summary_text?: string | null
          target_queries?: string[] | null
          updated_at?: string
          user_id: string
          ymyl_flagged?: boolean
        }
        Update: {
          agent_type?: Database["public"]["Enums"]["agent_type"] | null
          business_id?: string
          content_format?: string
          created_at?: string
          geo_signals?: Json | null
          id?: string
          job_id?: string | null
          primary_content?: string
          summary_text?: string | null
          target_queries?: string[] | null
          updated_at?: string
          user_id?: string
          ymyl_flagged?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "content_items_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_items_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "agent_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_holds: {
        Row: {
          agent_type: Database["public"]["Enums"]["agent_type"]
          amount: number
          confirmed: boolean
          expires_at: string
          held_at: string
          job_id: string
          released: boolean
          user_id: string
        }
        Insert: {
          agent_type: Database["public"]["Enums"]["agent_type"]
          amount: number
          confirmed?: boolean
          expires_at?: string
          held_at?: string
          job_id: string
          released?: boolean
          user_id: string
        }
        Update: {
          agent_type?: Database["public"]["Enums"]["agent_type"]
          amount?: number
          confirmed?: boolean
          expires_at?: string
          held_at?: string
          job_id?: string
          released?: boolean
          user_id?: string
        }
        Relationships: []
      }
      credit_pools: {
        Row: {
          base_allocation: number
          billing_period_start: string
          created_at: string
          id: string
          plan_id: string | null
          rollover_amount: number
          topup_amount: number
          updated_at: string
          used_amount: number
          user_id: string
        }
        Insert: {
          base_allocation?: number
          billing_period_start: string
          created_at?: string
          id?: string
          plan_id?: string | null
          rollover_amount?: number
          topup_amount?: number
          updated_at?: string
          used_amount?: number
          user_id: string
        }
        Update: {
          base_allocation?: number
          billing_period_start?: string
          created_at?: string
          id?: string
          plan_id?: string | null
          rollover_amount?: number
          topup_amount?: number
          updated_at?: string
          used_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_pools_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          agent_job_id: string | null
          amount: number
          created_at: string
          description: string | null
          id: string
          pool_id: string | null
          pool_type: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          agent_job_id?: string | null
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          pool_id?: string | null
          pool_type?: string
          transaction_type: string
          user_id: string
        }
        Update: {
          agent_job_id?: string | null
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          pool_id?: string | null
          pool_type?: string
          transaction_type?: string
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
          created_at: string
          daily_cap: number
          id: string
          updated_at: string
          usage_date: string
          used_today: number
          user_id: string
        }
        Insert: {
          agent_type: Database["public"]["Enums"]["agent_type"]
          created_at?: string
          daily_cap?: number
          id?: string
          updated_at?: string
          usage_date?: string
          used_today?: number
          user_id: string
        }
        Update: {
          agent_type?: Database["public"]["Enums"]["agent_type"]
          created_at?: string
          daily_cap?: number
          id?: string
          updated_at?: string
          usage_date?: string
          used_today?: number
          user_id?: string
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      inbox_items: {
        Row: {
          agent_type: Database["public"]["Enums"]["agent_type"] | null
          approved_at: string | null
          business_id: string
          content_item_id: string | null
          created_at: string
          id: string
          job_id: string | null
          preview_text: string | null
          rejected_at: string | null
          reviewed_at: string | null
          status: Database["public"]["Enums"]["inbox_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_type?: Database["public"]["Enums"]["agent_type"] | null
          approved_at?: string | null
          business_id: string
          content_item_id?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          preview_text?: string | null
          rejected_at?: string | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["inbox_status"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_type?: Database["public"]["Enums"]["agent_type"] | null
          approved_at?: string | null
          business_id?: string
          content_item_id?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          preview_text?: string | null
          rejected_at?: string | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["inbox_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inbox_items_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inbox_items_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inbox_items_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "agent_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          business_id: string | null
          created_at: string
          id: string
          is_read: boolean
          metadata: Json | null
          notification_type: Database["public"]["Enums"]["notification_type"]
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          business_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          metadata?: Json | null
          notification_type: Database["public"]["Enums"]["notification_type"]
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          business_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          metadata?: Json | null
          notification_type?: Database["public"]["Enums"]["notification_type"]
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      paddle_webhook_events: {
        Row: {
          event_id: string
          event_type: string
          payload: Json
          received_at: string
        }
        Insert: {
          event_id: string
          event_type: string
          payload: Json
          received_at?: string
        }
        Update: {
          event_id?: string
          event_type?: string
          payload?: Json
          received_at?: string
        }
        Relationships: []
      }
      page_locks: {
        Row: {
          business_id: string
          created_at: string
          expires_at: string
          id: string
          locked_by: string
          url: string
        }
        Insert: {
          business_id: string
          created_at?: string
          expires_at?: string
          id?: string
          locked_by: string
          url: string
        }
        Update: {
          business_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          locked_by?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_locks_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "page_locks_locked_by_fkey"
            columns: ["locked_by"]
            isOneToOne: false
            referencedRelation: "agent_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string
          id: string
          monthly_credits: number
          name: string
          paddle_price_id_annual: string | null
          paddle_price_id_monthly: string | null
          tier: Database["public"]["Enums"]["plan_tier"]
        }
        Insert: {
          created_at?: string
          id?: string
          monthly_credits?: number
          name: string
          paddle_price_id_annual?: string | null
          paddle_price_id_monthly?: string | null
          tier: Database["public"]["Enums"]["plan_tier"]
        }
        Update: {
          created_at?: string
          id?: string
          monthly_credits?: number
          name?: string
          paddle_price_id_annual?: string | null
          paddle_price_id_monthly?: string | null
          tier?: Database["public"]["Enums"]["plan_tier"]
        }
        Relationships: []
      }
      query_clusters: {
        Row: {
          business_id: string
          cluster_name: string
          created_at: string
          id: string
          intent: string | null
        }
        Insert: {
          business_id: string
          cluster_name: string
          created_at?: string
          id?: string
          intent?: string | null
        }
        Update: {
          business_id?: string
          cluster_name?: string
          created_at?: string
          id?: string
          intent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "query_clusters_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      query_positions: {
        Row: {
          business_id: string
          created_at: string
          engine: string
          id: string
          is_mentioned: boolean
          position: number | null
          query_id: string | null
          query_text: string
          scan_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          engine: string
          id?: string
          is_mentioned?: boolean
          position?: number | null
          query_id?: string | null
          query_text: string
          scan_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          engine?: string
          id?: string
          is_mentioned?: boolean
          position?: number | null
          query_id?: string | null
          query_text?: string
          scan_id?: string
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
            foreignKeyName: "query_positions_query_id_fkey"
            columns: ["query_id"]
            isOneToOne: false
            referencedRelation: "tracked_queries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "query_positions_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
        ]
      }
      scan_engine_results: {
        Row: {
          business_id: string
          citations: string[] | null
          created_at: string
          engine: string
          id: string
          is_mentioned: boolean
          query_used: string | null
          rank_position: number | null
          raw_response: string | null
          scan_id: string
          sentiment: string | null
        }
        Insert: {
          business_id: string
          citations?: string[] | null
          created_at?: string
          engine: string
          id?: string
          is_mentioned?: boolean
          query_used?: string | null
          rank_position?: number | null
          raw_response?: string | null
          scan_id: string
          sentiment?: string | null
        }
        Update: {
          business_id?: string
          citations?: string[] | null
          created_at?: string
          engine?: string
          id?: string
          is_mentioned?: boolean
          query_used?: string | null
          rank_position?: number | null
          raw_response?: string | null
          scan_id?: string
          sentiment?: string | null
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
      scans: {
        Row: {
          business_id: string
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          metadata: Json | null
          scan_type: string
          started_at: string | null
          status: string
        }
        Insert: {
          business_id: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          scan_type?: string
          started_at?: string | null
          status?: string
        }
        Update: {
          business_id?: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          scan_type?: string
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "scans_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancelled_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          paddle_customer_id: string | null
          paddle_subscription_id: string | null
          plan_id: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          trial_end: string | null
          trial_start: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          paddle_customer_id?: string | null
          paddle_subscription_id?: string | null
          plan_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          paddle_customer_id?: string | null
          paddle_subscription_id?: string | null
          plan_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      suggestions: {
        Row: {
          agent_type: Database["public"]["Enums"]["agent_type"]
          business_id: string
          converted_at: string | null
          converted_job_id: string | null
          created_at: string
          description: string | null
          dismissed_at: string | null
          estimated_impact: string | null
          id: string
          rationale: string | null
          status: Database["public"]["Enums"]["suggestion_status"]
          title: string
          updated_at: string
          user_id: string
          visible_at: string
        }
        Insert: {
          agent_type: Database["public"]["Enums"]["agent_type"]
          business_id: string
          converted_at?: string | null
          converted_job_id?: string | null
          created_at?: string
          description?: string | null
          dismissed_at?: string | null
          estimated_impact?: string | null
          id?: string
          rationale?: string | null
          status?: Database["public"]["Enums"]["suggestion_status"]
          title: string
          updated_at?: string
          user_id: string
          visible_at?: string
        }
        Update: {
          agent_type?: Database["public"]["Enums"]["agent_type"]
          business_id?: string
          converted_at?: string | null
          converted_job_id?: string | null
          created_at?: string
          description?: string | null
          dismissed_at?: string | null
          estimated_impact?: string | null
          id?: string
          rationale?: string | null
          status?: Database["public"]["Enums"]["suggestion_status"]
          title?: string
          updated_at?: string
          user_id?: string
          visible_at?: string
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
            foreignKeyName: "suggestions_converted_job_id_fkey"
            columns: ["converted_job_id"]
            isOneToOne: false
            referencedRelation: "agent_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      system_kill_switch: {
        Row: {
          id: number
          paused_by: string | null
          paused_until: string | null
          reason: string | null
          updated_at: string
        }
        Insert: {
          id?: number
          paused_by?: string | null
          paused_until?: string | null
          reason?: string | null
          updated_at?: string
        }
        Update: {
          id?: number
          paused_by?: string | null
          paused_until?: string | null
          reason?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      topic_ledger: {
        Row: {
          agent_type: Database["public"]["Enums"]["agent_type"]
          business_id: string
          id: string
          job_id: string | null
          registered_at: string
          topic_key: string
        }
        Insert: {
          agent_type: Database["public"]["Enums"]["agent_type"]
          business_id: string
          id?: string
          job_id?: string | null
          registered_at?: string
          topic_key: string
        }
        Update: {
          agent_type?: Database["public"]["Enums"]["agent_type"]
          business_id?: string
          id?: string
          job_id?: string | null
          registered_at?: string
          topic_key?: string
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
            foreignKeyName: "topic_ledger_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "agent_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      topic_ledger_archive: {
        Row: {
          agent_type: Database["public"]["Enums"]["agent_type"]
          business_id: string
          id: string
          job_id: string | null
          registered_at: string
          topic_key: string
        }
        Insert: {
          agent_type: Database["public"]["Enums"]["agent_type"]
          business_id: string
          id?: string
          job_id?: string | null
          registered_at?: string
          topic_key: string
        }
        Update: {
          agent_type?: Database["public"]["Enums"]["agent_type"]
          business_id?: string
          id?: string
          job_id?: string | null
          registered_at?: string
          topic_key?: string
        }
        Relationships: []
      }
      tracked_queries: {
        Row: {
          business_id: string
          cluster_id: string | null
          created_at: string
          id: string
          intent: string | null
          is_active: boolean
          query_text: string
          updated_at: string
          volume_estimate: number | null
        }
        Insert: {
          business_id: string
          cluster_id?: string | null
          created_at?: string
          id?: string
          intent?: string | null
          is_active?: boolean
          query_text: string
          updated_at?: string
          volume_estimate?: number | null
        }
        Update: {
          business_id?: string
          cluster_id?: string | null
          created_at?: string
          id?: string
          intent?: string | null
          is_active?: boolean
          query_text?: string
          updated_at?: string
          volume_estimate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tracked_queries_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracked_queries_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "query_clusters"
            referencedColumns: ["id"]
          },
        ]
      }
      url_probes: {
        Row: {
          business_id: string
          completed_at: string | null
          error_message: string | null
          queued_at: string
          result: Json | null
          status: string
          url: string
        }
        Insert: {
          business_id: string
          completed_at?: string | null
          error_message?: string | null
          queued_at?: string
          result?: Json | null
          status?: string
          url: string
        }
        Update: {
          business_id?: string
          completed_at?: string | null
          error_message?: string | null
          queued_at?: string
          result?: Json | null
          status?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "url_probes_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          day1_completed_at: string | null
          day1_state: Json | null
          deleted_at: string | null
          disclosure_acknowledged_at: string | null
          email: string
          full_name: string | null
          id: string
          kill_switch_until: string | null
          onboarding_completed_at: string | null
          timezone: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          day1_completed_at?: string | null
          day1_state?: Json | null
          deleted_at?: string | null
          disclosure_acknowledged_at?: string | null
          email: string
          full_name?: string | null
          id: string
          kill_switch_until?: string | null
          onboarding_completed_at?: string | null
          timezone?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          day1_completed_at?: string | null
          day1_state?: Json | null
          deleted_at?: string | null
          disclosure_acknowledged_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          kill_switch_until?: string | null
          onboarding_completed_at?: string | null
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      allocate_monthly_credits: {
        Args: {
          p_billing_period_start: string
          p_plan_id: string
          p_user_id: string
        }
        Returns: string
      }
      consume_deliverable: {
        Args: {
          p_customer_id: string
          p_month_anchor: string
          p_kind: string
          p_cap: number
        }
        Returns: number | null
      }
      cleanup_page_locks: { Args: never; Returns: number }
      cleanup_topic_ledger: { Args: never; Returns: number }
      confirm_credits: { Args: { p_job_id: string }; Returns: undefined }
      hold_credits: {
        Args: {
          p_agent_type: Database["public"]["Enums"]["agent_type"]
          p_amount: number
          p_job_id: string
          p_user_id: string
        }
        Returns: Json
      }
      record_webhook_event: {
        Args: { p_event_id: string; p_event_type: string; p_payload: Json }
        Returns: string
      }
      release_credits: { Args: { p_job_id: string }; Returns: undefined }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      agent_job_status:
        | "queued"
        | "running"
        | "qa_failed"
        | "succeeded"
        | "failed"
        | "cancelled"
      agent_type:
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
      inbox_status:
        | "draft"
        | "review"
        | "approved"
        | "archived"
        | "rejected"
        | "failed"
      notification_type:
        | "item_ready"
        | "scan_complete"
        | "budget_75"
        | "budget_100"
        | "competitor_alert"
        | "suggestion_generated"
        | "day1_ready"
        | "run_failed"
      pipeline_stage: "plan" | "research" | "do" | "qa" | "summarize"
      plan_tier: "discover" | "build" | "scale"
      subscription_status:
        | "trialing"
        | "active"
        | "past_due"
        | "paused"
        | "cancelled"
      suggestion_status: "pending" | "running" | "dismissed" | "converted"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      agent_job_status: [
        "queued",
        "running",
        "qa_failed",
        "succeeded",
        "failed",
        "cancelled",
      ],
      agent_type: [
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
      ],
      inbox_status: [
        "draft",
        "review",
        "approved",
        "archived",
        "rejected",
        "failed",
      ],
      notification_type: [
        "item_ready",
        "scan_complete",
        "budget_75",
        "budget_100",
        "competitor_alert",
        "suggestion_generated",
        "day1_ready",
        "run_failed",
      ],
      pipeline_stage: ["plan", "research", "do", "qa", "summarize"],
      plan_tier: ["discover", "build", "scale"],
      subscription_status: [
        "trialing",
        "active",
        "past_due",
        "paused",
        "cancelled",
      ],
      suggestion_status: ["pending", "running", "dismissed", "converted"],
    },
  },
} as const
