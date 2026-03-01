export interface WelcomeEmailProps {
  name: string
  scanId?: string
  scanScore?: number
}

export interface ScanCompleteEmailProps {
  businessName: string
  score: number
  scoreColor: string
  quickWins: string[]
  scanId: string
}

export interface AgentCompleteEmailProps {
  agentName: string
  outputPreview: string
  executionId: string
}

export interface TrialStartEmailProps {
  name: string
  planName: string
  trialEndDate: string
  unlockedFeatures: string[]
}

export interface TrialDay7EmailProps {
  name: string
  currentScore: number
  contentGenerated: number
  daysLeft: number
}

export interface TrialDay12EmailProps {
  name: string
  daysLeft: number
  featuresAtRisk: string[]
}

export interface TrialExpiredEmailProps {
  name: string
  planName: string
}

export interface UpgradeConfirmationEmailProps {
  name: string
  planName: string
  monthlyCredits: number
  maxQueries: number
  features: string[]
}

export interface InvoiceReceiptEmailProps {
  name: string
  amount: string
  currency: string
  date: string
  planName: string
  invoiceUrl: string
}

export interface PaymentFailedEmailProps {
  name: string
  amount: string
  retryUrl: string
  updatePaymentUrl: string
}

export interface CancellationEmailProps {
  name: string
  planName: string
  activeUntil: string
  reactivateUrl: string
}

export interface WeeklyDigestEmailProps {
  name: string
  rankChange: number
  newRecommendations: number
  contentUpdates: number
  topQuery: string
  topQueryScore: number
}

export interface RankingDropEmailProps {
  name: string
  businessName: string
  engine: string
  query: string
  previousPosition: number
  currentPosition: number
  suggestion: string
}

export interface CompetitorMovedEmailProps {
  name: string
  competitorName: string
  engine: string
  query: string
  competitorPosition: number
  yourPosition: number
}

export interface MagicLinkEmailProps {
  magicLink: string
}

export type EmailTemplate =
  | 'welcome'
  | 'scan-complete'
  | 'agent-complete'
  | 'trial-start'
  | 'trial-day7'
  | 'trial-day12'
  | 'trial-expired'
  | 'upgrade-confirmation'
  | 'invoice-receipt'
  | 'payment-failed'
  | 'cancellation'
  | 'weekly-digest'
  | 'ranking-drop'
  | 'competitor-moved'
  | 'magic-link'
