/**
 * Success Nudge — weekly proactive email template.
 *
 * Owned by Customer Success Agent (Wave 2). Sent on Sundays per customer
 * local time on a weekly cadence, or when triggered by `approval.rejected`
 * or `deliverables.over_cap` Inngest events.
 *
 * Voice Canon Model B: signed "Beamix" implicitly. NEVER references the agent
 * by name. NEVER says "AI", "automated", "this is a bot".
 *
 * Per Principle #9 (no agent names in customer-facing copy) — the only voice
 * the recipient hears here is Beamix.
 */

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
export interface SuccessNudgeEmailProps {
  firstName: string;
  businessName: string;
  /** 1–3 short bullet lines summarising last week's wins, in customer voice. */
  highlights: string[];
  /** What is queued for the coming week — keeps customer feeling work is in motion. */
  comingUp: string[];
  /**
   * Optional CTA — link back to dashboard. When omitted, the email is purely
   * informational and reads softer.
   */
  ctaUrl?: string;
  ctaLabel?: string;
}

// ---------------------------------------------------------------------------
// Styles — match `approval-pending.tsx` for visual consistency
// ---------------------------------------------------------------------------
const styles = {
  main: {
    backgroundColor: '#F7F7F7',
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  container: { maxWidth: '580px', margin: '0 auto', padding: '40px 20px' },
  logoSection: { paddingBottom: '24px' },
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
  heading: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#0A0A0A',
    lineHeight: '1.3',
    margin: '0 0 16px',
    letterSpacing: '-0.3px',
  },
  bodyText: {
    fontSize: '15px',
    color: '#374151',
    lineHeight: '1.6',
    margin: '0 0 12px',
  },
  sectionLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#0A0A0A',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    margin: '20px 0 8px',
  },
  bullet: {
    fontSize: '15px',
    color: '#374151',
    lineHeight: '1.6',
    margin: '0 0 6px',
  },
  ctaButton: {
    backgroundColor: '#3370FF',
    color: '#FFFFFF',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: '500',
    textDecoration: 'none',
    display: 'inline-block',
    marginTop: '20px',
  },
  divider: { borderColor: '#E5E7EB', margin: '28px 0' },
  footer: { textAlign: 'center' as const, paddingTop: '24px' },
  footerText: {
    fontSize: '13px',
    color: '#9CA3AF',
    lineHeight: '1.5',
    margin: '0',
  },
} as const;

// ---------------------------------------------------------------------------
// Template
// ---------------------------------------------------------------------------
export function SuccessNudgeEmail({
  firstName,
  businessName,
  highlights,
  comingUp,
  ctaUrl,
  ctaLabel,
}: SuccessNudgeEmailProps): React.ReactElement {
  const previewText = `${businessName} — this week in AI search visibility`;

  return (
    <Html lang="en">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          <Section style={styles.logoSection}>
            <Text style={styles.logoText}>Beamix</Text>
          </Section>

          <Section style={styles.card}>
            <Heading as="h1" style={styles.heading}>
              {firstName}, here&apos;s where {businessName} stands this week.
            </Heading>

            <Text style={styles.bodyText}>
              A short note so you can see what moved and what&apos;s next. No action
              needed unless you want to weigh in.
            </Text>

            {highlights.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>This past week</Text>
                {highlights.map((line, idx) => (
                  <Text key={`hl-${idx}`} style={styles.bullet}>
                    • {line}
                  </Text>
                ))}
              </>
            )}

            {comingUp.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>Coming up</Text>
                {comingUp.map((line, idx) => (
                  <Text key={`up-${idx}`} style={styles.bullet}>
                    • {line}
                  </Text>
                ))}
              </>
            )}

            {ctaUrl && (
              <a href={ctaUrl} style={styles.ctaButton}>
                {ctaLabel ?? 'Open dashboard'}
              </a>
            )}

            <Hr style={styles.divider} />

            <Text style={styles.bodyText}>
              Reply to this email if anything looks off — we read every reply.
            </Text>
          </Section>

          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              © {new Date().getFullYear()} Beamix. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default SuccessNudgeEmail;
