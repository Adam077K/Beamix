/**
 * Refund confirmation email template (React Email).
 * Sent via Resend when processRefund completes successfully.
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
} from '@react-email/components'
import * as React from 'react'

export interface RefundConfirmationEmailProps {
  firstName: string
}

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
    margin: '0 0 16px',
  },
  mutedText: {
    fontSize: '14px',
    color: '#6B7280',
    lineHeight: '1.6',
    margin: '0 0 16px',
  },
  divider: { borderColor: '#E5E7EB', margin: '28px 0' },
  footer: { textAlign: 'center' as const, paddingTop: '24px' },
  footerText: {
    fontSize: '13px',
    color: '#9CA3AF',
    lineHeight: '1.5',
    margin: '0',
  },
} as const

export function RefundConfirmationEmail({
  firstName,
}: RefundConfirmationEmailProps): React.ReactElement {
  const previewText = `Your Beamix subscription has been cancelled and your refund is on its way.`

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
              Your subscription has been cancelled, {firstName}.
            </Heading>

            <Text style={styles.bodyText}>
              We&apos;ve processed your cancellation and your refund is on its way. Depending
              on your bank, it typically takes 5–10 business days to appear on your statement.
            </Text>

            <Text style={styles.bodyText}>
              Your account data and scan history are preserved. If you&apos;d like to pick up
              where you left off in the future, you can reactivate at any time.
            </Text>

            <Hr style={styles.divider} />

            <Text style={styles.mutedText}>
              Questions? Reply to this email — a real person will get back to you within
              one business day.
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
  )
}

export default RefundConfirmationEmail
