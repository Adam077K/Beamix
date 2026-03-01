import { createElement } from 'react'
import { sendEmail } from './send'
import { WelcomeEmail } from '@/components/email/welcome'
import { ScanCompleteEmail } from '@/components/email/scan-complete'
import { AgentCompleteEmail } from '@/components/email/agent-complete'
import { TrialStartEmail } from '@/components/email/trial-start'
import { TrialDay7Email } from '@/components/email/trial-day7'
import { TrialDay12Email } from '@/components/email/trial-day12'
import { TrialExpiredEmail } from '@/components/email/trial-expired'
import { UpgradeConfirmationEmail } from '@/components/email/upgrade-confirmation'
import { InvoiceReceiptEmail } from '@/components/email/invoice-receipt'
import { PaymentFailedEmail } from '@/components/email/payment-failed'
import { CancellationEmail } from '@/components/email/cancellation'
import { WeeklyDigestEmail } from '@/components/email/weekly-digest'
import { RankingDropEmail } from '@/components/email/ranking-drop'
import { CompetitorMovedEmail } from '@/components/email/competitor-moved'
import { MagicLinkEmail } from '@/components/email/magic-link'
import type {
  WelcomeEmailProps,
  ScanCompleteEmailProps,
  AgentCompleteEmailProps,
  TrialStartEmailProps,
  TrialDay7EmailProps,
  TrialDay12EmailProps,
  TrialExpiredEmailProps,
  UpgradeConfirmationEmailProps,
  InvoiceReceiptEmailProps,
  PaymentFailedEmailProps,
  CancellationEmailProps,
  WeeklyDigestEmailProps,
  RankingDropEmailProps,
  CompetitorMovedEmailProps,
  MagicLinkEmailProps,
} from './types'

export async function sendWelcomeEmail(to: string, props: WelcomeEmailProps) {
  return sendEmail({
    to,
    subject: 'Welcome to Beamix!',
    react: createElement(WelcomeEmail, props),
  })
}

export async function sendScanCompleteEmail(to: string, props: ScanCompleteEmailProps) {
  return sendEmail({
    to,
    subject: `Your AI Visibility Score: ${props.score}/100`,
    react: createElement(ScanCompleteEmail, props),
  })
}

export async function sendAgentCompleteEmail(to: string, props: AgentCompleteEmailProps) {
  return sendEmail({
    to,
    subject: `Your ${props.agentName} output is ready`,
    react: createElement(AgentCompleteEmail, props),
  })
}

export async function sendTrialStartEmail(to: string, props: TrialStartEmailProps) {
  return sendEmail({
    to,
    subject: 'Your 14-day trial starts now',
    react: createElement(TrialStartEmail, props),
  })
}

export async function sendTrialDay7Email(to: string, props: TrialDay7EmailProps) {
  return sendEmail({
    to,
    subject: "7 days in — here's your progress",
    react: createElement(TrialDay7Email, props),
  })
}

export async function sendTrialDay12Email(to: string, props: TrialDay12EmailProps) {
  return sendEmail({
    to,
    subject: `${props.daysLeft} days left on your trial`,
    react: createElement(TrialDay12Email, props),
  })
}

export async function sendTrialExpiredEmail(to: string, props: TrialExpiredEmailProps) {
  return sendEmail({
    to,
    subject: 'Your trial has ended — your data is safe',
    react: createElement(TrialExpiredEmail, props),
  })
}

export async function sendUpgradeConfirmationEmail(to: string, props: UpgradeConfirmationEmailProps) {
  return sendEmail({
    to,
    subject: `You're now on the ${props.planName} plan!`,
    react: createElement(UpgradeConfirmationEmail, props),
  })
}

export async function sendInvoiceReceiptEmail(to: string, props: InvoiceReceiptEmailProps) {
  return sendEmail({
    to,
    subject: `Payment receipt: ${props.currency}${props.amount}`,
    react: createElement(InvoiceReceiptEmail, props),
  })
}

export async function sendPaymentFailedEmail(to: string, props: PaymentFailedEmailProps) {
  return sendEmail({
    to,
    subject: 'Payment failed — please update your payment method',
    react: createElement(PaymentFailedEmail, props),
  })
}

export async function sendCancellationEmail(to: string, props: CancellationEmailProps) {
  return sendEmail({
    to,
    subject: "We're sorry to see you go",
    react: createElement(CancellationEmail, props),
  })
}

export async function sendWeeklyDigestEmail(to: string, props: WeeklyDigestEmailProps) {
  return sendEmail({
    to,
    subject: `Weekly digest: ${props.newRecommendations} new tips`,
    react: createElement(WeeklyDigestEmail, props),
  })
}

export async function sendRankingDropEmail(to: string, props: RankingDropEmailProps) {
  return sendEmail({
    to,
    subject: `Ranking dropped on ${props.engine} for "${props.query}"`,
    react: createElement(RankingDropEmail, props),
  })
}

export async function sendCompetitorMovedEmail(to: string, props: CompetitorMovedEmailProps) {
  return sendEmail({
    to,
    subject: `${props.competitorName} overtook you on ${props.engine}`,
    react: createElement(CompetitorMovedEmail, props),
  })
}

export async function sendMagicLinkEmail(to: string, props: MagicLinkEmailProps) {
  return sendEmail({
    to,
    subject: 'Your Beamix login link',
    react: createElement(MagicLinkEmail, props),
  })
}
