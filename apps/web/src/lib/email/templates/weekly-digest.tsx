// PILOT CAVEATS (W2.2):
// 1. approveUrl / approveAllUrl are placeholder strings — real signed URLs + /approval/:id endpoint land in W2.3
// 2. unsubscribeUrl stubbed as '#' — real subscription management is W3+
// 3. customerTier prop in schema but not used to gate sections in pilot — available for future tier-specific rendering

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface WeeklyDigestProps {
  digestId: string
  customerName: string
  customerTier: 'starter' | 'growth' | 'scale' | 'professional'
  weekOf: string
  subjectLine: string
  previewText: string
  visibilityScore: number
  visibilityDelta: number
  enginesTracked: number
  narrativeLine: string
  wins: Array<{
    title: string
    type: 'schema' | 'faq' | 'citation' | 'content' | 'outreach'
    publishedAt: string
  }>
  approvalIntroLine: string
  pendingApprovals: Array<{
    id: string
    title: string
    type: 'schema' | 'faq' | 'citation' | 'content' | 'outreach'
    approveUrl: string
    previewSnippet: string
  }>
  approveAllUrl: string
  nextWeekPreview: string
  unsubscribeUrl: string
}

// ---------------------------------------------------------------------------
// Constants & Helpers
// ---------------------------------------------------------------------------
const APP_URL = 'https://app.beamixai.com'

const WIN_TYPE_LABELS: Record<WeeklyDigestProps['wins'][number]['type'], string> = {
  schema: 'Schema',
  faq: 'FAQ',
  citation: 'Citation',
  content: 'Content',
  outreach: 'Outreach',
}

function getScoreColor(score: number): string {
  if (score >= 75) return '#06B6D4'
  if (score >= 50) return '#10B981'
  if (score >= 25) return '#F59E0B'
  return '#EF4444'
}

function getDeltaColor(delta: number): string {
  if (delta > 0) return '#10B981'
  if (delta < 0) return '#EF4444'
  return '#6B7280'
}

function getDeltaText(delta: number): string {
  if (delta > 0) return `+${delta}`
  if (delta < 0) return `−${Math.abs(delta)}`
  return '—'
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = {
  main: {
    backgroundColor: '#F7F7F7',
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  container: {
    maxWidth: '580px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  logoSection: {
    paddingBottom: '24px',
  },
  logoText: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#0A0A0A',
    letterSpacing: '-0.5px',
    margin: '0',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
    padding: '40px 40px 32px',
  },
  sectionHeading: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#0A0A0A',
    lineHeight: '1.3',
    margin: '0 0 16px',
    letterSpacing: '-0.2px',
  },
  bodyText: {
    fontSize: '15px',
    color: '#374151',
    lineHeight: '1.6',
    margin: '0 0 16px',
  },
  mutedText: {
    fontSize: '14px',
    color: '#6B7280',
    lineHeight: '1.6',
    margin: '0 0 16px',
  },
  // Score badge — color overridden inline per visibilityScore range (badge only, never buttons/links)
  scoreBadge: {
    fontSize: '48px',
    fontWeight: '700',
    color: '#0A0A0A',
    lineHeight: '1',
    margin: '0 0 4px',
    letterSpacing: '-1px',
  },
  // Delta label — color overridden inline per visibilityDelta sign
  deltaLabel: {
    fontSize: '14px',
    fontWeight: '600',
    margin: '0 0 16px',
  },
  winTitle: {
    fontSize: '15px',
    color: '#374151',
    lineHeight: '1.5',
    margin: '0 0 12px',
  },
  // Small uppercase type label above each win title
  typeBadge: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    marginRight: '8px',
    marginBottom: '4px',
  },
  approvalTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#0A0A0A',
    lineHeight: '1.4',
    margin: '0 0 6px',
  },
  approvalSnippet: {
    fontSize: '14px',
    color: '#6B7280',
    lineHeight: '1.5',
    margin: '0 0 12px',
  },
  ctaButton: {
    backgroundColor: '#3370FF',
    color: '#FFFFFF',
    borderRadius: '8px',
    padding: '12px 28px',
    fontSize: '15px',
    fontWeight: '500',
    textDecoration: 'none',
    display: 'inline-block',
    marginTop: '8px',
  },
  approveAllLink: {
    fontSize: '14px',
    color: '#3370FF',
    textDecoration: 'none',
    fontWeight: '500',
  },
  divider: {
    borderColor: '#E5E7EB',
    margin: '28px 0',
  },
  itemDivider: {
    borderColor: '#E5E7EB',
    margin: '16px 0',
  },
  // Hardcoded footer close line — centered, muted
  footerCloseText: {
    fontSize: '14px',
    color: '#6B7280',
    lineHeight: '1.6',
    margin: '0 0 24px',
    textAlign: 'center' as const,
  },
  footer: {
    textAlign: 'center' as const,
    paddingTop: '24px',
  },
  footerText: {
    fontSize: '13px',
    color: '#9CA3AF',
    lineHeight: '1.5',
    margin: '0',
  },
  unsubscribeLink: {
    color: '#9CA3AF',
    fontSize: '13px',
    textDecoration: 'underline',
  },
} as const

