// ========================================
// Database Types (matching Supabase schema)
// ========================================

export interface Customer {
    id: string;
    name: string | null;
    email: string;
    company_name: string | null;
    website_url: string | null;
    plan_id: "free" | "pro" | "enterprise";
    plan_name: string | null;
    subscription_status: "active" | "cancelled" | "past_due" | null;
    business_category: string | null;
    region: string | null;
    language: string | null;
    created_at: string;
    updated_at: string | null;
}

export interface ProspectLead {
    id: string;
    client_id: string | null;
    company_name: string | null;
    domain: string | null;
    business_category: string | null;
    source: string | null;
    status: "identified" | "scraped" | "analyzed" | "archived" | null;
    lead_score: number | null;
    gmb_data: Record<string, unknown> | null;
    last_scraped_at: string | null;
    created_at: string;
}

export interface AnalysisResult {
    id: string;
    client_id: string;
    analysis_date: string | null;
    competitor_list: Record<string, unknown> | null;
    gaps_identified: Record<string, unknown> | null;
    ranking_analysis: Record<string, unknown> | null;
    content_recommendations: Record<string, unknown> | null;
    review_insights: Record<string, unknown> | null;
    report_url: string | null;
    created_at: string;
}

export interface RankingHistory {
    id: string;
    site_id: string;
    query_id: string;
    ranking_position: number | null;
    is_mentioned: boolean | null;
    confidence_score: number | null;
    competitor_positions: Record<string, unknown> | null;
    month_year: string | null;
    created_at: string;
}

export interface AutomationLog {
    id: string;
    workflow_name: string | null;
    workflow_id: string | null;
    client_id: string | null;
    status: "pending" | "running" | "success" | "failed" | "cancelled" | null;
    total_api_calls_made: number | null;
    total_cost_usd: number | null;
    runtime_seconds: number | null;
    error_message: string | null;
    cost_breakdown: Record<string, unknown> | null;
    started_at: string | null;
    completed_at: string | null;
    created_at: string;
}

// ========================================
// API Types
// ========================================

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

// ========================================
// Auth Types
// ========================================

export interface SignupData {
    email: string;
    password: string;
    company_name?: string;
}

export interface LoginData {
    email: string;
    password: string;
}

// ========================================
// Dashboard Types
// ========================================

export interface QueryRanking {
    id: string;
    query: string;
    position: number;
    previousPosition: number | null;
    change: number;
    topCompetitor: string | null;
    confidence: number;
    lastUpdated: string;
}

export interface ContentGap {
    id: string;
    title: string;
    description: string;
    format: "faq" | "blog" | "landing" | "video";
    priority: "high" | "medium" | "low";
    draftContent: string | null;
    status: "pending" | "in_progress" | "done";
}

export interface ReviewInsight {
    averageRating: number;
    totalReviews: number;
    topPraise: string[];
    topComplaints: string[];
    competitorRating: number;
    competitorReviews: number;
    suggestedTemplate: string | null;
}

// ========================================
// Billing Types
// ========================================

export interface Plan {
    id: "free" | "pro" | "enterprise";
    name: string;
    price: number;
    priceId?: string;
    features: string[];
    limits: {
        queries: number;
        contentRecs: number;
    };
}

export const PLANS: Record<string, Plan> = {
    free: {
        id: "free",
        name: "Free",
        price: 0,
        features: [
            "10 queries/month",
            "3 content recommendations",
            "Basic review insights",
        ],
        limits: {
            queries: 10,
            contentRecs: 3,
        },
    },
    pro: {
        id: "pro",
        name: "Pro",
        price: 79,
        // Note: priceId should be set from server-side environment variables
        features: [
            "50 queries/month",
            "15 content recommendations",
            "Competitor comparison",
            "Email reports",
        ],
        limits: {
            queries: 50,
            contentRecs: 15,
        },
    },
    enterprise: {
        id: "enterprise",
        name: "Enterprise",
        price: 149,
        // Note: priceId should be set from server-side environment variables
        features: [
            "100 queries/month",
            "30 content recommendations",
            "Advanced analytics",
            "Priority support",
            "Custom integrations",
        ],
        limits: {
            queries: 100,
            contentRecs: 30,
        },
    },
};

/**
 * Get Stripe price ID for a plan - must be called on server side
 */
export function getStripePriceId(planId: string): string | undefined {
    if (typeof window !== "undefined") {
        console.warn("getStripePriceId should only be called on the server");
        return undefined;
    }

    const priceIds: Record<string, string | undefined> = {
        pro: process.env.STRIPE_PRICE_ID_PRO,
        enterprise: process.env.STRIPE_PRICE_ID_ENTERPRISE,
    };

    return priceIds[planId];
}