// ---------------------------------------------------------------------------
// Template
// ---------------------------------------------------------------------------
export function WeeklyDigestEmail({
  previewText,
  visibilityScore,
  visibilityDelta,
  enginesTracked,
  narrativeLine,
  wins,
  approvalIntroLine,
  pendingApprovals,
  approveAllUrl,
  nextWeekPreview,
  unsubscribeUrl,
}: WeeklyDigestProps): React.ReactElement {
  const currentYear = new Date().getFullYear()
  const scoreColor = getScoreColor(visibilityScore)
  const deltaColor = getDeltaColor(visibilityDelta)
  const deltaText = getDeltaText(visibilityDelta)
  const displayedWins = wins.slice(0, 3)
  const hasMoreWins = wins.length > 3
  const hasPendingApprovals = pendingApprovals.length > 0

  return (
    <Html lang="en">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          {/* Logo */}
          <Section style={styles.logoSection}>
            <Text style={styles.logoText}>Beamix</Text>
          </Section>

          {/* Card */}
          <Section style={styles.card}>

            {/* ── Section 1: Visibility Delta ─────────────────────────── */}
            <Heading as="h2" style={styles.sectionHeading}>
              This week
            </Heading>

            {/* Score badge — score color on data viz only, never on buttons/links */}
            <Text style={{ ...styles.scoreBadge, color: scoreColor }}>
              {visibilityScore}
            </Text>
            <Text style={{ ...styles.deltaLabel, color: deltaColor }}>
              {deltaText}
            </Text>

            <Text style={styles.bodyText}>{narrativeLine}</Text>
            <Text style={styles.mutedText}>
              Tracked across {enginesTracked} AI engines
            </Text>

            <Hr style={styles.divider} />

            {/* ── Section 2: Wins This Week ────────────────────────────── */}
            {wins.length > 0 ? (
              <>
                <Heading as="h2" style={styles.sectionHeading}>
                  Done this week
                </Heading>
                {displayedWins.map((win, index) => (
                  <React.Fragment key={index}>
                    <Text style={styles.typeBadge}>
                      {WIN_TYPE_LABELS[win.type]}
                    </Text>
                    <Text style={styles.winTitle}>{win.title}</Text>
                  </React.Fragment>
                ))}
                {hasMoreWins && (
                  <Link href={`${APP_URL}/home`} style={styles.approveAllLink}>
                    See all {wins.length} wins →
                  </Link>
                )}
              </>
            ) : (
              /* Edge case: no wins — skip heading, render muted placeholder */
              <Text style={styles.mutedText}>
                Your team is building your foundation this week. First
                deliverables land next week.
              </Text>
            )}

            <Hr style={styles.divider} />

            {/* ── Section 3: Approvals (conditional — skipped entirely when empty) ─ */}
            {hasPendingApprovals && (
              <>
                <Heading as="h2" style={styles.sectionHeading}>
                  Waiting for your approval
                </Heading>
                <Text style={styles.bodyText}>{approvalIntroLine}</Text>

                {pendingApprovals.map((approval, index) => (
                  <React.Fragment key={approval.id}>
                    <Text style={styles.approvalTitle}>{approval.title}</Text>
                    <Text style={styles.approvalSnippet}>
                      {approval.previewSnippet}
                    </Text>
                    {/* PILOT: approveUrl is a placeholder — real signed URLs land in W2.3 */}
                    <Button href={approval.approveUrl} style={styles.ctaButton}>
                      Approve →
                    </Button>
                    {index < pendingApprovals.length - 1 && (
                      <Hr style={styles.itemDivider} />
                    )}
                  </React.Fragment>
                ))}

                {pendingApprovals.length > 1 && (
                  <Text style={{ margin: '20px 0 0' }}>
                    <Link href={approveAllUrl} style={styles.approveAllLink}>
                      Approve all {pendingApprovals.length} items →
                    </Link>
                  </Text>
                )}

                <Hr style={styles.divider} />
              </>
            )}

            {/* ── Section 4: Next Week ─────────────────────────────────── */}
            <Heading as="h2" style={styles.sectionHeading}>
              Next week
            </Heading>
            <Text style={styles.bodyText}>{nextWeekPreview}</Text>

            <Hr style={styles.divider} />

            {/* ── Section 5: Footer Close (hardcoded — not a prop) ────── */}
            <Text style={styles.footerCloseText}>
              Questions about your digest? Reply to this email.
            </Text>

          </Section>

          {/* Standard Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              © {currentYear} Beamix. All rights reserved.
              <br />
              {/* PILOT: unsubscribeUrl stubbed */}
              <Link href={unsubscribeUrl} style={styles.unsubscribeLink}>
                Unsubscribe
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default WeeklyDigestEmail

// ---------------------------------------------------------------------------
// Mock fixture
// ---------------------------------------------------------------------------
export const weeklyDigestDefaultProps: WeeklyDigestProps = {
  digestId: 'dig_01HX2Y3Z4W5V',
  customerName: 'Goldstein & Partners',
  customerTier: 'growth',
  weekOf: '2026-05-25',
  subjectLine: 'Your Beamix week — May 25',
  previewText:
    'Your visibility score reached 58 this week — and 2 items need your sign-off.',
  visibilityScore: 58,
  visibilityDelta: 9,
  enginesTracked: 5,
  narrativeLine:
    'Your visibility score reached 58 this week — up 9 points across 5 AI engines.',
  wins: [
    {
      title: 'Pushed schema markup to your homepage and 3 service pages.',
      type: 'schema',
      publishedAt: '2026-05-27',
    },
    {
      title: 'Submitted a citation to Yelp, LinkedIn, and Healthgrades.',
      type: 'citation',
      publishedAt: '2026-05-26',
    },
  ],
  approvalIntroLine: '2 items are ready. One click each, or approve all at once.',
  pendingApprovals: [
    {
      id: 'aq_01',
      title: 'An FAQ update for your website homepage',
      type: 'faq',
      approveUrl: 'https://app.beamixai.com/approval/aq_01?token=PLACEHOLDER',
      previewSnippet:
        '"What services does Goldstein & Partners offer?" — Updated answer targeting \'personal injury lawyer Tel Aviv\' queries.',
    },
    {
      id: 'aq_02',
      title: 'Schema markup for your services page',
      type: 'schema',
      approveUrl: 'https://app.beamixai.com/approval/aq_02?token=PLACEHOLDER',
      previewSnippet:
        'LocalBusiness schema with specialties array and FAQ block. Targets Google AI Overviews and Perplexity.',
    },
  ],
  approveAllUrl: 'https://app.beamixai.com/approval/all?token=PLACEHOLDER',
  nextWeekPreview:
    'Next week, your team submits citation fixes to 5 directories and reviews your schema score on Bing.',
  unsubscribeUrl: '#',
}
